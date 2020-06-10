const YTPlayer = require('youtube-player');
const ffmpeg = require('fluent-ffmpeg');
const Url = require('url');
const fs = require("fs");
const path = require("path");
let youtubePath = require("youtube-dl-ffmpeg-ffprobe-static").path;
let ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
var youtubedl = {};
if (process.platform === 'darwin')
  youtubedl = require('@microlink/youtube-dl');
else
  youtubedl = require('youtube-dl');

const {
  ipcRenderer
} = require('electron');
const {
  Log
} = require("../lib/Log");
const homeDir = require("os").homedir();

let FFMPEG_PATH = ffmpegPath;
const {
  dialog,
  app
} = require('electron').remote;

class MainController {
  constructor(options) {
    this.options = {
      playerContainer: "ytplayer"
    };
    Object.assign(this.options, options);
    this.player = null;

    if (ffmpegPath == null || ffmpegPath == '') {
      alert("Attenzione: devi installare ffmpeg");
    } else {
      // solo su piattaforma mac
      FFMPEG_PATH = ffmpegPath.replace('app.asar', 'app.asar.unpacked');
    }

    if (youtubePath == null || youtubePath == '') {
      alert("Attenzione: devi installare youtube-dl");
    } else if (process.platform !== 'darwin') {
      youtubedl.setYtdlBinary(youtubePath);
    }

    Log.info(FFMPEG_PATH);

    // console.log(youtubePath);
    // console.log(FFMPEG_PATH);

    let playerContainer = document.querySelector("#" + this.options.playerContainer);
    if (playerContainer) {
      let id = playerContainer.id;
      this.player = new YTPlayer(id, {
        videoId: 'M7lc1UVf-VE',
        host: 'https://www.youtube.com'
      });
    }
    /// default cartella musica
    this.destinationPath = path.join(homeDir, "Music");
    this.outupuFormat = "mp3";
    try {
      if (!fs.existsSync(this.destinationPath)) {
        fs.mkdirSync(this.destinationPath);
      }
    } catch (err) {
      Log.error("default dir " + this.destinationPath + " not exists");
      console.log("default dir " + this.destinationPath + " not exists");
    }
    this.initControls();
  }

  initControls() {
    let versionSpan = document.querySelector("#versionSpan");
    versionSpan.innerHTML = app.getVersion();

    let lblDirPath = document.querySelector("#lblDirPath");
    lblDirPath.innerHTML = this.destinationPath;

    let btnLoad = document.querySelector("#btnLoad");
    btnLoad.addEventListener("click", this.urlChange.bind(this));

    let btnPath = document.querySelector("#btnPath");
    btnPath.addEventListener("click", this.selectPath.bind(this));
    //console.log(dialog);

    let btnConverti = document.querySelector("#btnConvert");
    btnConverti.addEventListener("click", () => {
      this.outupuFormat = "mp3";
      this.startConversion();
    });

    let btnConvertM4a = document.querySelector("#btnConvertM4a");
    btnConvertM4a.addEventListener("click", () => {
      this.outupuFormat = "m4a";
      this.startConversion();
    });

    let btnConvertAAC = document.querySelector("#btnConvertAAC");
    btnConvertAAC.addEventListener("click", () => {
      this.outupuFormat = "aac";
      this.startConversion();
    });
    let btnConvertMp4 = document.querySelector("#btnConvertMp4");
    btnConvertMp4.addEventListener("click", () => {
      this.outupuFormat = "mp4";
      this.startConversion();
    });
    let btnPlayer = document.querySelector("#btnPlayer");
    btnPlayer.addEventListener("click", (event) => {
      if (!!this.destinationPath) {
        // apri nuova finestra
        ipcRenderer.send("open-playlist-async", this.destinationPath);
      } else {
        alert("devi selezionare un path");
      }
    });
  }
  writeInfoBox(info,iserror) {
    let lblInfoBox = document.querySelector("#lblInfoBox");
    lblInfoBox.innerHTML = iserror? "<b style='color:red'>"+info+"</b>":info;
  }
  enableButtons(enable) {
    let btnConvert = document.querySelector("#btnConvert");
    let btnConvertM4a = document.querySelector("#btnConvertM4a");
    let btnConvertAAC = document.querySelector("#btnConvertAAC");
    let btnConvertMp4 = document.querySelector("#btnConvertMp4");
    let btnPath = document.querySelector("#btnPath");
    let btnPlayer = document.querySelector("#btnPlayer");
    if (!enable) {
      btnConvert.setAttribute("disabled", "");
      btnConvertM4a.setAttribute("disabled", "");
      btnConvertAAC.setAttribute("disabled", "");
      btnConvertMp4.setAttribute("disabled", "");
      btnPath.setAttribute("disabled", "");
      btnPlayer.setAttribute("disabled", "");
    } else {
      btnConvert.removeAttribute("disabled");
      btnConvertM4a.removeAttribute("disabled");
      btnConvertAAC.removeAttribute("disabled");
      btnConvertMp4.removeAttribute("disabled");
      btnPath.removeAttribute("disabled");
      btnPlayer.removeAttribute("disabled");
    }
  }
  urlChange(event) {
    let yturl = document.querySelector("#txtUrl").value;
    let startSec = parseFloat(document.querySelector("#nmnStart").value);
    if (!!yturl) {
      this.player.stopVideo()
        .then(() => {
          let urlData = Url.parse(yturl);
          const urlParams = new URLSearchParams(urlData.search);
          const vId = urlParams.get('v');
          this.player.loadVideoById(vId, startSec);
        })
        .catch((err) => {
          console.fail(err);
        });
    } else {
      alert("scegli un video");
    }
  }
  selectPath(event) {
    let dirName = this.selectDirectory();
    if (!!dirName && dirName.length > 0) {
      let lblDirPath = document.querySelector("#lblDirPath");
      lblDirPath.innerHTML = dirName[0];
      this.destinationPath = dirName[0];
      ipcRenderer.send("change-playlist-async", this.destinationPath);
    }
  }
  selectDirectory() {
    return dialog.showOpenDialog({
      properties: ['openDirectory']
    });
  }
  cleanFileName(fn) {
    return fn.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  }
  startConversion() {
    this.writeInfoBox("check media....");
    // fai un check
    let txtUrl = document.querySelector("#txtUrl");
    let txtName = document.querySelector("#txtName");
    let nmStart = document.querySelector("#nmnStart");

    if (!!txtUrl && !!txtName && !!txtUrl.value && !!txtName.value && !!this.destinationPath) {
      this.convert(txtUrl.value, this.cleanFileName(txtName.value), this.destinationPath, parseInt(nmStart.value));
    } else {
      alert("tutti i campi sono obbligatori");
      this.writeInfoBox("");
    }
  }

  convert(ytUrl, fileName, pathName, startSeek = 0) {
    this.enableButtons(false);
    let destinationFile = path.join(pathName, fileName + ".mp4");
    let downloaded = 0;
    if (fs.existsSync(destinationFile)) {
      fs.unlinkSync(destinationFile);
    }
    // if (startSeek > 0) {
    //   ytUrl += "&start=" + startSeek;
    // }
    this.writeInfoBox("connecting " + ytUrl);
    let video = youtubedl(ytUrl,
      // Optional arguments passed to youtube-dl.
      ['-i', '--format=18', '--no-check-certificate'],
      // Additional options can be given for calling `child_process.execFile()`.
      {
        cwd: pathName
      });

    // Will be called when the download starts.
    video.on('info', (info) => {
      this.writeInfoBox('Download started size ' + info.size);
      console.log("Download started");
      Log.info("starting download " + info._filename);
      console.log('filename: ' + info._filename);

      // info.size will be the amount to download, add
      var total = info.size + downloaded;
      console.log('size: ' + total);

      if (downloaded > 0) {
        // size will be the amount already downloaded
        console.log('resuming from: ' + downloaded);

        // display the remaining bytes to download
        console.log('remaining bytes: ' + info.size);
        Log.info("starting download resume " + info._filename);
      }
    });

    video.pipe(fs.createWriteStream(destinationFile, {
      flags: 'a'
    }));

    // Will be called if download was already completed and there is nothing more to download.
    video.on('complete', (info) => {
      'use strict';
      console.log('filename: ' + info._filename + ' already downloaded.');
      Log.info('filename: ' + info._filename + ' already downloaded.');
      this.writeInfoBox('filename: ' + info._filename + ' already downloaded.');
      this.enableButtons(true);
    });

    video.on('error', (err) => {
      this.writeInfoBox("errore conversione: "+err.message,true);
      Log.error("Errore: "+err.message);
      this.enableButtons(true);
    });
    video.on('end', () => {
      this.enableButtons(false);
      console.log('finished downloading!');
      Log.info('finished downloading!');
      // al termine 
      this.writeInfoBox('finished downloading!');
      // inizia conversione in mp3
      this.writeInfoBox("starting " + this.outupuFormat + " conversion");
      Log.info("starting " + this.outupuFormat + " conversion");
      try {
        let outfile = "";
        switch (this.outupuFormat) {
          case 'm4a':
            outfile = destinationFile.replace(".mp4", ".m4a");
            break;
          case 'aac':
            outfile = destinationFile.replace(".mp4", ".aac");
            break;
          case 'mp3':
            outfile = destinationFile.replace(".mp4", ".mp3");
            break;
          case 'mp4':
            outfile = startSeek > 0 ? destinationFile.replace(".mp4", "_video.mp4") : "";
            break;
        }

        if (!!outfile) {
          try {
            if (fs.existsSync(outfile)) {
              fs.unlinkSync(outfile);
            }
          } catch (err) { }
          var process = new ffmpeg();
          process.input(destinationFile);
          process.output(outfile);
          process.setFfmpegPath(FFMPEG_PATH);
          if (this.outupuFormat == 'mp3') {
            process.outputOptions([
              '-f', this.outupuFormat, '-ss', startSeek
            ]);
          } else if (this.outupuFormat == 'm4a') {
            process.outputOptions([
              '-vn', '-c:a', 'copy', '-ss', startSeek
            ]);
          } else if (this.outupuFormat === 'aac') {
            process.outputOptions([
              '-acodec', 'copy', '-ss', startSeek
            ]);
          } else if (this.outupuFormat === 'mp4') {
            process.outputOptions([
              '-ss', startSeek, '-c', 'copy'
            ]);
          }

          this.writeInfoBox("converting into  " + outfile + " ....");
          Log.info("converting into  " + outfile + " ....");

          process.on("end", (end) => {
            this.enableButtons(true);
            this.writeInfoBox("Conversione avvenuta con successo");
            // pulisci mp4
            Log.info(this.outupuFormat + " conversion ok");
            try {
              fs.unlinkSync(destinationFile);
              ipcRenderer.send("change-playlist-async", this.destinationPath);
            } catch (er) {
              console.log(er);
              Log.error(er);
            }
          });

          process.on("error", (error) => {
            console.log(error);
            Log.error(error);
            this.writeInfoBox("errore conversione");
            this.enableButtons(true);
          });

          process.run();
        } else {
          Log.info("fine");
          this.writeInfoBox("processo completato");
          this.enableButtons(true);
          ipcRenderer.send("change-playlist-async", this.destinationPath);
        }
      } catch (e) {
        console.log(e);
        Log.error(e);
        this.writeInfoBox("errore conversione");
        this.enableButtons(true);
      }
    });
  }
}

const mainController = new MainController();