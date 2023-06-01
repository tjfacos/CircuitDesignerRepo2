const { app, BrowserWindow, Menu, MenuItem, ipcMain, dialog, globalShortcut,Notification } = require('electron')
const path = require('path')

// Local Dependencies
const { CallAnalysis } = require("./utility/python_connection")
const { SaveDesign, LoadDesign } = require("./utility/file_handling")


const createWindow = () => {
  
  const mainWindow = new BrowserWindow({
    icon: __dirname + '/assets/icons/favicon.ico',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // Form menu
  
  let menu = new Menu()

  fileItem = new MenuItem({
    "label": "File",
    "submenu": [
      {
        "label": "New Design",
        "accelerator": "Ctrl+N",
        "click": () => {
          mainWindow.webContents.send("new-file")
        }
      },
      {
        "label": "Save Design",
        "accelerator": "Ctrl+S",
        "click": () => {
          mainWindow.webContents.executeJavaScript("SaveCircuit()") 
        }
      },
      {
        "label": "Open Design",
        "accelerator": "Ctrl+O",
        "click": () => {
          LoadDesign(mainWindow) 
        }
      },
    ]
  })
  
  devToolsItem = new MenuItem({
    "click": () => {
      mainWindow.webContents.openDevTools()
    },
    // "label": "DevTools",
    "accelerator": "Ctrl+Shift+I"
  })
  
  helpItem = new MenuItem({
    "click": () => {
      mainWindow.webContents.executeJavaScript("openHelpDialog()")
    },
    "label": "Help"    
  })

  menu.append(fileItem)
  menu.append(devToolsItem)
  menu.append(helpItem)

  mainWindow.maximize()
  mainWindow.loadFile('public/index.html')
  mainWindow.setMenu(menu)
  
  
  return mainWindow

}

const AddHandlers = (mainWindow) => {
  
  ipcMain.handle("CallAnalysis", (_, circuit) => {
        
    CallAnalysis(circuit, mainWindow)
    
    return 0
  })
  
  ipcMain.handle("SaveDesign", (_, data) => {
    SaveDesign(data, mainWindow)
  })

  ipcMain.handle("NotifyUser", (_, body) => {
    new Notification(body).show()
  })

  globalShortcut.register('Ctrl+f5', () => {
    mainWindow.webContents.executeJavaScript("Simulate()")
  })

} 

app.whenReady().then(() => {
  AddHandlers(createWindow())
  

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
