const { app, BrowserWindow, ipcMain} = require("electron");
const path = require("path")
const { spawn } = require('child_process');
const axios = require('axios')

const apiKey = '1a1f99bcddc9683e98ad57f556b127d222fc54b4ffa415a0205ed05e785ffc97';

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
  win.webContents.openDevTools()
}

function spawnPythonProcess(url) {
  return spawn('python', ['./python/share.py', url]);
}

async function getParticipantCount(roomName){
  try {
    const response = await axios.get(`https://api.daily.co/v1/rooms/${roomName}/presence`,
        {   headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
        });
    const { data } = response;
    return data.total_count;
  } catch (error) {
    console.error('Error occurred while fetching meeting participant count:', error);
    return -1;
  }
}

ipcMain.on('test', (event, msg) => {
  console.log('message');
})
ipcMain.on('startPythonProcess', (event, url) => {
  controlSession = spawnPythonProcess(url);
  event.reply('pythonProcessStarted', 'Python process started successfully');
});

ipcMain.on('endPythonProcess', (event) => {
  controlSession.kill();
  event.reply('pythonProcessEnded', 'Python process ended successfully');
});

ipcMain.on('getParticipantCount', (event, roomName) => {
  getParticipantCount(roomName)
      .then(count => {
        console.log(count);
        event.reply('participantCountRetrieved', count.toString());
      })
      .catch(error => {
        console.error(error);
      });
});

app.whenReady().then(() => {
  createWindow();
});

