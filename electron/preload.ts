// 使用 CommonJS 风格的导入
const { contextBridge, ipcRenderer } = require('electron')

// 暴露 IPC 通信接口到渲染进程
contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel: string, ...args: any[]) => {
    ipcRenderer.send(channel, ...args)
  },
  on: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (_event: any, ...args: any[]) => func(...args))
  },
  once: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.once(channel, (_event: any, ...args: any[]) => func(...args))
  },
  removeListener: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, func)
  }
})

// 确保模块可以被 CommonJS 和 ESM 导入
module.exports = {}
