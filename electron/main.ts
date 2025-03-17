import { app, BrowserWindow, ipcMain, Menu, globalShortcut } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))

// 设置应用名称
app.setName('Yt Tools')

// 禁用菜单栏
Menu.setApplicationMenu(null)

// 单实例锁定
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
}

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.APP_ROOT = join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    title: 'Yt Tools',
    icon: join(process.env.VITE_PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true,
      devTools: true // 启用开发者工具
    },
  })

  // 确保菜单栏不可见
  win.setMenuBarVisibility(false)

  // 监听窗口最大化状态变化
  win.on('maximize', () => {
    win?.webContents.send('window-maximized-state-changed', true)
  })

  win.on('unmaximize', () => {
    win?.webContents.send('window-maximized-state-changed', false)
  })

  // 注册窗口控制事件
  ipcMain.on('window-minimize', () => {
    win?.minimize()
  })

  ipcMain.on('window-maximize', () => {
    if (win?.isMaximized()) {
      win.unmaximize()
    } else {
      win?.maximize()
    }
  })

  ipcMain.on('window-close', () => {
    win?.close()
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  // 注册开发者工具快捷键
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    if (win?.webContents) {
      win.webContents.toggleDevTools()
    }
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(join(RENDERER_DIST, 'index.html'))
  }

  // 防止窗口获得焦点时显示菜单栏
  win.on('focus', () => {
    win?.setMenuBarVisibility(false)
  })
}

// 处理第二个实例启动
app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)

// 在应用退出时注销快捷键
app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

