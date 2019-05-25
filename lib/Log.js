const {ipcRenderer} = require('electron');

var Log = {
    info:function info(obj) {
        ipcRenderer.send("log-message",obj);
    },
    error: function error(obj){
        ipcRenderer.send("log-error",obj);
    }
};

module.exports ={
    Log
};