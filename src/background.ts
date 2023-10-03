import {app, BrowserWindow} from 'electron'

app.whenReady().then( () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true, // 让渲染进程可以使用node api
      contextIsolation: false, // 关闭渲染进程沙箱
      webSecurity: false // 关闭跨域检测
    }
  }) 
  
  if (process.argv[2]) {
    mainWindow.webContents.openDevTools(); // 打开控制台
    mainWindow.loadURL(process.argv[2])
  } else {
    mainWindow.loadFile('index.html')
  }
})