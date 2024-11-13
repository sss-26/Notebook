const info = document.getElementById('info');


function func(){
    let resp = window.api.ping()
    //console.log(resp);

    window.api.readFile("hello");
}

async function readFileByMain(path) {
    return  await window.api.readFile(path);
}

async function openFileByMain(){
    let filepaths =  await window.api.openFile();
    return filepaths;
}

