/*
    index.js (also known as renderer process) handles the events in the window, which offers CRUD functionalities
    regarding the UI and also communicates with main.js (which is the main process) using ipcRenderer
 */

//global variables and functions

//callFrame that holds the meeting object
//currentURL is the current session url
let callFrame, currentURL;
//Rooms to select from, to be displayed in the ul
const data = [
    { name: 'Room 1', url: 'https://grhbcitest.daily.co/test1', room: 'test1' },
    { name: 'Room 2', url: 'https://grhbcitest.daily.co/test2', room: 'test2' },
    { name: 'Room 3', url: 'https://grhbcitest.daily.co/test3', room: 'test3' },
];
//ipcRenderer handles the communication between the window and the main process
//use ipcRenderer.send to send info or create ipcRenderer.on in preload.js to receive data
const { ipcRenderer } = window.electron;
// updates the participant count in each room every time interval
window.setInterval('updateParticipantCount()', 2000);


//updates the list item participant count by calling the getMeetingParticipantCount(room) function
async function updateParticipantCount(){
    let index = 0;
    //find the grouplist element in html
    let list = document.getElementById('groupList'),
        items = list.childNodes;

    //for each list item, retrieve the participant count and update li innerHtml accordingly
    for (let i = 0, length = items.length; i < length; i++)
    {
        if (items[i].nodeType !== 1) {
            continue;
        }
        //retrieve participant count
        const participantCount = await getMeetingParticipantCount(data[index].room);
        const countElement = items[i].querySelector('h4')
        countElement.textContent = 'in-room: ' + participantCount.toString();
        index ++;
    }

    window.api.offParticipantCountResponse();
}

//function used to initiate a callFrame instance, which lies within the wrapper.
//callFrame is able to adjust the UI as user joins and leaves the room
async function createCallframe() {
    //parent element of callFrame
    const callWrapper = document.getElementById('wrapper');
    //callFrame can be used to communicate with Daily.co on event listening
    //can set the meeting attributes here
    callFrame = window.DailyIframe.createFrame(callWrapper,
        {
            showFullscreenButton: true,
        }
    );

    callFrame
        .on('loaded', showEvent)
        .on('started-camera', showEvent)
        .on('camera-error', showEvent)
        .on('joining-meeting', toggleLobby)
        .on('joined-meeting', handleJoinedMeeting)
        .on('left-meeting', handleLeftMeeting);

    //hide return section and the callFrame when init
    callFrame.iframe().style.height = '500px';
    callFrame.iframe().style.display = 'none';
    hideQuit()
}

//joinCall enters a room using the url
async function joinCall(url) {
    try {
        //join using URL, but can modify the attributes here
        await callFrame.join({
            url: url,
            showLocalVideo:false,
        });
    } catch (e) {
        //handles error for not able joining the call
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

//create list items for ul using the data global variable, fills in the room, name and url and join room button
//for each list item
async function populateGroupList() {
    // Get the group list element
    const groupList = document.getElementById('groupList');
    // Clear the existing list
    groupList.innerHTML = '';

    // Loop through the data and create list items
    for (const [index, item] of data.entries()) {
        try {
            // Retrieve the participant count
            const participantCount = await getMeetingParticipantCount(item.room);

            // Create a list item element
            const listItem = document.createElement('li');
            listItem.classList.add('group-list-item');

            // Create the content for the list item
            // Set the content of the list item
            listItem.innerHTML = `
        <h3>${item.name}</h3>
        <p>${item.url}</p>
        <h4>in-room: ${participantCount}</h4>
        <button class="white-button" onclick="clickJoinRoom(${index})">join room</button>
      `;

            // Append the list item to the group list
            groupList.appendChild(listItem);
        } catch (error) {
            console.error(error);
        }
    }
}

//get participant count in room, by sending thru getParticipantCount channel on ipcRenderer
async function getMeetingParticipantCount(roomName) {
    return new Promise((resolve) => {
        // Send the roomName in channel getParticipantCount
        ipcRenderer.send('getParticipantCount', roomName);

        //main process responds with the participant count
        window.api.onParticipantCountResponse((data) => {
            resolve(data);
        });
    });
}


//click listener for join button, which hides the lobby section and shows the video section
//calls startSession on the list item's url
async function clickJoinRoom(index){
    const listItem = document.querySelectorAll('.group-list-item')[index];
    // Create a temporary element to parse the HTML string
    const tempElement = document.createElement('div');
    tempElement.innerHTML = listItem.innerHTML;

    // Retrieve the value of item.url
    const urlElement = tempElement.querySelector('p');
    const itemUrl = urlElement.textContent;

    const section = document.getElementById('quit_section')
    section.style.display = 'block'

    //start session
    await startSession(itemUrl)
}

//session will both render the user to join a call and start share control, based on the url parameter
async function startSession(url){
    await joinCall(url)
    await shareControl(url)
}

//calls main process on startPythonProcess channel and sets the current session url of user
async function shareControl(url){
    // Send a message to the main process
    ipcRenderer.send('startPythonProcess', url);
    currentURL = url;
}

//click listener for return button, which hides the video section and calls end session with current URL
function clickReturn(){
    hideQuit()
    callFrame.iframe().style.display = 'none';
    endSession(currentURL);
}

//leaves the meeting and end control sharing based on the current session url
async function endSession(url){
    await leaveMeeting();
    await endShareControl(url);
}

//user leaves meeting
async function leaveMeeting(){
    try {
        await callFrame.leave();
    } catch (e) {
        console.error(e);
    }
}

//calls main process on endPythonProcess channel to end session for url
async function endShareControl(url){
    // Send a message to the main process
    ipcRenderer.send('endPythonProcess', url);
}








/* Utility functions */
/* Event listener callbacks and helpers */
function hideQuit(){
    const section = document.getElementById('quit_section')
    section.style.display = 'none'
}

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
