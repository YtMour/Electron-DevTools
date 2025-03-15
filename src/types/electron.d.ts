import { IpcRenderer } from 'electron'

declare global {
  interface Window {
    ipcRenderer: {
      on: (channel: string, listener: (...args: any[]) => void) => void
      send: (channel: string, ...args: any[]) => void
      removeListener: (channel: string, listener: (...args: any[]) => void) => void
    }
  }
}

export {} 