const { app, BrowserWindow, ipcMain} = require("electron");
const path = require("path")
let callFrame, room;

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

ipcMain.on("greet", (event, args) => {
  console.log(args)
})

app.whenReady().then(() => {
  createWindow();
});

// function createCallframe() {
//   const callWrapper = document.getElementById('wrapper');
//   callFrame = window.DailyIframe.createFrame(callWrapper);

//   callFrame
//     .on('loaded', showEvent)
//     .on('started-camera', showEvent)
//     .on('camera-error', showEvent)
//     .on('joining-meeting', toggleLobby)
//     .on('joined-meeting', handleJoinedMeeting)
//     .on('left-meeting', handleLeftMeeting);

//   const roomURL = document.getElementById('url-input');
//   const joinButton = document.getElementById('join-call');
//   const createButton = document.getElementById('create-and-start');
//   roomURL.addEventListener('input', () => {
//     if (roomURL.checkValidity()) {
//       joinButton.classList.add('valid');
//       joinButton.classList.remove('disabled-button');
//       joinButton.removeAttribute('disabled');
//       createButton.classList.add('disabled-button');
//     } else {
//       joinButton.classList.remove('valid');
//     }
//   });

//   roomURL.addEventListener('keyup', (event) => {
//     if (event.keyCode === 13) {
//       event.preventDefault();
//       joinButton.click();
//     }
//   });
// }


// async function createRoomAndStart() {
//   console.log("its ok")
//   const createAndStartButton = document.getElementById('create-and-start');
//   const copyUrl = document.getElementById('copy-url');
//   const errorTitle = document.getElementById('error-title');
//   const errorDescription = document.getElementById('error-description');

//   createAndStartButton.innerHTML = 'Loading...';

//   room = await createRoom();
//   if (!room) {
//     errorTitle.innerHTML = 'Error creating room';
//     errorDescription.innerHTML =
//       "If you're developing locally, please check the README instructions.";
//     toggleMainInterface();
//     toggleError();
//   }
//   copyUrl.value = room.url;

//   showDemoCountdown();

//   try {
//     callFrame.join({
//       url: room.url,
//       showLeaveButton: true,
//     });
//   } catch (e) {
//     toggleError();
//     console.error(e);
//   }
// }

// async function joinCall() {
//   const url = document.getElementById('url-input').value;
//   const copyUrl = document.getElementById('copy-url');
//   copyUrl.value = url;

//   try {
//     await callFrame.join({
//       url: url,
//       showLeaveButton: true,
//     });
//   } catch (e) {
//     if (
//       e.message === "can't load iframe meeting because url property isn't set"
//     ) {
//       toggleMainInterface();
//       console.log('empty URL');
//     }
//     toggleError();
//     console.error(e);
//   }
// }

// function showRoomInput() {
//   const urlInput = document.getElementById('url-input');
//   const urlClick = document.getElementById('url-click');
//   const urlForm = document.getElementById('url-form');
//   urlClick.classList.remove('show');
//   urlClick.classList.add('hide');

//   urlForm.classList.remove('hide');
//   urlForm.classList.add('show');
//   urlInput.focus();
// }