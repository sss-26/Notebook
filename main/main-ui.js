var sideNavContextMenuTarget;
let dropElement;
function dragTab(ev) {

    dropElement = ev.target;
}
function allowDrop(ev) {
    ev.preventDefault();
}
function dropTab(ev) {
    ev.preventDefault();
    target = ev.target;
    while (target.nodeName != "DIV") {
        target = target.parentElement;
    }
    target.insertAdjacentElement("afterend", dropElement);
}
function sideNavContextMenu(ev){
    let menu = document.querySelector(".side-nav-contextmenu");
    menu.style.display = "flex";
    let operations = menu.children
    for(let operation of operations){
        operation.style.display = 'block';
    }
    sideNavContextMenuTarget = ev.target;
    if(!sideNavContextMenuTarget.className.includes('file')){
        let operations = menu.children
        for(let operation of operations){
            operation.style.display = 'block';
            switch(operation.textContent.toLocaleLowerCase()){
                case "delete":
                    operation.style.display = 'none';
                    break;
                    case "rename":
                        operation.style.display = 'none';
                    break;
            }
        }
    }
    menu.style.top = ev.clientY + "px";
    menu.style.left = ev.clientX + "px";
}
function sideNavContextMenuOperation(ev){
    let menu = document.querySelector(".side-nav-contextmenu");
    menu.style.display = "none";
    if(sideNavContextMenuTarget == null || sideNavContextMenuTarget == undefined){
        return;
    }

    let button = ev.target;
    let type = button.textContent.toLowerCase();
    // console.log(sideNavContextMenuTarget.localName)
    if(sideNavContextMenuTarget.localName.toLowerCase() == "summary"){
        sideNavContextMenuTarget = sideNavContextMenuTarget.parentElement;
    }
    switch(type){
        case "remove":
            sideNavContextMenuTarget.remove();
            break; 
        case "rename":
            renameFile();
            break;
        case "delete":
            deleteFile();
    }
    
}
function showContainer(ev) {
    let button = ev.target;
    if (button.nodeName == "SPAN" || button.nodeName == "IMG") {
        button = button.parentElement;
    }
    let tab = document.querySelector('.active-tab');
    tab==undefined || tab.classList.remove("active-tab");
    button.classList.add("active-tab");
    let id = button.dataset["id"];
    //console.log(id);
    let activeContainer = document.querySelector('div.active-frame');
    activeContainer==null || activeContainer.classList.remove("active-frame");
    let container = document.querySelector('div.frame[data-id="' + id + '"]');
    container.classList.add("active-frame");
    //console.log(container);
}

function updateRenamedFile(newinfo,oldpath){
    let list = Object.entries(window.sessionStorage);

    for(item of list){
        if(item[1] == oldpath){
            window.sessionStorage.setItem(item[0],newinfo.path)
            document.querySelector('.frame[data-id="'+item[0]+'"]').dataset['file'] = newinfo.path;
            let tab = document.querySelector('.tab[data-id="'+item[0]+'"]>span');
            tab.textContent = newinfo.name;
            tab.parentElement.title = newinfo.name;
        }
    }

    let files = document.querySelectorAll('.file[data-file]')

    for(let file of files){
        if(file.dataset['file'] == oldpath){
            file.dataset['file'] = newinfo.path;
            file.title = newinfo.path;
            file.textContent = newinfo.name;
        }
    }

    // console.log('.file[data-file="'+oldpath+'"]');
}

function removeContainer(ev) {
    ev.stopPropagation();
    let button = ev.target;
    let id = button.parentElement.dataset["id"];
    let nearestElement = button.parentElement.nextElementSibling;
    nearestElement = nearestElement == null ? button.parentElement.previousElementSibling : nearestElement;

    if (nearestElement !== null && button.parentElement.className.includes("active")) {
        nearestElement.click();
    }
    let container = document.querySelector('div.frame[data-id="' + id + '"]');
    container.remove();
    button.parentElement.remove();
}

function removeFile(path){
    let files = document.querySelectorAll(".file");
    for(let file of files){
        if(file.dataset['file']==path){
            file.remove();
        } 
    }

    let storageItems = Object.entries(window.sessionStorage);
    if (storageItems==null){
        return;
    } 
    for(let item of storageItems){
        if(item[1] == path){
            let tab = document.querySelector('.tab[data-id="'+item[0]+'"]');
            let frame = document.querySelector('.frame[data-id="'+item[0]+'"]');
            if (tab != null){
                tab.remove(); 
                frame.remove()
            }

            window.sessionStorage.removeItem(item[0]);
        }
    }

}

function appendFiles(files) {
    /* info : files = [ {name : file.nts , path : a//path//to//file} ] */

    loadingScreen("show");
    let sideNav = document.querySelector('.side-nav');
    
    let node = "",nodes=[],fragment = document.createDocumentFragment();
    for (let file of files) {
        node = '<button class="file" data-file="' + file.path + '" onclick="showFile(event)" title="' + file.path + '" oncontextmenu="sideNavContextMenu(event)">' + file.name + '</button>' + node;
        temp = document.createElement('button');
        temp.classList.add("file");
        temp.dataset.file = file.path;
        temp.setAttribute("title",file.path);
        temp.textContent = file.name;
        temp.addEventListener('click',showFile);
        fragment.appendChild(temp);
        nodes.push(temp);
    };
    //sideNav.append(...nodes);
    sideNav.insertAdjacentHTML("afterbegin", node);

    let folders = document.querySelectorAll('.folder>summary');
    node="";
    for(let file of files){
        for(let folder of folders){
            if(folder.dataset['folder']==file.folder){
                node = '<button class="file" data-file="' + file.path + '" onclick="showFile(event)" title="' + file.path + '" oncontextmenu="sideNavContextMenu(event)">' + file.name + '</button>' + node;
                folder.nextElementSibling.insertAdjacentHTML("beforeend",node);
            }
        }
    }
    loadingScreen("hide");
}

function appendFolder(folder){
    loadingScreen("show");
    let sideNav = document.querySelector('.side-nav');
    let node="";
    let foldernode;

    for (let file of folder.files) {
        node += '<button class="file" data-file="' + file.path + '" onclick="showFile(event)" title="' + file.path + '" oncontextmenu="sideNavContextMenu(event)">' + file.name + '</button>';
    }

    foldernode = `
                    <details class="folder">
                        <summary title="${folder.path}" data-folder="${folder.path}" oncontextmenu="sideNavContextMenu(event)">${folder.name}</summary>
                        <div>
                            ${node}
                        </div>
                    </details>
                `
    sideNav.insertAdjacentHTML("afterbegin", foldernode);
    loadingScreen("hide");
}

async function openFile() {
    let files = await openFileByMain();
    if(!files){
        return;
    }
    appendFiles(files);
    let filenodes = document.querySelectorAll(".file");

    for (let i = 0; i < files.length; i++) {
        filenodes[i].click();
    }
}

async function renameFile(ev){
    loadingScreen('show',"Renaming...");
    let oldpath = sideNavContextMenuTarget.dataset['file'];
    let newpath = await window.api.renameFile(oldpath);
    if(newpath){
        updateRenamedFile(newpath,oldpath);
    }
    loadingScreen('hide');
}
async function deleteFile(ev) {
    if(!sideNavContextMenuTarget.className.includes("file")){
        return;
    }
    loadingScreen('show',"Deleting...");
    let path = sideNavContextMenuTarget.dataset['file'];
    let status = await window.api.deleteFile(path)
    if(status){
        sideNavContextMenuTarget.remove();
        removeFile(path);
    }else{
        alert("Error Occured");
    }
    loadingScreen('hide');
}
async function openFolder() {
    let folderinfo = await window.api.openFolder();
    appendFolder(folderinfo);
}
async function showFile(ev) {
    let filenode = ev.target;
    let filepath = filenode.dataset['file'];
    let filename = filenode.textContent;
    let mainViewNav = document.querySelector('.main-view-nav');
    let mainViewContent = document.querySelector('.main-view-content');
    let id = getId();
    let filedata = await readFileByMain(filepath);
    let tab = '<div data-id="id' + (id) + '" class="tab" onclick="showContainer(event)" ondrag="dragTab(event)" ondrop="dropTab(event)" ondragover="allowDrop(event)" draggable="true" title="'+filename+'"><span>'+filename+'</span><img src="icon/cross.png" draggable="false" onclick="removeContainer(event)" draggable="false"></div>';
    let frame = '<div class="frame" data-id="id' + (id) + '"></div>';
    let mainContainer = document.getElementById('template-main-container');
    window.sessionStorage.setItem("id"+id,filepath);
    mainContainer = mainContainer.content.cloneNode(true);
    mainViewNav.insertAdjacentHTML('beforeend', tab);
    mainViewContent.insertAdjacentHTML('beforeend',frame);
    mainViewContent.lastElementChild.append(mainContainer);
    //mainViewContent.lastElementChild
    let mainContent = mainViewContent.lastElementChild.children[0].children[1];
    setFullData(mainContent,JSON.stringify(filedata));
    //console.log(mainContent);
    mainViewNav.lastChild.click();
}

async function createFile() {
    let file = await window.api.createFile();
    appendFiles([file]);
}
async function saveFile(ev) {
    if(ev.target.textContent.toLowerCase() != "save" || !ev.isTrusted){
        return;
    }
    loadingScreen("show","Saving...");
    let frame = ev.target.parentElement.parentElement.parentElement.parentElement;
    let frameId = frame.dataset.id;
    let path = window.sessionStorage.getItem(frameId);
    let data = getFullData(ev);

    data = JSON.stringify(data);
    let status = await window.api.saveFile(path,data);
    loadingScreen("hide");
    // console.log(ev.isTrusted);
}
let getId = (function () {
    let counter = 0;
    return function () {
        counter++;
        return counter;
    }
})();

function loadingScreen(status,text="Loading..."){
    // Status should be 'show' or 'hide'
    let display= {
        "show" : "flex",
        "hide" : "none"
    }
    document.querySelector(".loading>h1").textContent = text;
    document.querySelector(".loading").style.display = display[status.toLowerCase()];
}

window.addEventListener("click", (event) => {
    let sidenavcontextmenu = document.querySelector(".side-nav-contextmenu");
    sidenavcontextmenu.style.display = "none";
});

(async function(){
    let files = await window.api.cmdArgs();
    if (typeof(files) == "number")
        return;
    appendFiles(files);
    let filenodes = document.querySelectorAll(".file");
    for(let i=0; i<files.length ;i++){
        filenodes[i].click();
    }
})();