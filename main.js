const debug = false;
// Modules to control application life and create native browser window
const {
  Menu,
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

// const log = require('electron-log');
const dialog = app.dialog;
const homeDir = require("os").homedir();
const url = require('url');

const iconUrl = url.format({
  pathname: path.join(__dirname, 'Icon.icns'),
  protocol: 'file:',
  slashes: true
});

let logPath = path.join(homeDir, 'Documents');
if (!fs.existsSync(logPath)) {
  fs.mkdirSync(logPath);
}
///////////// LOGS //////////////////////////////////////
// Write to this file, must be set before first logging
// log.transports.file.file = path.join(logPath, 'youdownload.txt');
// // fs.createWriteStream options, must be set before first logging
// log.transports.file.streamConfig = {
//   flags: 'w'
// };
// // set existed file stream
// log.transports.file.stream = fs.createWriteStream('youdownload.txt');
//////////////////////////////////////////////////////////////////////
let mainWindow;
let playListWnd;

/**
 * Crea il form principale
 */
function createMainForm() {
  mainWindow = new MainForm({
    width: 800,
    height: 600,
    icon: iconUrl,
    webPreferences: {
      nodeIntegration: true
    }
  });
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
/// imposta il menu
var template = [{
  label: "You Download",
  submenu: [{
      label: "About You Download",
      selector: "orderFrontStandardAboutPanel:"
    },
    {
      type: "separator"
    },
    {
      label: "Quit",
      accelerator: "Command+Q",
      click: function () {
        app.quit();
      }
    }
  ]
}, {
  label: "Edit",
  submenu: [{
      label: "Undo",
      accelerator: "CmdOrCtrl+Z",
      selector: "undo:"
    },
    {
      label: "Redo",
      accelerator: "Shift+CmdOrCtrl+Z",
      selector: "redo:"
    },
    {
      type: "separator"
    },
    {
      label: "Cut",
      accelerator: "CmdOrCtrl+X",
      selector: "cut:"
    },
    {
      label: "Copy",
      accelerator: "CmdOrCtrl+C",
      selector: "copy:"
    },
    {
      label: "Paste",
      accelerator: "CmdOrCtrl+V",
      selector: "paste:"
    },
    {
      label: "Select All",
      accelerator: "CmdOrCtrl+A",
      selector: "selectAll:"
    }
  ]
}];

Menu.setApplicationMenu(Menu.buildFromTemplate(template));
//app.dock.setMenu(menu);

//////////////////////// MESSAGES //////////////////////////////////
ipcMain.on('change-playlist-async', (event, arg) => {
  console.log("change-playlist-async:: " + arg);
  if (!!playListWnd) {
    playListWnd.setPlaylistPath(arg);
    playListWnd.refreshItems();
  }
});
ipcMain.on('open-playlist-async', (event, arg) => {
  // apri solo se null
  if (playListWnd == null) {
    playListWnd = new PlayListForm({
      width: 800,
      height: 600,
      icon: iconUrl,
      webPreferences: {
        nodeIntegration: true
      }
    });
    playListWnd.setDebug(debug);
    playListWnd.setPlaylistPath(arg);
    playListWnd.on('closed', function () {
      playListWnd = null;
    });

    playListWnd.on('show', function () {
      if (debug) {
        playListWnd.openDevTools();
      }
    });

    playListWnd.on('restore', function () {
      //playListWnd.refreshItems();
    });

    playListWnd.on('focus', function () {
      // playListWnd.refreshItems();
    });
  }
  //event.reply('open-playlist-async-reply', 'pong');
  //event.reply('open-playlist-async-reply', 'pong');
});

ipcMain.on('log-message', (event, arg) => {
  //log.info(arg); // prints "ping"
  console.log(arg);
  //event.reply('open-playlist-async-reply', 'pong');
});
ipcMain.on('log-error', (event, arg) => {
  //log.error(arg); // prints "ping"
  console.error(arg);
  //event.reply('open-playlist-async-reply', 'pong');
});
/////////////////////////////////////////////////////////////////