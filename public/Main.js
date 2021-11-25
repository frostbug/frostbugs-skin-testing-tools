const {app, BrowserWindow} = require('electron')
const path = require('path')
function createWindow () {
    // Create the browser window.
    win = new BrowserWindow({width: 800, height: 600})

    // for exporting
    // win.loadURL(`file://${path.join(__dirname, '../build/index.html')}`)

    //for local development
    win.loadURL('http://localhost:3000/')
}
    app.on('ready', createWindow)