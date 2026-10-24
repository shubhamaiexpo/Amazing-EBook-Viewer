import { settings, wallpaper } from "$stores/settings.svelte";
import { toast } from "$stores/ui.svelte";

/** Turn a picked image into a downscaled JPEG data URL, small enough to save with the settings. */
export function imageToWallpaper(file: Blob, maxSide = 1920): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image(),
      url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(1, maxSide / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * s);
      c.height = Math.round(img.height * s);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("unreadable image"));
    };
    img.src = url;
  });
}

function pickImage(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => resolve(input.files?.[0] ?? null);
    input.oncancel = () => resolve(null);
    input.click();
  });
}

/** Set the person's wallpaper from a file (dropped), or ask them for one. Switches to the wallpaper scene. */
export async function chooseWallpaper(file?: File | null): Promise<void> {
  const f = file ?? (await pickImage());
  if (!f) return;
  try {
    wallpaper.url = await imageToWallpaper(f);
    settings.scene = "wall";
    toast("Wallpaper set");
  } catch {
    toast("That image couldn't be opened. Try a JPG or PNG.");
  }
}
