const {
    BrowserWindow,
    ipcMain
} = require("electron");

class PlayListForm extends BrowserWindow {
    constructor(options = {
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    }) {
        super(options);
        this.playlistPath = "";
        this.loadFile("views/playlistplayer.html");

        ipcMain.on("request-playlist-path",(event,arg)=>{
            console.log("recived equest-playlist-path");
            console.log(arg);
            event.reply("playlist-path",this.playlistPath);
        });
    }

    setPlaylistPath(pPath){
        this.playlistPath = pPath;
    }

    getPlaylitPath(){
        return this.playlistPath;
    }
}
module.exports = {
    PlayListForm
};