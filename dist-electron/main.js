import { app, Menu, BrowserWindow, ipcMain } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
app.setName("DevTools Plus");
Menu.setApplicationMenu(null);
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}
process.env.APP_ROOT = join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    autoHideMenuBar: true,
    titleBarStyle: "hidden",
    icon: join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: join(__dirname, "preload.mjs"),
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  win.setMenuBarVisibility(false);
  ipcMain.on("window-minimize", () => {
    win == null ? void 0 : win.minimize();
  });
  ipcMain.on("window-maximize", () => {
    if (win == null ? void 0 : win.isMaximized()) {
      win.unmaximize();
    } else {
      win == null ? void 0 : win.maximize();
    }
  });
  ipcMain.on("window-close", () => {
    win == null ? void 0 : win.close();
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(join(RENDERER_DIST, "index.html"));
  }
  win.on("focus", () => {
    win == null ? void 0 : win.setMenuBarVisibility(false);
  });
}
app.on("second-instance", () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(createWindow);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
