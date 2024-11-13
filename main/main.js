const {app, BrowserWindow, Menu, ipcMain, dialog }= require('electron/main');
//if (require('electron-squirrel-startup')) app.quit();
const fs = require('node:fs');
const {unlinkSync} = require('node:fs')
const path = require('node:path');

const global_variable = {
    "main-ui" : "main-ui.html",
    "preload" : "preload.js",
    "file-ext" : "nts"
}

const createWindow = (url,preload=null,menu=null) => {
    const win = new BrowserWindow({
        icon :path.join(__dirname,"icon\notebook_256x256.png"),
        webPreferences : {
            preload:preload
        }
    });
    if(menu == null){
        menu = Menu.buildFromTemplate([]);
    }
    win.setMenu(menu);
    win.loadFile(url);
    return win;
}

const createWebWindow = (url,menu=null) => {
    const win = new BrowserWindow({
        icon :path.join(__dirname,"icon\notebook_256x256.png"),
    });
    if(menu == null){
        menu = Menu.buildFromTemplate([]);
    }
    win.setMenu(menu);
    win.loadURL(url);
    return win;
}

function openTutorialWindow(){
    createWebWindow("https://sss-26.github.io/Notebook");
}

app.whenReady().then(()=>{
    
    addListeners();
    let menu = Menu.buildFromTemplate([
        {label:"Tutorial", click : async()=>{openTutorialWindow()}}
    ])
    let mainWindow = createWindow(global_variable["main-ui"],path.join(__dirname,global_variable["preload"]),menu);
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0){
            mainWindow = createWindow(global_variable["main-ui"],path.join(__dirname,global_variable["preload"])).maximize();
        }
    });

    mainWindow.once('ready-to-show',()=> {mainWindow.maximize()});
    
})

app.on('wondow-all-closed', () => {
    if(process.platform !== 'darwin') app.quit()
});

function addListeners(){
    
    let listeners = [
        { event : 'ping',       handler : ()=>'pong'    },
        { event : 'createFile', handler : createFile    },
        { event : 'saveFile',   handler : saveFile      },
        { event : 'openFile',   handler : openFile      },
        { event : 'readFile',   handler : readFile      },
        { event : 'renameFile', handler : renameFile    },
        { event : 'deleteFile', handler : deleteFile    },
        { event : 'openFolder', handler : openFolder    },
        { event : 'cmdArgs',    handler : cmdArgs       }
        
    ];

    for(let listerner of listeners){
        ipcMain.handle( listerner.event, listerner.handler);
    }
    
}
function cmdArgs(){
    let files = [];
    if(process.argv.length > 1 && process.argv[1]!="."){
        for(let i = 1; i < process.argv.length; i++){
            files.push({name : path.basename(process.argv[i]), path : process.argv[i]})
        }
        return files;
    }

    return process.argv.length;
}
function createFile(){
    let filepath = dialog.showSaveDialogSync({
        filters : [
            {name:'Note', extensions:['nts']}
        ]
    });

    fs.writeFileSync(filepath,'{"cells":[]}');
    return {name:path.basename(filepath) ,path : filepath, folder : path.dirname(filepath)};
}

function deleteFile(ev,path){ 
    try{
        unlinkSync(path)
        return true;
    }catch(e){
        return false;
    }
    
}

function saveFile(ev, path, data){
    /* path : String, data : String */

    //console.log("main>saveFile : " + data +" | "+path);
    try{
        fs.writeFileSync(path,data);
    }catch(e){
        console.log(e);
        return false;
    }

    return true;
}

function openFile(){
    try{
        let  filepaths = dialog.showOpenDialogSync({
            properties:["openFile"],
            filters:[
                {name:'Note', extensions:['nts']}
            ]
        });

        let data = [{
            name : path.basename(filepaths[0]),
            path : filepaths[0]
        }];
    
        return data;
    }catch(e){
        return false;
    }
}


function readFile(ev, path){
    console.log(path);
    let data = fs.readFileSync(path,'utf8');
    return JSON.parse(data);
}

function renameFile(ev, oldpath){
    try{
        let newpath = dialog.showSaveDialogSync({
        defaultPath : oldpath,
        properties : ["openFile","openDirectory"],
        filters : [
            {name:'Note', extensions:['nts']}
        ]
        });

        fs.renameSync(oldpath,newpath);
        return {path : newpath, name : path.basename(newpath)};
    }catch(e){
        return false;
    }
}

function openFolder() {
    let folder = dialog.showOpenDialogSync({
        properties : ["openDirectory"],
        filters:[
            {name:'Note', extensions:['nts']}
        ]
    })

    let files = fs.readdirSync(folder[0]);
    files = files.map((file)=>{return path.join(folder[0],file)})
    files = files.filter((file) => {
        try{
        let stat =  fs.statSync(file);
        return stat.isFile() && path.extname(file)=="."+global_variable["file-ext"];
        }catch(err){
        }
        return false;
    })
    files = files.map((file)=>{return {name:path.basename(file), path:file}})
    // console.log(path.basename(folder[0]));
    return {name : path.basename(folder[0]), path : folder[0], files : files}
}
