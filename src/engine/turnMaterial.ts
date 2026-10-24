import * as THREE from "three";

/**
 * The turning page's material: front texture on one side, back on the other,
 * shaded by its own curve so the bend reads as real paper catching the light.
 */
export function createTurnMaterial(light: THREE.Vector3, tint: THREE.Color): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    transparent: true,
    uniforms: {
      front: { value: null },
      back: { value: null },
      dir: { value: 1 },
      light: { value: light },
      tint: { value: tint },
      lit: { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vPos;
      void main() {
        vUv = uv;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D front;
      uniform sampler2D back;
      uniform float dir;
      uniform vec3 light;
      uniform vec3 tint;
      uniform float lit;
      varying vec2 vUv;
      varying vec3 vPos;
      void main() {
        bool isFront = dir > 0.0 ? gl_FrontFacing : !gl_FrontFacing;
        float fx = dir > 0.0 ? vUv.x : 1.0 - vUv.x;
        vec4 c = isFront ? texture2D(front, vec2(fx, vUv.y)) : texture2D(back, vec2(1.0 - fx, vUv.y));
        if (c.a < 0.5) discard;
        vec3 n = normalize(cross(dFdx(vPos), dFdy(vPos)));
        vec3 v = normalize(cameraPosition - vPos);
        if (dot(n, v) < 0.0) n = -n;
        float d = clamp(dot(n, normalize(light)), 0.0, 1.0);
        float face = clamp(dot(n, v), 0.0, 1.0);
        float shade = mix(1.0, 0.72 + 0.38 * d, lit) * mix(0.82, 1.0, face);
        gl_FragColor = vec4(c.rgb * shade * tint, 1.0);
      }`,
  });
}
