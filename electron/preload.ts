import { contextBridge, ipcRenderer } from 'electron'

// 暴露 IPC 通信接口到渲染进程
contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel: string, ...args: any[]) => {
    ipcRenderer.send(channel, ...args)
  },
  on: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args))
  },
  once: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.once(channel, (event, ...args) => func(...args))
  },
  removeListener: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, func)
  }
})
