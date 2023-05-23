const { app, BrowserWindow, ipcMain} = require("electron");
const path = require("path")
const { spawn } = require('child_process');


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
  const controlSession = spawnPythonProcess(url);

  // while (true){
  //   controlSession.stdout.on('data', (data) => {
  //     console.log('Received data from Python:', data.toString());
  //     // Process the data as needed
  //
  //   });
  //
  //   controlSession.stderr.on('data', (data) => {
  //     console.error('Error from Python:', data.toString());
  //     // Handle the error
  //     break
  //   });
  //
  //   controlSession.on('close', (code) => {
  //     console.log(`Python process exited with code ${code}`);
  //     // Perform any cleanup or additional tasks
  //     break
  //   });
  // }

  event.reply('pythonProcessStarted', 'Python process started successfully');
});

function spawnPythonProcess(url) {
  return spawn('python', ['./python/share.py', url]);
}


app.whenReady().then(() => {
  createWindow();
});

