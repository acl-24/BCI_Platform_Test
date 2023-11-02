# BCI Gaming Platform

BCI Gaming Platform enables multiplayer online gaming using BCI devices.
This app hosts game sessions that allow online control, video and audio sharing. Electron.js along with Daily API are used for client-side video and audio sharing. Python client-server TCP socket architecture is used for control sharing. 

## Prerequisites

- Node.js
- AWS server: https://docs.google.com/document/d/1S-UzDPUA_8Vvk8CJM3nPtaE7ZhmH2pQwX4Gk4n5sBZY
- Daily.co: https://grhbcitest.daily.co

## How the app works
BCI Gaming Platform is a great way to connect to your peers to play BCI games together! You could choose to play player versus player games against each other or cooperate with each other to perform complex character movements in game.

Here is the **home screen** upon starting the BCI gaming platform application:

1. This is the status of your control sharing, if it is turned on, any keys you press will be sent to all the participants in the room, so be careful what you are typing when it is on!
2. This is a refresh button that allows you to refresh the list of rooms every 5 seconds.
3. This is the status of the room in terms of the number of participants currently in the room.
4. This is the button to enter the room, which will take you to the in-room screen and you can start sharing your game from there!

![Image Alt Text](https://github.com/GRH-BCI/BCI_Gaming_Platform/blob/main/assets/sc1-bci.png)


Once you are **in the room**, you can either choose to be a game host or a participant. 

If you would like to be the **host**:
Start any game you would like to play with your peer
Press start screen share with audio
Minimize the gaming platform app and full screen your game
Start playing once your peer has joined

If you would like to be the **participant**:
Make sure your control sharing is on
Click on the expand button to see the game in full screen
Starting sending your controls and game with your peer

If you would like to communicate with your peer, you could choose to:
Turn on camera or microphone 
Open the chat section and start sending messages. Make sure you have turned off the control sharing by the toggle button before doing so!

And here is a list of components in the in-room screen:
1. This is the status and toggle button for the control sharing. You can turn it on when playing games with your peers and off when you are trying to send them a text message.
2. This is the return button that will take you back to the home screen and automatically disable control sharing. You will exit the room by clicking this.
3. This is the button to start sharing video and audio of the game together. Please use this button to start the game session when you are the host.
4. This is the button to control the status of your camera. 
5. This is the button to control the status of your microphone. 
6. This is the button to open the people section and see all the individuals currently in the room.
7. This is the button to open the chat section. Make sure to turn control sharing off before sending a message.
8. This is the screen share button to share the video of the game only. It is a deprecated button to use since no one else in the room can hear the sound of the game.
9. This is the full screen button. It is recommended to use it as a participant to get more immersive gaming experience.

![Image Alt Text](https://github.com/GRH-BCI/BCI_Gaming_Platform/blob/main/assets/sc2-bci.png)


## Running locally
In the terminal of the folder:
1. Install dependencies `npm install`
2. Run `npm start`

## Building locally
In the terminal of the folder:
1. Install dependencies `npm install`
2. Run `npm run build` , check dist folder for packaged executable files

