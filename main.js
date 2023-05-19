const { app, BrowserWindow, ipcMain} = require("electron");
const path = require("path")
const WebSocket = require(`ws`);
const wss = new WebSocket(`ws://localhost:3000`);

wss.onmessage = function (e) {
  console.log("I'm client")
  let message = JSON.parse(e.data);
  console.log(message);
};

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile("index.html");
}

// ipcMain.on("greet", (event, args) => {
//   console.log(args)
// })
//
// ipcMain.on("createRoom", (event, args) => {
//   console.log("ipc working fine")
//   createRoom();
// })



app.whenReady().then(() => {
  createWindow();
});

