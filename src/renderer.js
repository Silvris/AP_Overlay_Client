/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';
import {ITEM_FLAGS} from 'archipelago.js'
window.$ = window.jQuery = require('jquery');
const ItemView = document.getElementById("ReceivedItem")
const ItemName = document.getElementById("itemName")
const ItemLocation = document.getElementById("itemLocation")
const ItemImage = document.getElementById("itemImage")
const StatusText = document.getElementById("StatusText")
const ItemQueue = Array()
let CurrentlyDisplaying = false

window.electronAPI.received_item((callback, itemName, locationName, itemId, progression, game, otherPlayer, received) => {
  ItemQueue.push(
    {
      name: itemName,
      id: itemId,
      location: locationName,
      game: game,
      progression: progression,
      otherPlayer: otherPlayer,
      received: received
    }
  )
})

function displayItem() {
  if(!CurrentlyDisplaying){
    if(ItemQueue.length > 0) {
      CurrentlyDisplaying = true
      let item = ItemQueue.pop()
      if(item.received) {
        StatusText.innerHTML = `Received from ${item.otherPlayer}`
      }
      else {
        StatusText.innerHTML = `Sent to ${item.otherPlayer}`
      }
      ItemName.innerHTML = item.name;
      ItemLocation.innerHTML = item.location;
      if(item.progression & ITEM_FLAGS.PROGRESSION){
        window.$('#itemName').css("color", "#AF99EF")
      }
      else if (item.progression & ITEM_FLAGS.NEVER_EXCLUDE){
        window.$('#itemName').css("color", "#6D8BE8")
      }
      else if (item.progression & ITEM_FLAGS.TRAP) {
        window.$('#itemName').css("color", "#FA8072")
      }
      else {
        window.$('#itemName').css("color", "#00EEEE")
      }
      window.$('#ReceivedItem').css("display", "flex").hide().fadeIn('slow');
      setTimeout(function() {
        window.$('#ReceivedItem').fadeOut('slow', function() {window.$('#ReceivedItem').hide().css("display", "none")});
      }, 3000)
      setTimeout(() => {CurrentlyDisplaying = false}, 3000)
    }
  }
}

setInterval(displayItem, 50);
//console.log('👋 This message is being logged by "renderer.js", included via webpack');