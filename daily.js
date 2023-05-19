window.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("container");

  callFrame = window.DailyIframe.createFrame(container, {
    showLeaveButton: true,
    iframeStyle: {
      position: "fixed",
      width: "calc(100% - 1rem)",
      height: "calc(100% - 1rem)",
    },
  });
  // TODO: Replace the following URL with your own room URL.
  callFrame.join({ url: "https://grhbcitest.daily.co/test1" });
});

document.getElementById('entry_create_room_btn').addEventListener('click', () => {
  ipcRenderer.send('createRoom');
  ipcRenderer.send('greet', "why are you")
});
