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
var playmediaList=[];
var currentPlay = null;


ipcRenderer.on("playlist-path", (event, args) => {
    Log.info("in playlist-path");
    filePlaylistPath = args;
    Log.info("Before reading.. " + filePlaylistPath);

    var files = fs.readdirSync(filePlaylistPath);
    let table = document.querySelector("table");
    
    if (!!files && files.length > 0) {
        let firstMedia = "";
        let playIndex =0;
        for (let i = 0; i < files.length; i++) {
            let itm = files[i];
            if (itm.endsWith(".mp3") || itm.endsWith(".mp4") || itm.endsWith(".m4a") || itm.endsWith(".aac")) {
                if (!firstMedia) {
                    firstMedia = {
                        path: path.join(filePlaylistPath, itm),
                        name: itm,
                        index:playIndex
                    };
                    playmediaList.push(firstMedia);
                    playIndex++;
                    continue;
                }
                // add media to cgrid
                playmediaList.push({
                    path: path.join(filePlaylistPath, itm),
                    name: itm,
                    index:playIndex
                });
                playIndex++;
            }
        }
        buldPlaylistView(playmediaList);
        loadSrc(firstMedia);
    }
    Log.info(files);
});

$(document).ready(() => {
    player = document.querySelector("video");
    ipcRenderer.send("request-playlist-path", "path");
    $("#btnNext").on("click",next);
    $("#btnPrev").on("click",prev);
});

function loadSrc(firstMedia) {
    if (!!firstMedia) {
        player.setAttribute("src", firstMedia.path);
        $("#txtFileName").html(firstMedia.name);
        player.load();
        player.play().then(()=>{
            currentPlay = firstMedia;
            // set active
        })
        .catch((err)=>{
            Log.error(err);
        });
    }
}

function buldPlaylistView(playlist){
    if(!!playlist && playlist.length>0){
        let tbody = $("tbody");
        for(let i=0;i<playlist.length;i++){
            let itm = playlist[i];
            let row = $("<tr />");
            let pname = $("<div />");
            pname.addClass("rowplaylist");
            if(i==0){
                pname.addClass("active");
            }
            pname.attr("id","itm_"+itm.index);
            pname.data("itmpath",itm.path);
            pname.data("itmname",itm.name);
            pname.data("itmindex",itm.index);
            pname.html(itm.name);

            pname.on("click",function(event){
                let data = $(this);
                loadSrc({
                    path:data.data("itmpath"),
                    name:data.data("itmname"),
                    index:data.data("itmindex")
                });
                $(".rowplaylist").removeClass("active");
                data.addClass("active");
            });
            row.append(pname);

            tbody.append(row);
        }
    }
}

function next(){
    if(!!playmediaList && playmediaList.length>0 && !!currentPlay){
        let curIndex = currentPlay.index;
        let nextIndex = ++curIndex;
        if(nextIndex>0 && nextIndex < playmediaList.length){
            loadSrc(playmediaList[nextIndex]);
            setActiveIndex(nextIndex);
        }
        else{
            loadSrc(playmediaList[0]);
            setActiveIndex(0);
        }
    }
}

function prev(){
    if(!!playmediaList && playmediaList.length>0 && !!currentPlay){
        let curIndex = currentPlay.index;
        let nextIndex = --curIndex;

        if(nextIndex>0 && nextIndex < playmediaList.length){
            loadSrc(playmediaList[nextIndex]);
            setActiveIndex(nextIndex);
        }
        else{
            loadSrc(playmediaList[0]);
            setActiveIndex(0);
        }
    }
}

function setActiveIndex(indx){
    if(indx>=0 && !!playmediaList && playmediaList.length>0 && $("#itm_"+indx).length>0){
        $(".rowplaylist").removeClass("active");
        $("#itm_"+indx).addClass("active");
    }
}