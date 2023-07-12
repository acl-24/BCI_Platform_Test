/*
    main.js (also known as main process), which is the main process upon running, handles creating and deleting
    python threads for control sharing, initiating http request with Daily API and communicates with renderer
    processes using ipcMain

    icon src: <a href="https://www.flaticon.com/free-icons/machine-learning" title="machine learning icons">Machine learning icons created by Flat Icons - Flaticon</a>
 */
//browser window and ipcMain for communication
const { app, BrowserWindow, ipcMain, desktopCapturer} = require("electron");
const path = require("path")
//managing python threads
const { spawn, execFile , fork, execSync} = require('child_process');
//making http requests
const axios = require('axios')
const psTree = require('ps-tree');

//TO DO: change api key to daily.co's api key
const apiKey = '1a1f99bcddc9683e98ad57f556b127d222fc54b4ffa415a0205ed05e785ffc97';
// In the main process of your Electron application

// Create your BrowserWindow and load your HTML file
//controlSession, used to hold the python process upon creation
let controlSession;
let win;
let controlSessionList = [];
let errorFlag = false;
let controlSessionOn = false;

//creates window and load preload.js and renderer.js
function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 700,
    icon: path.join(__dirname, './assets/favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile("index.html");
  win.removeMenu();
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

function getSubprocesses(pid, callback) {
    psTree(pid, (err, children) => {
        if (err) {
            console.error(err);
            return;
        }

        const subprocesses = children.map(child => ({
            pid: child.PID,
            command: child.COMMAND,
        }));

        callback(subprocesses);
    });
}

//ipcMain handlers
//spawn python process using url
ipcMain.on('startPythonProcess', (event, url) => {
    controlSession = spawn("./python/dist/share.exe", [url]);
    electronPid = process.pid;
    getSubprocesses(electronPid, processTree  => {
        for (const subprocess of processTree) {
            console.log(`PID: ${subprocess.pid}, Command: ${subprocess.command}`);
            if (subprocess.command === "share.exe"){
                controlSessionList.push(subprocess.pid);
            }
        }
    });
    controlSession.stdout.on('data', (data) => {
        const message = data.toString(); // Convert the error data to string
        console.log(message)
    })

    controlSession.stderr.on('data', (data) => {
        const errorMessage = data.toString(); // Convert the error data to string
        console.error('Error occurred in the Python process:', errorMessage);
        // Handle the error as per your requirements
        event.reply('controlSessionStarted', 'off')
    });

    event.reply('controlSessionStarted', 'on')
});

//kill python process that has been created and running
ipcMain.on('endPythonProcess', (event) => {
    console.log(controlSessionList)
    if (controlSession !== undefined && controlSession !== null) {
        controlSessionList.forEach(pid => {
            cmd = "taskkill /PID " + pid + " /F";
            execSync(cmd);
            controlSessionList = []
        })
    }
    event.reply('controlSessionEnded', 'off')
});

ipcMain.on('startScreenShare', (event) => {
    desktopCapturer.getSources({types: ['window', 'screen']}).then(async sources => {
        for (const source of sources) {
            console.log(source)
            if (source.name === 'Entire screen') {
                win.webContents.send('SET_SOURCE', source.id)
                return
            }
        }
    })
})

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

app.on('before-quit', () => {
    if (controlSession !== undefined && controlSession !== null) {
        controlSessionList.forEach(pid => {
            console.log(pid)
            cmd = "taskkill /PID " + pid + " /F";
            execSync(cmd);
        })
    }
})

