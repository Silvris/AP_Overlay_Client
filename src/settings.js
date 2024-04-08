const connectButton = document.getElementById('ConnectButton')
const server = document.getElementById('Server')
const port = document.getElementById('Port')
const slotname = document.getElementById('SlotName')
connectButton.addEventListener('click', () => {
    console.log("Clicked")
    window.electronAPI.connect_client(server.value.trim(), parseInt(port.value.trim()), slotname.value, "")
})