const {app, BrowserWindow, ipcMain,Menu} = require("electron");
const fs = require('fs');
let win;

function createWindow() {
    const {width,height} = require('electron').screen.getPrimaryDisplay().workAreaSize;
    win = new BrowserWindow({
        width:width,
        height:height,
        minHeight:600,
        minWidth:950,
        title:"Reada",
        icon:"res/img/icon.png",
        webPreferences:{
            nodeIntegration:true
        }
    })
    //menu template
    const template = [{
        label: 'View',
        submenu: [
            {role: 'toggledevtools'}
        ]
    }];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    win.loadFile('src/index.html');
    //win.webContents.openDevTools();
    //window close event
    win.on('close',()=>{
        win = null;
    })
}
//Creating windown
app.on('ready',createWindow);
//Quit when all windows are closed
app.on('window-all-closed',()=>{
    app.quit();
});
//MacOs active on doc
app.on('activate',()=>{
    if(win == null){
        createWindow();
    }
})

//Create editor window
function EditorWindow(arg) {
    let data = JSON.parse(arg);
    let editor = new BrowserWindow({
        height:650,
        width:1050,
        title:`${data.title} - Editor`,
        icon:"res/img/icon.png",
    });
    //editor.webContents.openDevTools();
    //editor.setMenu(null);
    editor.loadFile("src/BookMaker/index.html");
    editor.webContents.on('did-finish-load',()=>{
        editor.webContents.send('data',arg);
    })
}
//events
ipcMain.on('launchEditor', (event, arg) => {
    EditorWindow(arg);
});

///
//check for binaries folder
fs.exists('bin',(exists) => {
    if(!exists) {
        fs.mkdir('bin', { recursive: true }, (err) => {
            if (!err){
                //publications
                fs.mkdir('bin/publications', { recursive: true }, (err) => {
                    if (err) throw err;
                });
            }else{
                console.log("failed to create dir");
            }
        });
    }else {
        //publications
        fs.exists('bin/publications',(exists)=>{
            if(!exists) {
                fs.mkdir('bin/publications', { recursive: true }, (err) => {
                    if (err) {
                        console.log(err);
                    }

                });
            }
        })
    }
});
//check the existence of config file
fs.exists("bin/publications/config.sb",(exist)=>{
    if(!exist) {
        fs.writeFile("bin/publications/config.sb","[]",(err)=>{
            if(err) console.log(err);
        })
    }
})