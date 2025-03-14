import { contextBridge, ipcRenderer } from 'electron'

// 暴露给渲染进程的 API
export const api = {
  // 获取应用版本
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // 这里可以添加更多的 API
}

// 注入 API 到渲染进程
contextBridge.exposeInMainWorld('electronAPI', api)

// 类型声明
declare global {
  interface Window {
    electronAPI: typeof api
  }
} 