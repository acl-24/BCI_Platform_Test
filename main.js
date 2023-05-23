const { app, BrowserWindow, ipcMain} = require("electron");
const path = require("path")
const { spawn } = require('child_process');

let controlSession;

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile("index.html");
  win.removeMenu();
}

ipcMain.on('test', (event, msg) => {
  console.log('message');
})
ipcMain.on('startPythonProcess', (event, url) => {
  controlSession = spawnPythonProcess(url);
  event.reply('pythonProcessStarted', 'Python process started successfully');
});

function spawnPythonProcess(url) {
  return spawn('python', ['./python/share.py', url]);
}

ipcMain.on('endPythonProcess', (event) => {
  controlSession.kill();
  event.reply('pythonProcessEnded', 'Python process ended successfully');
});

app.whenReady().then(() => {
  createWindow();
});

