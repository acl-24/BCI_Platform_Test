const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: ipcRenderer,
});

contextBridge.exposeInMainWorld(    "api", {onResponse: (callback) => {
        ipcRenderer.on("participantCountRetrieved", (event, args) => {callback(args)});
}})