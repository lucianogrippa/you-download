const {
    Log
} = require("../lib/Log");
const fs = require('fs');
const path = require("path");
const {
    ipcRenderer
} = require('electron');

var filePlaylistPath = "";
var player = null;
var playmediaList = [];
var currentPlay = null;


ipcRenderer.on("playlist-path", (event, args) => {
    Log.info("in playlist-path");
    filePlaylistPath = args;
    Log.info("Before reading.. " + filePlaylistPath);

    loadFilesInDir();
    //Log.info(files);
});



$(document).ready(() => {
    player = document.querySelector("video");
    player.addEventListener("ended", () => {
        next();
    });
    player.addEventListener("durationchange", () => {
        $("#txtDuration").html(formatDuration(player.duration));
    });
    ipcRenderer.send("request-playlist-path", "path");
    $("#btnNext").on("click", next);
    $("#btnPrev").on("click", prev);
    ipcRenderer.on("refresh-items", (events, args) => {
        console.log(args);
        filePlaylistPath = args;
        loadFilesInDir();
    });
});

function loadSrc(firstMedia) {
    if (!!firstMedia) {
        player.setAttribute("src", firstMedia.path);
        $("#txtFileName").html(firstMedia.name);
        let type = firstMedia.name.endsWith(".mp4") ? "video" : "audio";
        $("#videoTitle").html(formatTitle(firstMedia.name) + "   (" + type + " " + getExt(firstMedia.name) + ")");
        player.load();
        player.play().then(() => {
                currentPlay = firstMedia;
                // set active
            })
            .catch((err) => {
                Log.error(err);
            });
    }
}

function buldPlaylistView(playlist) {
    if ($(".prows").length > 0)
        $(".table-playlist .prows").remove();

    if (!!playlist && playlist.length > 0) {
        let tbody = $(".table-playlist");
        for (let i = 0; i < playlist.length; i++) {
            let itm = playlist[i];
            let row = $("<div />");
            row.addClass("row");
            row.addClass("prows");
            let pname = $("<div />");
            pname.addClass("col");
            pname.addClass("rowplaylist");
            if (!currentPlay && i == 0) {
                pname.addClass("active");
            } else if (!!currentPlay && currentPlay.path === itm.path) {
                pname.addClass("active");
                currentPlay.index = i;
            }
            pname.attr("id", "itm_" + itm.index);
            pname.data("itmpath", itm.path);
            pname.data("itmname", itm.name);
            pname.data("itmindex", itm.index);
            pname.attr("title", itm.name);
            pname.html(formatTitle(itm.name));

            pname.on("click", function (event) {
                let data = $(this);
                loadSrc({
                    path: data.data("itmpath"),
                    name: data.data("itmname"),
                    index: data.data("itmindex")
                });
                $(".rowplaylist").removeClass("active");
                data.addClass("active");
            });
            row.append(pname);
            // crea gli span per l'action di eliminazione
            let delSpan = $("<span />");
            delSpan.addClass("glyphicon");
            delSpan.addClass("glyphicon-trash");

            delSpan.attr("role", "action");

            let btnDelete = $("<a />");
            btnDelete.addClass("btn");
            btnDelete.addClass("btn-sm");
            btnDelete.addClass("btn-default");
            btnDelete.data("path", itm.path);
            btnDelete.addClass("delIcon");
            btnDelete.html("");
            btnDelete.append(delSpan);

            btnDelete.on("click", function (event) {
                let path = $(this).data("path");

                let conf = confirm("Sei sicuro di voler eliminare " + path + "?");
                if (conf) {
                    try {
                        if (fs.existsSync(path)) {
                            fs.unlinkSync(path);
                        }
                        if (currentPlay.path === path) {
                            currentPlay = null;
                        }
                        alert("file " + path + " eliminato !!");
                    } catch (e) {
                        alert("errore nell'eliminare il file " + path);
                        Log.error(e);
                    }
                    loadFilesInDir();
                }
            });

            pname.prepend(btnDelete);
            tbody.append(row);
        }
    }
}

function next() {
    if (!!playmediaList && playmediaList.length > 0 && !!currentPlay) {
        let curIndex = currentPlay.index;
        let nextIndex = ++curIndex;
        if (nextIndex > 0 && nextIndex < playmediaList.length) {
            loadSrc(playmediaList[nextIndex]);
            setActiveIndex(nextIndex);
        } else {
            loadSrc(playmediaList[0]);
            setActiveIndex(0);
        }
    }
}

function prev() {
    if (!!playmediaList && playmediaList.length > 0 && !!currentPlay) {
        let curIndex = currentPlay.index;
        let nextIndex = --curIndex;

        if (nextIndex > 0 && nextIndex < playmediaList.length) {
            loadSrc(playmediaList[nextIndex]);
            setActiveIndex(nextIndex);
        } else {
            loadSrc(playmediaList[0]);
            setActiveIndex(0);
        }
    }
}

function setActiveIndex(indx) {
    if (indx >= 0 && !!playmediaList && playmediaList.length > 0 && $("#itm_" + indx).length > 0) {
        $(".rowplaylist").removeClass("active");
        $("#itm_" + indx).addClass("active");
    }
}

function formatDuration(duration) {
    var sec_num = parseInt(duration, 10); // don't forget the second param
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    return hours > 0 ? hours + ':' + minutes + ':' + seconds : minutes + ":" + seconds;
}

function formatTitle(title) {
    let t = title;
    t = title.substring(0, t.lastIndexOf('.'));
    t = t.replace(/\_/ig, " ");

    return t.charAt(0).toUpperCase() + t.slice(1);
}

function getExt(file) {
    let t = file;
    t = t.substring(t.lastIndexOf('.') + 1);

    return t.toUpperCase();
}

function loadFilesInDir() {
    var files = fs.readdirSync(filePlaylistPath);
    setDirNameTitle(filePlaylistPath);
    playmediaList = [];
    if (!!files && files.length > 0) {
        let firstMedia = "";
        let playIndex = 0;
        for (let i = 0; i < files.length; i++) {
            let itm = files[i];
            if (itm.endsWith(".mp3") || itm.endsWith(".mp4") || itm.endsWith(".m4a") || itm.endsWith(".aac")) {
                if (!firstMedia && currentPlay == null) {
                    firstMedia = {
                        path: path.join(filePlaylistPath, itm),
                        name: itm,
                        index: playIndex
                    };
                    playmediaList.push(firstMedia);
                    playIndex++;
                    continue;
                } else if (!!currentPlay && currentPlay.name === itm) {
                    currentPlay = {
                        path: path.join(filePlaylistPath, itm),
                        name: itm,
                        index: playIndex
                    };
                }
                // add media to cgrid
                playmediaList.push({
                    path: path.join(filePlaylistPath, itm),
                    name: itm,
                    index: playIndex
                });
                playIndex++;
            }
        }
        buldPlaylistView(playmediaList);
        loadSrc(firstMedia);
    }
}

function setDirNameTitle(dirName) {
    let dName = dirName;
    dName = dirName.substring(dirName.lastIndexOf("/")+1);
    $("#dirNameTitle").html(dName);
    return dName.charAt(0).toUpperCase().slice(1);
}