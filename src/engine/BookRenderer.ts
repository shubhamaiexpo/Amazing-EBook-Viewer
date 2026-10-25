import * as THREE from "three";
import { damp, reduceMotion } from "$lib/motion";
import { bookShadowCanvas, roundedPageCanvas, STACK_TONES } from "./canvasArt";
import { curlPage } from "./pageCurl";
import { cropTex, ribbonArt, type RibbonStyle } from "./ribbonArt";
import { createTurnMaterial } from "./turnMaterial";

/** A ribbon to draw. `x` is -1..1 across the open book; `here` = its page is open, so it lies across the page. */
export interface RibbonSpec {
  key: string;
  x: number;
  here: boolean;
  color: string;
  page: number;
  label: string;
}

/** How a scene lights the book. */
export interface BookLook {
  tint: [number, number, number];
  shadow: number;
  /** -1 left, 0 above, 1 right */
  light: number;
  trueColour: boolean;
  /** Shadow strength the person chose: 0 = none, 1 = as the scene sets it, 2 = twice as dark. */
  shadowStrength: number;
}

interface RibbonMesh {
  spec: RibbonSpec;
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  shadow: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  reach: number;
  baseY: number;
  shBaseY: number;
  lift: number;
  liftTo: number;
}

type PageMesh = THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;

/**
 * Draws the open book with Three.js: two flat pages, fanned sheets behind them, a soft shadow,
 * the turning page and the ribbons. It knows nothing about PDFs; the reader hands it textures.
 *
 * Coordinates: the spine is at x = 0, a page is W wide and H tall, centred on y = 0.
 */
export class BookRenderer {
  readonly renderer: THREE.WebGLRenderer;
  readonly camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  private readonly scene = new THREE.Scene();
  private readonly group = new THREE.Group();

  H = 1.4;
  W = 1.0;
  /** True while a page is being turned. */
  turning = false;
  private turnDir: 1 | -1 = 1;
  private tilt = 0;
  private tiltTarget = 0;
  private portrait = false;
  private lightSide = 0;
  private shadowK = 1;
  private readonly tint = new THREE.Color(1, 1, 1);
  private tintTo: THREE.Color | null = null;
  private tintSet = false;
  private readonly lightDir = new THREE.Vector3(-0.5, 0.4, 0.8).normalize();

  private readonly left: PageMesh;
  private readonly right: PageMesh;
  private readonly shadow: PageMesh;
  private readonly stackL: PageMesh[] = [];
  private readonly stackR: PageMesh[] = [];
  private readonly stackTex = new Map<string, THREE.Texture>();
  private readonly turnGeo = new THREE.PlaneGeometry(1, 1, 40, 24);
  private readonly turnBase: Float32Array;
  private readonly turnMat: THREE.ShaderMaterial;
  private readonly turnMesh: THREE.Mesh;
  private readonly curlShadow: PageMesh;
  private readonly ribbonGroup = new THREE.Group();

  private ribbons: RibbonMesh[] = [];
  private ribbonSig = "";
  private ribbonPending: { list: RibbonSpec[]; style: RibbonStyle; sig: string } | null = null;
  private ribbonFade = 0;
  private ribbonFadeTo = 1;

  constructor(canvas: HTMLCanvasElement) {
    // match the prototype's look: textures are shown as painted, with no colour conversion
    THREE.ColorManagement.enabled = false;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    this.scene.add(this.group);

    const flat = (z: number): PageMesh => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        new THREE.MeshBasicMaterial({ transparent: true, alphaTest: 0.5 }),
      );
      m.position.z = z;
      this.group.add(m);
      return m;
    };
    this.shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(bookShadowCanvas()),
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      }),
    );
    this.shadow.position.z = -0.05;
    this.group.add(this.shadow);
    for (let i = 0; i < 5; i++) {
      this.stackL.push(flat(-0.004 - i * 0.004));
      this.stackR.push(flat(-0.004 - i * 0.004));
    }
    this.left = flat(0);
    this.right = flat(0);

    this.turnBase = this.turnGeo.attributes.position.array.slice() as Float32Array;
    this.turnMat = createTurnMaterial(this.lightDir, this.tint);
    this.turnMesh = new THREE.Mesh(this.turnGeo, this.turnMat);
    this.turnMesh.visible = false;
    this.turnMesh.position.z = 0.001;
    this.group.add(this.turnMesh);

    this.curlShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ color: 0x2a1a08, transparent: true, opacity: 0, depthWrite: false }),
    );
    this.curlShadow.position.z = 0.0005;
    this.group.add(this.curlShadow);
    this.group.add(this.ribbonGroup);
    this.resize();
  }

  get maxAnisotropy(): number {
    return this.renderer.capabilities.getMaxAnisotropy();
  }

  /** Width ÷ height of one page, from the PDF. */
  setPageAspect(ratio: number): void {
    this.W = this.H * ratio;
    const { W, H } = this;
    this.left.scale.set(W, H, 1);
    this.left.position.x = -W / 2;
    this.right.scale.set(W, H, 1);
    this.right.position.x = W / 2;
    this.shadow.scale.set(W * 2 * 1.45, H * 1.6, 1);
    this.resize();
  }

  resize(): void {
    const w = innerWidth,
      h = innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.portrait = w / h < 0.95;
    const bookW = this.portrait ? this.W * 1.12 : this.W * 2 * 1.1,
      bookH = this.H * 1.28;
    const vfov = (this.camera.fov * Math.PI) / 180;
    const distH = bookH / 2 / Math.tan(vfov / 2);
    const distW = bookW / 2 / (Math.tan(vfov / 2) * this.camera.aspect);
    const dist = Math.max(distH, distW) * 1.13; // room above the book for ribbons
    const lookY = this.H * 0.045;
    const x = this.portrait ? this.W / 2 : 0;
    this.camera.position.set(x, lookY, dist);
    this.camera.lookAt(x, lookY, 0);
    this.camera.updateProjectionMatrix();
  }

  setLook(look: BookLook): void {
    this.lightSide = look.light;
    this.lightDir.set(look.light * 0.6, 0.45, 0.75).normalize();
    this.shadowK = look.shadowStrength;
    this.shadow.material.opacity = Math.min(1, look.shadow * look.shadowStrength);
    this.layoutRibbons();
    this.shadow.position.y = -0.06;
    this.tintTo = look.trueColour ? new THREE.Color(1, 1, 1) : new THREE.Color(...look.tint);
    if (!this.tintSet || reduceMotion) {
      this.tint.copy(this.tintTo);
      this.tintSet = true;
      this.paintTint();
    }
    this.turnMat.uniforms.lit.value = look.trueColour ? 0.35 : 1;
  }

  setPages(leftTex: THREE.Texture | null, rightTex: THREE.Texture | null): void {
    const set = (m: PageMesh, t: THREE.Texture | null) => {
      m.material.map = t;
      m.material.needsUpdate = true;
      m.visible = !!t;
    };
    set(this.left, leftTex);
    set(this.right, rightTex);
    // the shadow on the scene only sits under the pages that are showing
    const both = !!leftTex && !!rightTex;
    this.shadow.scale.set(this.W * (both ? 2 : 1) * 1.45, this.H * 1.6, 1);
    this.shadow.position.x = (both ? 0 : leftTex ? -this.W / 2 : this.W / 2) - this.lightSide * 0.07 * this.W;
  }

  /** Fanned sheets: more behind the side that holds more pages. */
  setStacks(readFrac: number, total: number): void {
    const nL = total < 3 ? 0 : Math.min(5, Math.ceil(readFrac * 5 + (readFrac > 0 ? 0.5 : 0)));
    const nR = total < 3 ? 0 : Math.min(5, Math.ceil((1 - readFrac) * 5));
    const texFor = (i: number, right: boolean) => {
      const key = i + (right ? "R" : "L") + this.W.toFixed(3);
      let t = this.stackTex.get(key);
      if (!t) {
        t = new THREE.CanvasTexture(
          roundedPageCanvas(null, 64, Math.round((64 * this.H) / this.W), right, STACK_TONES[i]),
        );
        this.stackTex.set(key, t);
      }
      return t;
    };
    this.stackL.forEach((m, i) => {
      m.visible = i < nL;
      if (!m.visible) return;
      m.material.map = texFor(i, false);
      m.material.needsUpdate = true;
      m.scale.set(this.W, this.H, 1);
      // each sheet tilts about its spine end, so it fans out at the outer edge and stays tucked in at the spine
      const a = (i + 1) * 0.006;
      m.rotation.z = a;
      m.position.set(-this.W / 2 - (i + 1) * 0.012, (-this.W / 2) * Math.sin(a), m.position.z);
    });
    this.stackR.forEach((m, i) => {
      m.visible = i < nR;
      if (!m.visible) return;
      m.material.map = texFor(i, true);
      m.material.needsUpdate = true;
      m.scale.set(this.W, this.H, 1);
      const a = -(i + 1) * 0.003;
      m.rotation.z = a;
      m.position.set(this.W / 2 + (i + 1) * 0.006, (this.W / 2) * Math.sin(a), m.position.z);
    });
  }

  /**
   * Ribbons are rebuilt only when what you'd see actually changes, and never mid-turn:
   * they fade out as a page lifts and settle back in once it has landed, so nothing pops or jumps.
   */
  setRibbons(list: RibbonSpec[], style: RibbonStyle): void {
    const sig =
      style +
      "|" +
      this.W.toFixed(4) +
      "x" +
      this.H.toFixed(4) +
      "|" +
      list.map((r) => [r.key, r.x.toFixed(3), r.here ? 1 : 0, r.color].join(":")).join(",");
    this.ribbonPending = { list, style, sig };
    if (this.turning) return;
    if (sig === this.ribbonSig) {
      this.ribbonPending = null;
      this.ribbonFadeTo = 1;
      return;
    }
    if (this.ribbonFade > 0.01 && !reduceMotion)
      this.ribbonFadeTo = 0; // frame() swaps once faded
    else this.applyRibbons();
  }

  private applyRibbons(): void {
    const p = this.ribbonPending;
    if (!p) return;
    this.ribbonPending = null;
    this.ribbonSig = p.sig;
    for (const r of this.ribbons) {
      r.mesh.geometry.dispose();
      r.mesh.material.dispose();
      r.shadow.geometry.dispose();
      r.shadow.material.dispose();
    }
    this.ribbonGroup.clear();
    this.ribbons = [];
    const { W, H } = this;
    // width, length, and how much of it lies on the page
    const dims: Record<RibbonStyle, [number, number, number]> = {
      satin: [0.06 * W, 0.2 * H, 0.1 * H],
      tab: [0.1 * W, 0.12 * H, 0.035 * H],
      tassel: [0.11 * W, 0.24 * H, 0.11 * H],
    };
    const [w, h, over] = dims[p.style] ?? dims.satin;
    for (const spec of p.list) {
      const art = ribbonArt(spec.color, p.style, spec.page + 1, over / h);
      // ribbons for other pages are tucked between the sheets, so only the end above the book shows
      const keep = spec.here ? 1 : (h - over) / h;
      const shOff = spec.here ? 0 : (art.padPx + (over / h) * art.chPx) / (art.chPx + 2 * art.padPx),
        shKeep = 1 - shOff;
      const hs = h * art.padY * shKeep;
      const shadow = new THREE.Mesh(
        new THREE.PlaneGeometry(w * art.pad, hs),
        new THREE.MeshBasicMaterial({
          map: cropTex(art.shadow, shKeep, shOff),
          transparent: true,
          opacity: 0,
          depthWrite: false,
        }),
      );
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h * keep),
        new THREE.MeshBasicMaterial({
          map: cropTex(art.tex, keep, 1 - keep),
          transparent: true,
          opacity: 0,
          depthWrite: false,
        }),
      );
      const x = spec.x * W,
        top = H / 2 + h - over,
        y = top - (h * keep) / 2;
      const shTop = H / 2 + h / 2 - over + (h * art.padY) / 2;
      mesh.position.set(x, y, 0.004);
      shadow.position.set(x + 0.01 * W, shTop - hs / 2 - (spec.here ? 0.012 : 0.004) * H, 0.0035);
      mesh.renderOrder = 3;
      shadow.renderOrder = 2;
      this.ribbonGroup.add(shadow, mesh);
      this.ribbons.push({
        spec,
        mesh,
        shadow,
        reach: spec.here ? 1 : 0.35,
        baseY: y,
        shBaseY: shadow.position.y,
        lift: 0,
        liftTo: 0,
      });
    }
    this.ribbonFade = 0;
    this.ribbonFadeTo = 1;
    this.layoutRibbons();
  }

  private layoutRibbons(): void {
    // fade + a short settle: ribbons drop the last few millimetres into place as they appear
    const f = this.ribbonFade,
      e = 1 - Math.pow(1 - f, 3),
      { W, H } = this;
    for (const r of this.ribbons) {
      const rise = (1 - e) * 0.03 * H;
      r.mesh.position.y = r.baseY + r.lift * r.reach * 0.025 * H + rise;
      r.mesh.position.z = 0.004 + r.lift * 0.02;
      r.shadow.position.x = r.mesh.position.x + (0.01 + r.lift * 0.012) * W;
      r.shadow.position.y = r.shBaseY - r.lift * r.reach * 0.01 * H;
      r.shadow.scale.setScalar(1 + r.lift * 0.08);
      r.mesh.material.opacity = f;
      r.mesh.visible = r.shadow.visible = f > 0.01;
      r.shadow.material.opacity = Math.min(1, (0.5 - r.lift * 0.15) * f * f * this.shadowK);
    }
  }

  /** Lift the ribbon under the pointer (pass null to settle them all). */
  hoverRibbon(spec: RibbonSpec | null): void {
    for (const r of this.ribbons) r.liftTo = r.spec === spec ? 1 : 0;
  }

  /** Bend the turning page to progress t (0..1). See pageCurl.ts. */
  curl(t: number, lean: number): void {
    const pos = this.turnGeo.attributes.position;
    const edgeX = curlPage({
      base: this.turnBase,
      out: pos.array as Float32Array,
      W: this.W,
      H: this.H,
      t,
      lean,
      dir: this.turnDir,
    });
    pos.needsUpdate = true;
    // soft shadow the lifted page throws on the page underneath
    const cs = this.curlShadow,
      lift = Math.sin(Math.PI * Math.max(0, Math.min(1, t)));
    if (lift > 0.02) {
      cs.visible = true;
      cs.material.opacity = Math.min(0.6, 0.16 * lift * this.shadowK);
      const span = Math.max(0.02 * this.W, Math.abs(edgeX));
      cs.scale.set(span, this.H, 1);
      cs.position.set((this.turnDir * Math.sign(edgeX || 1) * span) / 2, 0, 0.0005);
    } else cs.visible = false;
  }

  startTurn(dir: 1 | -1, front: THREE.Texture | null, back: THREE.Texture | null): void {
    this.ribbonFadeTo = 0;
    this.hoverRibbon(null);
    this.turning = true;
    this.turnDir = dir;
    this.turnMat.uniforms.front.value = front;
    this.turnMat.uniforms.back.value = back;
    this.turnMat.uniforms.dir.value = dir;
    this.turnMesh.visible = true;
    this.tiltTarget = 1;
  }

  endTurn(): void {
    this.turnMesh.visible = false;
    this.curlShadow.visible = false;
    this.turning = false;
    this.tiltTarget = 0;
  }

  /** Book coordinates to screen pixels. */
  toScreen(x: number, y: number): { x: number; y: number } {
    const v = new THREE.Vector3(x, y, 0);
    this.group.localToWorld(v);
    v.project(this.camera);
    return { x: ((v.x + 1) / 2) * innerWidth, y: ((1 - v.y) / 2) * innerHeight };
  }

  /** What's under a screen point: a ribbon, or a point on the book's plane (in book coordinates). */
  pick(clientX: number, clientY: number): { ribbon: RibbonSpec } | { x: number; y: number } | null {
    const ndc = new THREE.Vector2((clientX / innerWidth) * 2 - 1, -(clientY / innerHeight) * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, this.camera);
    const hit = ray.intersectObjects(
      this.ribbons.map((r) => r.mesh),
      false,
    )[0];
    if (hit) {
      const r = this.ribbons.find((x) => x.mesh === hit.object);
      if (r) return { ribbon: r.spec };
    }
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0).applyMatrix4(this.group.matrixWorld);
    const p = new THREE.Vector3();
    if (!ray.ray.intersectPlane(plane, p)) return null;
    const local = this.group.worldToLocal(p);
    return { x: local.x, y: local.y };
  }

  /** Is a book-plane point on one of the open pages? */
  onPage(p: { x: number; y: number }): boolean {
    return Math.abs(p.y) <= this.H / 2 && Math.abs(p.x) <= this.W;
  }

  private paintTint(): void {
    for (const m of [this.left, this.right, ...this.stackL, ...this.stackR]) m.material.color.copy(this.tint);
  }

  /** Advance animations by dt seconds and draw. Call once per animation frame. */
  frame(dt: number): void {
    let moved = false;
    const kr = damp(dt, 14);
    for (const r of this.ribbons) {
      if (Math.abs(r.liftTo - r.lift) > 0.001) {
        r.lift += (r.liftTo - r.lift) * kr;
        moved = true;
      }
    }
    if (Math.abs(this.ribbonFadeTo - this.ribbonFade) > 0.002) {
      const rate = this.ribbonFadeTo < this.ribbonFade ? 16 : 7;
      this.ribbonFade += (this.ribbonFadeTo - this.ribbonFade) * damp(dt, rate);
      if (Math.abs(this.ribbonFadeTo - this.ribbonFade) <= 0.002) this.ribbonFade = this.ribbonFadeTo;
      moved = true;
    } else if (this.ribbonFadeTo === 0 && !this.turning && this.ribbonPending) this.applyRibbons();
    if (moved) this.layoutRibbons();

    if (this.tintTo && !this.tint.equals(this.tintTo)) {
      this.tint.lerp(this.tintTo, damp(dt, 6));
      const d =
        Math.abs(this.tint.r - this.tintTo.r) +
        Math.abs(this.tint.g - this.tintTo.g) +
        Math.abs(this.tint.b - this.tintTo.b);
      if (d < 0.002) this.tint.copy(this.tintTo);
      this.paintTint();
    }
    this.tilt += (this.tiltTarget - this.tilt) * damp(dt, reduceMotion ? 30 : 5);
    this.group.rotation.x = -0.2 * this.tilt;
    this.group.rotation.z = 0.025 * this.tilt;
    this.group.position.y = 0.04 * this.tilt;
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    this.renderer.dispose();
  }
}
