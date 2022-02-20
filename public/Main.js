const {app, BrowserWindow} = require('electron')
const path = require('path')
app.disableHardwareAcceleration()
function createWindow () {
    require('@electron/remote/main').initialize()
    let mainWindow = new BrowserWindow
    ({
        width: 620,
        height: 860,
        autoHideMenuBar: true,
        webPreferences: {
            enableRemoteModule: true,
            nodeIntegration: true,
            contextIsolation: false
        },
        icon: path.join(__dirname, 'frostbug.ico'),
    })

    mainWindow.webContents.on('new-window', function(e, url) {
        e.preventDefault();
        require('electron').shell.openExternal(url);
    });

    //--------------------uncomment for exporting, comment out when developing--------------------

    // mainWindow.loadURL(`file://${path.join(__dirname, '../build/index.html')}`)

    //--------------------uncomment for developing, comment out when exporting--------------------

    mainWindow.webContents.openDevTools()
    mainWindow.loadURL('http://localhost:3000/')

    //--------------------------------------------------------------------------------------------

}
    app.on('ready', createWindow)