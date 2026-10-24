import { platform } from "$platform/index";
import { toast } from "$stores/ui.svelte";
import { reader } from "./reader.svelte";

const isPdf = (f: File) => /pdf$/i.test(f.type) || /\.pdf$/i.test(f.name);

/** Ask for a PDF (system dialog on desktop, file picker in a browser) and open it. */
export async function openPicked(): Promise<void> {
  try {
    const picked = await platform.pickPdf();
    if (picked) await reader.open(picked.bytes, picked.name);
  } catch (err) {
    console.error(err);
    toast("That file couldn't be opened. Try another one.");
  }
}

/** Open a PDF the person dropped on the window. */
export async function openDropped(f: File): Promise<void> {
  if (!isPdf(f)) return toast("That isn't a PDF. Choose a file ending in .pdf.");
  await reader.open(new Uint8Array(await f.arrayBuffer()), f.name);
}

/** The storybook that ships with the app, so there's something to read on first launch. */
export async function openSample(): Promise<boolean> {
  try {
    const r = await fetch("sample-storybook.pdf");
    if (!r.ok) return false;
    await reader.open(new Uint8Array(await r.arrayBuffer()), "The Lake Before Morning.pdf");
    return true;
  } catch {
    return false;
  }
}
