/*
    preload.js is the preloading script for importing the packages and setting up ipcRenderer actions
 */
const { contextBridge, ipcRenderer , electron} = require('electron');

contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: ipcRenderer,
    electron: electron,
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
        },
        onControlShareResponse: (callback) => {
            ipcRenderer.on("controlSessionStarted", (event, args) => {
                callback(args)
            });
            ipcRenderer.on("controlSessionEnded", (event, args) => {
                callback(args)
            });
        }
    }
)