const {
    BrowserWindow
} = require("electron");

class MainForm extends BrowserWindow {
    constructor(options = {
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    }) {
        super(options);
        this.loadFile("views/main.html");
        this.setMenuBarVisibility(false);
        this.setMenu(null);
    }

    openDevTools() {
        this.webContents.openDevTools();
    }
}
module.exports = {
    MainForm
};