import * as pdfjs from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

/** A PDF opened for reading. Wraps PDF.js so nothing else in the app imports it. */
export interface PdfBook {
  /** Stable id for saving progress and bookmarks (the PDF's fingerprint, or its file name). */
  id: string;
  title: string;
  pageCount: number;
  /** Width ÷ height of the first page. */
  aspect: number;
  /** Render page `index` (0-based) to a canvas `height` pixels tall. */
  render(index: number, height: number): Promise<HTMLCanvasElement>;
  close(): void;
}

export class PdfError extends Error {
  constructor(
    readonly kind: "password" | "unreadable",
    cause?: unknown,
  ) {
    super(kind, { cause });
  }
}

export async function openPdf(bytes: Uint8Array, fileName: string): Promise<PdfBook> {
  const name = fileName.replace(/\.pdf$/i, "");
  let doc: pdfjs.PDFDocumentProxy;
  try {
    doc = await pdfjs.getDocument({ data: bytes, isEvalSupported: false }).promise;
  } catch (err) {
    throw new PdfError((err as Error)?.name === "PasswordException" ? "password" : "unreadable", err);
  }
  let title = name;
  try {
    const meta = await doc.getMetadata();
    const t = (meta.info as { Title?: string } | undefined)?.Title;
    if (t && t.trim()) title = t.trim();
  } catch {
    /* untitled is fine */
  }
  const vp = (await doc.getPage(1)).getViewport({ scale: 1 });
  return {
    id: doc.fingerprints?.[0] || name,
    title,
    pageCount: doc.numPages,
    aspect: vp.width / vp.height,
    async render(index, height) {
      const page = await doc.getPage(index + 1);
      const scale = height / page.getViewport({ scale: 1 }).height;
      const viewport = page.getViewport({ scale });
      const c = document.createElement("canvas");
      c.width = Math.round(viewport.width);
      c.height = Math.round(viewport.height);
      const g = c.getContext("2d")!;
      g.fillStyle = "#fff";
      g.fillRect(0, 0, c.width, c.height);
      await page.render({ canvasContext: g, viewport }).promise;
      return c;
    },
    close: () => void doc.destroy(),
  };
}
