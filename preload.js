/*
    preload.js is the preloading script for importing the packages and setting up ipcRenderer actions
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: ipcRenderer,
});

contextBridge.exposeInMainWorld(    "api",
    {
        onParticipantCountResponse: (callback) => {
            ipcRenderer.on("participantCountRetrieved", (event, args) => {
                callback(args)
            });
        },
        offParticipantCountResponse: () => {
            ipcRenderer.removeAllListeners('participantCountRetrieved');
        }
    }
)