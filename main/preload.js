const {contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('api',{
    node : () => process.versions.node,
    chrome : () => process.versions.chrome,
    electron : () => prccess.versions.electron,
    cmdArgs : () => ipcRenderer.invoke('cmdArgs'),
    ping : () => ipcRenderer.invoke('ping'),
    readFile : (path) => ipcRenderer.invoke('readFile',path),
    openFile : () => ipcRenderer.invoke('openFile'),
    openFolder : () => ipcRenderer.invoke('openFolder'),
    saveFile : (path,data) => ipcRenderer.invoke('saveFile',path,data),
    createFile : () => ipcRenderer.invoke('createFile'),
    renameFile : (oldpath) => ipcRenderer.invoke('renameFile',oldpath),
    deleteFile  : (path) => ipcRenderer.invoke('deleteFile',path)
})
