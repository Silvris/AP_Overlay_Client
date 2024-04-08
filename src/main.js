const { app, BrowserWindow, ipcMain, protocol, webContents } = require('electron');
const path = require('path');
const url = require('url')
import { Client, ITEMS_HANDLING_FLAGS, SERVER_PACKET_TYPE, PRINT_JSON_TYPE } from 'archipelago.js';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let windows = new Set();

const client = new Client();

function connect_client(event, server, port, slotName, password) {
  console.log("Attempting to connect")
  client.disconnect()
  client.connect({
    hostname: server,
    port: port,
    game: "",
    name: slotName,
    items_handling: ITEMS_HANDLING_FLAGS.REMOTE_ALL,
    tags: ["AP", "TextOnly", "Overlay"]
  }).then(() => {
    console.log("Connected to the server")
  }).catch((error) => {
    console.error("Failed to connect: ", error)
  })

  client.addListener(SERVER_PACKET_TYPE.PRINT_JSON, (packet) => {
   received_item(packet)
  })
}

function received_item(packet) {
  console.log("PrintJson:", packet);
  if(packet.type == PRINT_JSON_TYPE.ITEM_SEND) {
    let selfPlayer = client.data.slot
    if((selfPlayer != packet.item.player) && (selfPlayer != packet.receiving)){
      return;
    }
    let sendingPlayer = client.players.get(packet.item.player)
    let sendingPlayerName = sendingPlayer.name
    let locationFound = sendingPlayer.location(packet.item.location)
    let receivedItem = client.players.get(packet.receiving).item(packet.item.item)
    let receivedGame = client.players.get(packet.receiving).game
    let otherPlayer = ""
    let received = false
    if(selfPlayer == packet.item.player) {
      otherPlayer = client.players.name(packet.receiving)
    }
    else {
      otherPlayer = client.players.name(packet.item.player)
      received = true
    }
    webContents.fromId(1).send('received-item', receivedItem, `${locationFound} (${sendingPlayerName})`, packet.item.item, packet.item.flags, receivedGame, otherPlayer, received);
  }
}

const createWindow = () => {
  // Create the browser window.
  protocol.registerFileProtocol('images', (request, cb) => {
    const url = request.url.replace('images://', '')
    const decodedUrl = decodeURIComponent(url)
    try {
      console.log(decodedUrl)
      return cb(decodedUrl)
    } catch (error) {
      console.error('ERROR: registerLocalResourceProtocol: Could not get file path:', error)
    }
  })
  const mainWindow = new BrowserWindow({
    frame: false,
    transparent: true,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });
  mainWindow.setIgnoreMouseEvents(true);
  mainWindow.setAlwaysOnTop(true);
  mainWindow.maximize();

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
  windows.add(mainWindow);

  //Create the settings window
  const settingsWindow = new BrowserWindow({
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    }
  });
  settingsWindow.loadURL(SETTINGS_WINDOW_WEBPACK_ENTRY);
  windows.add(settingsWindow);
  settingsWindow.openDevTools();

  ipcMain.on('connect-ap', connect_client)
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    client.disconnect();
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
