/*
    main.js (also known as main process), which is the main process upon running, handles creating and deleting
    python threads for control sharing, initiating http request with Daily API and communicates with renderer
    processes using ipcMain
 */
//browser window and ipcMain for communication
const { app, BrowserWindow, ipcMain} = require("electron");
const path = require("path")
//managing python threads
const { spawn } = require('child_process');
//making http requests
const axios = require('axios')

//TO DO: change api key to daily.co's api key
const apiKey = '1a1f99bcddc9683e98ad57f556b127d222fc54b4ffa415a0205ed05e785ffc97';
// In the main process of your Electron application

// Create your BrowserWindow and load your HTML file
//controlSession, used to hold the python process upon creation
let controlSession;

//creates window and load preload.js and renderer.js
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile("index.html");
  win.removeMenu();

  //dev purpose only, remove on usage
  win.webContents.openDevTools()
}

//creates a python process, passing in url as session ID
function spawnPythonProcess(url) {
    //running python in share.py file, parameter: url
  return spawn('python', ['./python/share.py', url]);
}

//retrieve participant count from daily api, with apiKey
async function getParticipantCount(roomName) {
    try {
        const response = await axios.get(`https://api.daily.co/v1/rooms/${roomName}/presence`,
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
            });
        const {data} = response;
        // console.log(data)
        return data.total_count;
    } catch (error) {
        console.error('Error occurred while fetching meeting participant count:', error);
        return -1;
    }
}

//ipcMain handlers
//spawn python process using url
ipcMain.on('startPythonProcess', (event, url) => {
    let errorFlag = false;
    controlSession = spawnPythonProcess(url);
    controlSession.stdout.on('data', (data) => {
        const errorMessage = data.toString(); // Convert the error data to string
        console.error('Error occurred in the Python process:', errorMessage);
        // Handle the error as per your requirements
        errorFlag = true;
    });

    if (errorFlag){
        event.reply('controlSessionStarted', 'off')
    } else {
        event.reply('controlSessionStarted', 'on')
    }
});

//kill python process that has been created and running
ipcMain.on('endPythonProcess', (event) => {
    if (controlSession !== undefined && controlSession !== null) {
        controlSession.kill();
    }
    event.reply('controlSessionEnded', 'off')
});

//respond in channel participantCountRetrieved upon receiving roomName from getParticipantCount channel
ipcMain.on('getParticipantCount', (event, roomName) => {
  getParticipantCount(roomName)
      .then(count => {
        event.reply('participantCountRetrieved', count.toString());
      })
      .catch(error => {
        console.error(error);
      });
});

app.whenReady().then(() => {
  createWindow();
});

