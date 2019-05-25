const debug = false;
// Modules to control application life and create native browser window
const {
  app,
  ipcMain
} = require('electron');
const {
  MainForm
} = require('./forms/MainForm');
const {
  PlayListForm
} = require('./forms/PlayListForm');

const path = require('path');
const fs = require('fs');

const log = require('electron-log');
const dialog = app.dialog;
const homeDir = require("os").homedir();

let logPath = path.join(homeDir, 'Logs');
if (!fs.existsSync(logPath)) {
  fs.mkdirSync(logPath);
}
///////////// LOGS //////////////////////////////////////
// Write to this file, must be set before first logging
log.transports.file.file = path.join(logPath, 'youdownload.txt');
// fs.createWriteStream options, must be set before first logging
log.transports.file.streamConfig = {
  flags: 'w'
};
// set existed file stream
log.transports.file.stream = fs.createWriteStream('youdownload.txt');
//////////////////////////////////////////////////////////////////////
let mainWindow;
let playListWnd;

/**
 * Crea il form principale
 */
function createMainForm() {
  mainWindow = new MainForm();
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
  if (debug) {
    mainWindow.openDevTools();
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createMainForm();
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createMainForm();
});


//////////////////////// MESSAGES //////////////////////////////////
ipcMain.on('open-playlist-async', (event, arg, data) => {
  // apri solo se null
  if (playListWnd == null) {
    playListWnd = new PlayListForm();
    playListWnd.setPlaylistPath(arg);
    playListWnd.on('closed', function () {
      playListWnd = null;
    });
  }
  //event.reply('open-playlist-async-reply', 'pong');
  //event.reply('open-playlist-async-reply', 'pong');
});

ipcMain.on('log-message', (event, arg) => {
  log.info(arg); // prints "ping"
  //console.log(arg);
  //event.reply('open-playlist-async-reply', 'pong');
});
ipcMain.on('log-error', (event, arg) => {
  log.error(arg); // prints "ping"
  //console.fail(arg);
  //event.reply('open-playlist-async-reply', 'pong');
});
/////////////////////////////////////////////////////////////////