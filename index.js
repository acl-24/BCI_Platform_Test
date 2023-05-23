let callFrame, room;
const apiKey = '1a1f99bcddc9683e98ad57f556b127d222fc54b4ffa415a0205ed05e785ffc97';
const apiUrlRoom = 'https://api.daily.co/v1/rooms/';
// Sample data for the group list
const data = [
    { name: 'Room 1', url: 'https://grhbcitest.daily.co/test1' },
    { name: 'Room 2', url: 'https://grhbcitest.daily.co/test2' },
    { name: 'Room 3', url: 'https://grhbcitest.daily.co/test3' },
];
const { ipcRenderer } = window.electron;

async function updateParticipantCount(){
    let n = 0
    data.forEach(async (item, index) => {
        const participantCount = await getParticipantCount(item.url)
        // Create a list item element
        const listItem = document.createElement('li');
        const urlElement = listItem.querySelector('p');
        urlElement.textContent = participantCount.toString()
    })
    n += 1
    u = document.getElementById("show-list-rooms")
    u.innerHTML = n.toString()
}
//function used to initiate a callFrame instance, which lies within the wrapper.
//callFrame is able to adjust the UI as user joins and leaves the room
async function createCallframe() {
    //parent element of callFrame
    const callWrapper = document.getElementById('wrapper');
    //callFrame can be used to communicate with Daily.co on event listening
    callFrame = window.DailyIframe.createFrame(callWrapper);

    callFrame
        .on('loaded', showEvent)
        .on('started-camera', showEvent)
        .on('camera-error', showEvent)
        .on('joining-meeting', toggleLobby)
        .on('joined-meeting', handleJoinedMeeting)
        .on('left-meeting', handleLeftMeeting);

    callFrame.iframe().style.height = '500px';
    callFrame.iframe().style.display = 'none';
    // toggleIframe();
}

//joinCall enters a room using the url
async function joinCall(url) {
    try {
        await callFrame.join({
            url: url,
            showLocalVideo:false,
        });
    } catch (e) {
        if (
            e.message === "can't load iframe meeting because url property isn't set"
        ) {
            toggleMainInterface();
            console.log('empty URL');
        }
        toggleError();
        console.error(e);
    }
}

function leaveSession(){
    callFrame.leave();
    toggleMainInterface()
}
// callFrame.on('participant-updated', (event) => {
//     const { action, participant } = event;
//
//     if (action === 'left') {
//         // Client has left the meeting
//         console.log(`Participant ${participant.user_id} has left the meeting.`);
//         // Perform additional actions as needed
//     }
// });

// async function clickReturn(){
//     callFrame.iframe().style.display = "none";
//     const homescreen = document.getElementById("start-container");
//     const quitscreen = document.getElementById("quit_section")
//     homescreen.style.display = "block";
//     quitscreen.style.display = "none"
// }
async function populateGroupList() {
    // Get the group list element
    const groupList = document.getElementById('groupList');
    // Clear the existing list
    groupList.innerHTML = '';

    // Loop through the data and create list items
    data.forEach(async (item, index) => {
        const participantCount = await getParticipantCount(item.url)
        // Create a list item element
        const listItem = document.createElement('li');
        listItem.classList.add('group-list-item');

        // Create the content for the list item
        const content = `
      <h3>${item.name}</h3>
      <p>${item.url}</p>
      <p>${participantCount} participants</p>
      <button class="white-button" onclick="clickJoinRoom(${index})">join room</button>
    `;

        // Append the list item to the group list
        groupList.appendChild(listItem);

        // Set the content of the list item
        listItem.innerHTML = content;
    })
}

async function getParticipantCount(roomURL) {
    try {
        const count = await callFrame.participantCounts({
            url: roomURL,
        });
        return (count.hidden + count.present);
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function clickJoinRoom(index){
    const listItem = document.querySelectorAll('.group-list-item')[index];
    // Create a temporary element to parse the HTML string
    const tempElement = document.createElement('div');
    tempElement.innerHTML = listItem.innerHTML;

    // Retrieve the value of item.url
    const urlElement = tempElement.querySelector('p');
    const itemUrl = urlElement.textContent;

    await startSession(itemUrl)
}

async function startSession(url){
    await joinCall(url)
    await shareControl(url)
}

async function shareControl(url){
    // Send a message to the main process
    ipcRenderer.send('startPythonProcess', url);

    // Receive a message from the main process
    ipcRenderer.once('pythonProcessStarted', (event, data) => {
    console.log('Python process started:', data);
    });
}











/* Utility functions */
/* Event listener callbacks and helpers */
function showEvent(e) {
    console.log('callFrame event', e);
}

function toggleHomeScreen() {
    const homeScreen = document.getElementById('start-container');
    homeScreen.classList.toggle('hide');
}

function toggleLobby() {
    const callWrapper = document.getElementById('wrapper');
    callWrapper.classList.toggle('in-lobby');
    toggleHomeScreen();
    toggleIframe();
}

function toggleIframe() {
    const quitScreen = document.getElementById('quit_section');
    if (callFrame.iframe().style.display === 'block'){
        callFrame.iframe().style.display = 'none';
        // quitScreen.iframe().style.display = 'none';
    }
    if (callFrame.iframe().style.display === 'none'){
        callFrame.iframe().style.display = 'block';
        // quitScreen.iframe().style.display = 'block';
    }
}

function toggleControls() {
    const callControls = document.getElementById('call-controls-wrapper');
    callControls.classList.toggle('hide');
}

function toggleCallStyling() {
    const callWrapper = document.getElementById('wrapper');
    const createAndStartButton = document.getElementById('create-and-start');
    createAndStartButton.innerHTML = 'Create room and start';
    callWrapper.classList.toggle('in-call');
}

function toggleError() {
    const errorMessage = document.getElementById('error-message');
    errorMessage.classList.toggle('error-message');
    toggleControls();
    toggleCallStyling();
}

function toggleMainInterface() {
    toggleHomeScreen();
    toggleControls();
    toggleCallStyling();
}

function handleJoinedMeeting() {
    toggleLobby();
    toggleMainInterface();
}

function handleLeftMeeting() {
    toggleMainInterface();
}

function resetErrorDesc() {
    const errorTitle = document.getElementById('error-title');
    const errorDescription = document.getElementById('error-description');

    errorTitle.innerHTML = 'Incorrect room URL';
    errorDescription.innerHTML =
        'Meeting link entered is invalid. Please update the room URL.';
}

function tryAgain() {
    toggleError();
    toggleMainInterface();
    resetErrorDesc();
}

/* Call panel button functions */
function copyUrl() {
    const url = document.getElementById('copy-url');
    const copyButton = document.getElementById('copy-url-button');
    url.select();
    document.execCommand('copy');
    copyButton.innerHTML = 'Copied!';
}

function toggleCamera() {
    callFrame.setLocalVideo(!callFrame.participants().local.video);
}

function toggleMic() {
    callFrame.setLocalAudio(!callFrame.participants().local.audio);
}

function toggleScreenshare() {
    let participants = callFrame.participants();
    const shareButton = document.getElementById('share-button');
    if (participants.local) {
        if (!participants.local.screen) {
            callFrame.startScreenShare();
            shareButton.innerHTML = 'Stop screenshare';
        } else if (participants.local.screen) {
            callFrame.stopScreenShare();
            shareButton.innerHTML = 'Share screen';
        }
    }
}

function toggleFullscreen() {
    callFrame.requestFullscreen();
}

function toggleLocalVideo() {
    const localVideoButton = document.getElementById('local-video-button');
    const currentlyShown = callFrame.showLocalVideo();
    callFrame.setShowLocalVideo(!currentlyShown);
    localVideoButton.innerHTML = `${
        currentlyShown ? 'Show' : 'Hide'
    } local video`;
}

function toggleParticipantsBar() {
    const participantsBarButton = document.getElementById(
        'participants-bar-button'
    );
    const currentlyShown = callFrame.showParticipantsBar();
    callFrame.setShowParticipantsBar(!currentlyShown);
    participantsBarButton.innerHTML = `${
        currentlyShown ? 'Show' : 'Hide'
    } participants bar`;
}

/* Other helper functions */
// Populates 'network info' with information info from daily-js
async function updateNetworkInfoDisplay() {
    const videoSend = document.getElementById('video-send'),
        videoReceive = document.getElementById('video-receive'),
        packetSend = document.getElementById('packet-send'),
        packetReceive = document.getElementById('packet-receive');

    let statsInfo = await callFrame.getNetworkStats();

    videoSend.innerHTML = `${Math.floor(
        statsInfo.stats.latest.videoSendBitsPerSecond / 1000
    )} kb/s`;

    videoReceive.innerHTML = `${Math.floor(
        statsInfo.stats.latest.videoRecvBitsPerSecond / 1000
    )} kb/s`;

    packetSend.innerHTML = `${Math.floor(
        statsInfo.stats.worstVideoSendPacketLoss * 100
    )}%`;

    packetReceive.innerHTML = `${Math.floor(
        statsInfo.stats.worstVideoRecvPacketLoss * 100
    )}%`;
}

function showRoomInput() {
    const urlInput = document.getElementById('url-input');
    const urlClick = document.getElementById('url-click');
    const urlForm = document.getElementById('url-form');
    urlClick.classList.remove('show');
    urlClick.classList.add('hide');

    urlForm.classList.remove('hide');
    urlForm.classList.add('show');
    urlInput.focus();
}

function showDemoCountdown() {
    const countdownDisplay = document.getElementById('demo-countdown');

    if (!window.expiresUpdate) {
        window.expiresUpdate = setInterval(() => {
            let exp = room && room.config && room.config.exp;
            if (exp) {
                let seconds = Math.floor((new Date(exp * 1000) - Date.now()) / 1000);
                let minutes = Math.floor(seconds / 60);
                let remainingSeconds = Math.floor(seconds % 60);

                countdownDisplay.innerHTML = `Demo expires in ${minutes}:${
                    remainingSeconds > 10 ? remainingSeconds : '0' + remainingSeconds
                }`;
            }
        }, 1000);
    }
}