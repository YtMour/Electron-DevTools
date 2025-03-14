import { contextBridge, ipcRenderer } from "electron";
const api = {
  // 获取应用版本
  getAppVersion: () => ipcRenderer.invoke("get-app-version")
  // 这里可以添加更多的 API
};
contextBridge.exposeInMainWorld("electronAPI", api);
export {
  api
};
