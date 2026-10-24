import "./app.css";
import { mount } from "svelte";
import App from "./App.svelte";
import { applyTheme } from "$design/themes";
import { trackPresses } from "$lib/pointer";
import { platform } from "$platform/index";
import { loadSettings, settings } from "$stores/settings.svelte";

// Boot order: load saved data, paint the theme, then draw the app (so nothing flashes the wrong colour).
async function start() {
  await platform.init().catch((err) => console.error("Couldn't load saved data", err));
  loadSettings();
  applyTheme(settings.theme);
  trackPresses();
  mount(App, { target: document.getElementById("app")! });
}

void start();
