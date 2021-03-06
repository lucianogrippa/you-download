const {
    BrowserWindow,
    ipcMain
} = require("electron");

class PlayListForm extends BrowserWindow {
    constructor(options) {
        super(options);
        this.playlistPath = "";
        this.debug=false;
        this.loadFile("views/playlistplayer.html");
        this.setMenuBarVisibility(false);
        this.setMenu(null);
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

    setDebug(_d){
        this.debug = _d;
    }
    openDevTools() {
        this.webContents.openDevTools();
    }
    refreshItems(){
        console.log("in refreshItems");
        this.webContents.send("refresh-items",this.playlistPath);
    }
}
module.exports = {
    PlayListForm
};