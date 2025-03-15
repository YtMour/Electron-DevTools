import { app as o, Menu as c, BrowserWindow as s, globalShortcut as r, ipcMain as i } from "electron";
import { createRequire as d } from "node:module";
import { fileURLToPath as u } from "node:url";
import { dirname as f, join as t } from "node:path";
d(import.meta.url);
const a = f(u(import.meta.url));
o.setName("Yt Tools");
c.setApplicationMenu(null);
const p = o.requestSingleInstanceLock();
p || o.quit();
process.env.APP_ROOT = t(a, "..");
const n = process.env.VITE_DEV_SERVER_URL, h = t(process.env.APP_ROOT, "dist-electron"), l = t(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = n ? t(process.env.APP_ROOT, "public") : l;
let e;
function m() {
  e = new s({
    width: 1200,
    height: 800,
    frame: !1,
    autoHideMenuBar: !0,
    titleBarStyle: "hidden",
    title: "Yt Tools",
    icon: t(process.env.VITE_PUBLIC, "favicon.ico"),
    webPreferences: {
      preload: t(a, "preload.mjs"),
      nodeIntegration: !0,
      contextIsolation: !0,
      devTools: !0
      // 启用开发者工具
    }
  }), e.setMenuBarVisibility(!1), e.on("maximize", () => {
    e == null || e.webContents.send("window-maximized-state-changed", !0);
  }), e.on("unmaximize", () => {
    e == null || e.webContents.send("window-maximized-state-changed", !1);
  }), i.on("window-minimize", () => {
    e == null || e.minimize();
  }), i.on("window-maximize", () => {
    e != null && e.isMaximized() ? e.unmaximize() : e == null || e.maximize();
  }), i.on("window-close", () => {
    e == null || e.close();
  }), e.webContents.on("did-finish-load", () => {
    e == null || e.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), r.register("CommandOrControl+Shift+I", () => {
    e != null && e.webContents && e.webContents.toggleDevTools();
  }), n ? e.loadURL(n) : e.loadFile(t(l, "index.html")), e.on("focus", () => {
    e == null || e.setMenuBarVisibility(!1);
  });
}
o.on("second-instance", () => {
  e && (e.isMinimized() && e.restore(), e.focus());
});
o.on("window-all-closed", () => {
  process.platform !== "darwin" && (o.quit(), e = null);
});
o.on("activate", () => {
  s.getAllWindows().length === 0 && m();
});
o.whenReady().then(m);
o.on("will-quit", () => {
  r.unregisterAll();
});
export {
  h as MAIN_DIST,
  l as RENDERER_DIST,
  n as VITE_DEV_SERVER_URL
};
