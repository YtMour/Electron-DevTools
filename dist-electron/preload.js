import { contextBridge as t, ipcRenderer as r } from "electron";
t.exposeInMainWorld("ipcRenderer", {
  send: (e, ...n) => {
    r.send(e, ...n);
  },
  on: (e, n) => {
    r.on(e, (i, ...o) => n(...o));
  },
  once: (e, n) => {
    r.once(e, (i, ...o) => n(...o));
  },
  removeListener: (e, n) => {
    r.removeListener(e, n);
  }
});
