const {
    BrowserWindow
} = require("electron");

class MainForm extends BrowserWindow {
    constructor(options) {
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