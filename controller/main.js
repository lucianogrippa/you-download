const ffmpeg = require("fluent-ffmpeg");
const Url = require("url");
const fs = require("fs");
const path = require("path");
let youtubePath = require("youtube-dl-ffmpeg-ffprobe-static").path;
let ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
var youtubedl = {};
youtubedl = require("@microlink/youtube-dl");
// if (process.platform === "darwin" || process.platform == "linux")
//   youtubedl = require("@microlink/youtube-dl");
// else youtubedl = require("youtube-dl");

const { ipcRenderer } = require("electron");
const { Log } = require("../lib/Log");
const homeDir = require("os").homedir();

let FFMPEG_PATH = ffmpegPath;
const { dialog, app } = require("electron").remote;
const { electron } = require("process");

window.ELECTRON_ENABLE_SECURITY_WARNINGS = false;
window.HELP_IMPROVE_VIDEOJS = false;

class MainController {
  constructor(options) {
    this.options = {
      playerContainer: "ytplayer",
    };
    Object.assign(this.options, options);
    this.player = null;

    if (ffmpegPath == null || ffmpegPath == "") {
      alert("Warning: you should install ffmpeg");
    } else {
      FFMPEG_PATH = ffmpegPath.replace("app.asar", "app.asar.unpacked");
    }

    if (youtubePath == null || youtubePath == "") {
      alert("Warning: you should install youtube-dl");
    } else /*if (process.platform !== "darwin" || process.platform !== "linux")*/ {
      youtubedl.setYtdlBinary(youtubePath);
    }

    Log.info(FFMPEG_PATH);

    // console.log(youtubePath);
    // console.log(FFMPEG_PATH);
    this.initPlayer("https://www.youtube.com/watch?v=M7lc1UVf-VE");

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

  initPlayer(videoUrl, startpos = 0) {

    this.loadInfo(videoUrl);

    if (!!this.player) {
      this.player.dispose();
      this.player = null;
    }

    let playerContainer = this.initContainer();

    if (playerContainer) {
      let id = playerContainer.id;

      this.player = videojs(id, {
        controls: true,
        autoplay: false,
        fluid:true,
        preload: "auto",
        techOrder: ["youtube", "html5"],
        sources: [
          {
            type: "video/youtube",
            src: videoUrl,
          },
        ],
        youtube: {
          iv_load_policy: 1,
          start: startpos,
          origin: "*",
          controls: 0,
          wmode: "opaque",
        },
      });
    }
  }

  loadInfo(videoUrl) {
    youtubedl.getInfo(videoUrl, (err, info) => {
      this.enableButtons(true);
      
      if (err) { 
        this.writeInfoBox(err);
        alert(err);
        throw err;
      }
      console.log("id:", info.id);
      console.log("title:", info.title);
      console.log("url:", info.url);
      console.log("thumbnail:", info.thumbnail);
      console.log("description:", info.description);
      console.log("filename:", info._filename);
      console.log("format id:", info.format_id);

      let txtName = document.querySelector("#txtName");

      txtName.value = info.title;

      let infoBox = "filename: "+info._filename+" id : "+info.id;
      
      document.querySelector("#txt-title-info").innerHTML = info.title;
      this.writeInfoBox(infoBox,false);
    });
  }

  initContainer() {
    var doc = document.querySelector("#" + this.options.playerContainer);

    if (!doc) {
      let rootCont = document.querySelector("#plContainer");
      rootCont.innerHTML =
        '<video id="' +
        this.options.playerContainer +
        '" controls preload="auto" class="vjs-matrix video-js" ></video>';

      doc = document.querySelector("#" + this.options.playerContainer);
    }

    return doc;
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
        alert("Warning: you must select a path");
      }
    });

    let btnInfo = document.querySelector("#btnInfo");
    btnInfo.addEventListener("click", (e) => {
      this.enableButtons(false);
      let urlData = document.querySelector("#txtUrl");
      if (!!urlData && !!urlData.value) {
        this.loadInfo(urlData.value);
      } else {
        alert("Warning: you must indicate a youtube video link");
        this.enableButtons(true);
      }
    });

    let yturl = document.querySelector("#txtUrl");
    yturl.addEventListener('change',(e)=> {
      if(!!yturl && yturl.value)
        this.loadInfo(yturl.value);
    });
  }

  writeInfoBox(info, iserror) {
    let lblInfoBox = document.querySelector("#lblInfoBox");
    lblInfoBox.innerHTML = iserror
      ? "<b style='color:red'>" + info + "</b>"
      : info;
  }
  enableButtons(enable) {
    let btnConvert = document.querySelector("#btnConvert");
    let btnConvertM4a = document.querySelector("#btnConvertM4a");
    let btnConvertAAC = document.querySelector("#btnConvertAAC");
    let btnConvertMp4 = document.querySelector("#btnConvertMp4");
    let btnPath = document.querySelector("#btnPath");
    let btnInfo = document.querySelector("#btnInfo");
    let btnPlayer = document.querySelector("#btnPlayer");
    if (!enable) {
      btnConvert.setAttribute("disabled", "");
      btnConvertM4a.setAttribute("disabled", "");
      btnConvertAAC.setAttribute("disabled", "");
      btnConvertMp4.setAttribute("disabled", "");
      btnPath.setAttribute("disabled", "");
      btnInfo.setAttribute("disabled", "");
      btnPlayer.setAttribute("disabled", "");
    } else {
      btnConvert.removeAttribute("disabled");
      btnConvertM4a.removeAttribute("disabled");
      btnConvertAAC.removeAttribute("disabled");
      btnConvertMp4.removeAttribute("disabled");
      btnPath.removeAttribute("disabled");
      btnInfo.removeAttribute("disabled");
      btnPlayer.removeAttribute("disabled");
    }
  }

  urlChange(event) {
    let yturl = document.querySelector("#txtUrl").value;
    let startSec = parseFloat(document.querySelector("#nmnStart").value);
    if (!!yturl) {
      this.initPlayer(yturl, startSec);
      this.player
        .play()
        .then(() => console.log("play"))
        .catch((err) => console.warn(err));
    } else {
      alert("Select a video");
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
      properties: ["openDirectory"],
    });
  }
  cleanFileName(fn) {
    return fn.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  }
  startConversion() {
    this.writeInfoBox("check media....");
    // fai un check
    let txtUrl = document.querySelector("#txtUrl");
    let txtName = document.querySelector("#txtName");
    let nmStart = document.querySelector("#nmnStart");

    if (
      !!txtUrl &&
      !!txtName &&
      !!txtUrl.value &&
      !!txtName.value &&
      !!this.destinationPath
    ) {
      this.convert(
        txtUrl.value,
        this.cleanFileName(txtName.value),
        this.destinationPath,
        parseInt(nmStart.value)
      );
    } else {
      alert("Warning: all fields are required");
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
    let video = youtubedl(
      ytUrl,
      // Optional arguments passed to youtube-dl.
      ["-i", "--format=18", "--no-check-certificate"],
      // Additional options can be given for calling `child_process.execFile()`.
      {
        cwd: pathName,
      }
    );

    // Will be called when the download starts.
    video.on("info", (info) => {
      this.writeInfoBox("Download started size " + info.size);
      console.log("Download started");
      Log.info("starting download " + info._filename);
      console.log("filename: " + info._filename);

      // info.size will be the amount to download, add
      var total = info.size + downloaded;
      console.log("size: " + total);

      if (downloaded > 0) {
        // size will be the amount already downloaded
        console.log("resuming from: " + downloaded);

        // display the remaining bytes to download
        console.log("remaining bytes: " + info.size);
        Log.info("starting download resume " + info._filename);
      }
    });

    video.pipe(
      fs.createWriteStream(destinationFile, {
        flags: "a",
      })
    );

    // Will be called if download was already completed and there is nothing more to download.
    video.on("complete", (info) => {
      "use strict";
      console.log("filename: " + info._filename + " already downloaded.");
      Log.info("filename: " + info._filename + " already downloaded.");
      this.writeInfoBox("filename: " + info._filename + " already downloaded.");
      this.enableButtons(true);
    });

    video.on("error", (err) => {
      this.writeInfoBox("Warning can't convert file: " + err.message, true);
      Log.error("Errore: " + err.message);
      this.enableButtons(true);
    });
    video.on("end", () => {
      this.enableButtons(false);
      console.log("finished downloading!");
      Log.info("finished downloading!");
      // al termine
      this.writeInfoBox("finished downloading!");
      // inizia conversione in mp3
      this.writeInfoBox("starting " + this.outupuFormat + " conversion");
      Log.info("starting " + this.outupuFormat + " conversion");
      try {
        let outfile = "";
        switch (this.outupuFormat) {
          case "m4a":
            outfile = destinationFile.replace(".mp4", ".m4a");
            break;
          case "aac":
            outfile = destinationFile.replace(".mp4", ".aac");
            break;
          case "mp3":
            outfile = destinationFile.replace(".mp4", ".mp3");
            break;
          case "mp4":
            outfile =
              startSeek > 0
                ? destinationFile.replace(".mp4", "_video.mp4")
                : "";
            break;
        }

        if (!!outfile) {
          try {
            if (fs.existsSync(outfile)) {
              fs.unlinkSync(outfile);
            }
          } catch (err) {}
          var process = new ffmpeg();
          process.input(destinationFile);
          process.output(outfile);
          process.setFfmpegPath(FFMPEG_PATH);
          if (this.outupuFormat == "mp3") {
            process.outputOptions(["-f", this.outupuFormat, "-ss", startSeek]);
          } else if (this.outupuFormat == "m4a") {
            process.outputOptions(["-vn", "-c:a", "copy", "-ss", startSeek]);
          } else if (this.outupuFormat === "aac") {
            process.outputOptions(["-acodec", "copy", "-ss", startSeek]);
          } else if (this.outupuFormat === "mp4") {
            process.outputOptions(["-ss", startSeek, "-c", "copy"]);
          }

          this.writeInfoBox("converting into  " + outfile + " ....");
          Log.info("converting into  " + outfile + " ....");

          process.on("end", (end) => {
            this.enableButtons(true);
            this.writeInfoBox("Download ended successfully");
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
          this.writeInfoBox("All process has been completed");
          this.enableButtons(true);
          ipcRenderer.send("change-playlist-async", this.destinationPath);
        }
      } catch (e) {
        console.log(e);
        Log.error(e);
        this.writeInfoBox("Warning: download error");
        this.enableButtons(true);
      }
    });
  }
}

const mainController = new MainController();
