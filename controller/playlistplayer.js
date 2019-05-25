const {
    Log
} = require("../lib/Log");
const fs = require('fs');
const path = require("path");
const {
    ipcRenderer
} = require('electron');

require('datatables.net-bs4')($);
var filePlaylistPath = "";
var player = null;

ipcRenderer.on("playlist-path", (event, args) => {
    Log.info("in playlist-path");
    filePlaylistPath = args;
    Log.info("Before reading.. " + filePlaylistPath);

    var files = fs.readdirSync(filePlaylistPath);
    let table = document.querySelector("table");
    if (!!files && files.length > 0) {
        let firstMedia = "";
        for (let i = 0; i < files.length; i++) {
            let itm = files[i];
            if (itm.endsWith(".mp3") || itm.endsWith(".mp4") || itm.endsWith(".m4a") || itm.endsWith(".aac")) {
                player.setAttribute("src",path.join(filePlaylistPath, itm));
                player.load();
                player.play();
                firstMedia=itm;
                break;
            }
        }
    }
    Log.info(files);
    $("table").dataTable({
        data:files
    });
});

$(document).ready(() => {
    player = document.querySelector("video");
    ipcRenderer.send("request-playlist-path", "path");
});