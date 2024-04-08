const { contextBridge, ipcRenderer} = require('electron')
// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
console.log("Preload")
contextBridge.exposeInMainWorld('electronAPI', {
    connect_client: (server, port, slotName, password) => ipcRenderer.send('connect-ap',server, port, slotName, password),
    received_item: (callback, itemName, locationName, itemId, progression, game, otherPlayer, received) => ipcRenderer.on('received-item', callback, itemName, locationName, itemId, progression, game, otherPlayer, received),
  })