import "./app.css";
import { mount } from "svelte";
import App from "./App.svelte";
import { applyTheme } from "$design/themes";
import { trackPresses } from "$lib/pointer";
import { platform } from "$platform/index";
import { loadSettings, settings } from "$stores/settings.svelte";
import { toast } from "$stores/ui.svelte";

// Show unexpected errors on screen instead of failing silently, so a screenshot tells us what broke.
const report = (what: unknown) => {
  console.error(what);
  const msg = what instanceof Error ? what.message : String(what);
  toast(`Something went wrong: ${msg.slice(0, 140)}`);
};
addEventListener("error", (e) => report(e.error ?? e.message));
addEventListener("unhandledrejection", (e) => report(e.reason));

// Boot order: load saved data, paint the theme, then draw the app (so nothing flashes the wrong colour).
async function start() {
  await platform.init().catch((err) => console.error("Couldn't load saved data", err));
  loadSettings();
  applyTheme(settings.theme);
  trackPresses();
  mount(App, { target: document.getElementById("app")! });
}

void start();
