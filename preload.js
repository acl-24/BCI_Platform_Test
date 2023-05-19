const {ipcRenderer, contextBridge} = require("electron")

const WINDOW_API = {
    greet: (message) => ipcRenderer.send("greet", message),
    createRoom: () => ipcRenderer.send("createRoom")
}

contextBridge.exposeInMainWorld("api", WINDOW_API)