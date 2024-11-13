/*---------------------------------- Common Script ----------------------------------*/

/*---------------------------------- Cell-Intregation Script ----------------------------------*/

let template = (ev) => {

    let node = document.getElementById("template-cell-container");
    let clone = node.content.cloneNode(true);

    document.body.appendChild(clone);

    ev == undefined || ev.stopPropagation();
};
//template(null);

// Toggle mode
let toggle = (ev) => {
    let mainContent = ev.target.parentElement.parentElement.nextElementSibling;
    let mainOperation = mainContent.previousElementSibling;
    let operations = mainOperation.children[0].children;
    let node = ev.target;

    if (node.textContent.toLowerCase() == "save") {

        node.textContent = "Edit";
        let allnode = mainContent.querySelectorAll(".editable, [class*='list']");

        for (let i = 0; i < allnode.length; i++) {
            allnode[i].contentEditable = false;
        }

        for(let operation of operations){
            operation.disabled = true;
        }

    } else {

        node.textContent = "Save";
        let allnode = mainContent.querySelectorAll(".editable, [class*='list']");

        for (let i = 0; i < allnode.length; i++) {
            allnode[i].contentEditable = true;
        }

        for(let operation of operations){
            operation.disabled = false;
        }
    }

    let op = mainContent.querySelectorAll(".main-content [class*='operation']");

    if (op.length == 0) {
        return;
    }

    let val = op[0].style.display;

    for (let i = 0; i < op.length; i++) {

        op[i].contentEditable = false;

        if (val !== "none") {
            op[i].style.display = "none";

        } else {
            op[i].style.display = "flex";
        }
    }

    let cells = mainContent.querySelectorAll(".cell-container, .list-container, .text-container");

    for (let cell of cells) {
        cell.classList.toggle("save");
    }
    if (node.textContent.toLowerCase() == "save") {
        //console.log("getfulldata");
        getFullData(ev);
    }

    ev == undefined || ev.stopPropagation();
}

function addCell(ev) {

    let button = ev.target;
    let mainContent = button.parentElement.parentElement.nextElementSibling;
    let type = button.textContent;
    type = type.toLowerCase();
    let cell = document.getElementById("template-cell-container").content.cloneNode(true);
    let element = null;
    switch (type) {
        case "heading":
            element = document.getElementById("template-heading-container").content.cloneNode(true);
            break;
        case "table":
            element = document.getElementById("template-table-container").content.cloneNode(true);
            break;
        case "list":
            element = document.getElementById("template-list-container").content.cloneNode(true);
            break;
        case "n-list":
            element = document.getElementById("template-n-list-container").content.cloneNode(true);
            break;
        case "text":
            element = document.getElementById("template-text-container").content.cloneNode(true);
            break;
        case "image":
            cell.querySelector(".cell-operation").children[0].style.display = "none";
            element = document.getElementById("template-image-container").content.cloneNode(true);
            break;
    }
    cell.firstElementChild.children[1].appendChild(element);
    mainContent.appendChild(cell);
    //console.log(cell);

}

function createCell(type) {

    let cell = document.getElementById("template-cell-container").content.cloneNode(true);
    let element = null;

    switch (type) {
        case "heading":
            element = document.getElementById("template-heading-container").content.cloneNode(true);
            break;
        case "table":
            element = document.getElementById("template-table-container").content.cloneNode(true);
            break;
        case "list":
            element = document.getElementById("template-list-container").content.cloneNode(true);
            break;
        case "text":
            element = document.getElementById("template-text-container").content.cloneNode(true);
            break;
        case "image":
            cell.querySelector(".cell-operation").children[0].style.display = "none";
            element = document.getElementById("template-image-container").content.cloneNode(true);
            break;
    }
    cell.firstElementChild.children[1].appendChild(element);

    return cell;
}

function setArrange(ev) {
    let button = ev.target;
    let cells = document.querySelectorAll(".main-content .cell-container");
    let flag = true;

    switch (button.textContent.toLowerCase()) {
        case "arrange":
            button.textContent = "Set";
            break;

        case "set":
            button.textContent = "Arrange";
            flag = false;
            break;
    }

    for (cell of cells) {
        cell.draggable = flag;
    }
}

function getFullData(ev) {
    let button = ev.target;
    let mainContent = button.parentElement.parentElement.nextElementSibling;
    let cells = mainContent.children;
    let fulldata = { cells: [] }, data = {};

    for (cell of cells) {
        container = cell.children[1].children[0];
        containerType = container.className.replaceAll("-container", "").replaceAll("editable", "").trim();

        switch (containerType) {
            case "image":
                data = getImageData(container);
                break;
            case "text":
                data = getTextData(container);
                break;
            case "heading":
                data = getHeadingData(container);
                break;
            case "list":
                data = getListData(container);
                break;
            case "table":
                data = getTableData(container);
                break;
        }
        //console.log(data.fontSize);
        data.fontSize = cell.children[0].children[0].children[1].value;
        data.fontFamily = cell.children[0].children[0].children[3].value;

        fulldata.cells.push(data);

    }

    //console.log(JSON.stringify(fulldata));
    return fulldata;
}

function getImageData(container) {
    let data = {
        type: "image",
        fontSize: null,
        fontFamily: null,
        content: {
            data: null
        }
    }
    //console.log(container.children);
    data.content.data = container.children[1].children[0].src;

    return data;
}

function getTextData(container) {
    let data = {
        type: "text",
        fontSize: null,
        fontFamily: null,
        content: {
            data: null
        }
    }

    data.content.data = container.children[1].value;

    return data;
}

function getListData(container) {
    let data = {
        type: "list",
        fontSize: null,
        fontFamily: null,
        content: {
            data: null
        }
    }

    data.content.data = makeListData(container.children[0])
    //console.log(JSON.stringify(data));

    return data;
}

function makeListData(list) {
    let data = {
        type: list.className,
        items: []
    }
    let items = list.children;
    for (item of items) {
        if (item.className.includes("item")) {
            let itemData = {
                text: "",
                lists: []
            }
            let text = "";
            let pattern = /\n +/;
            for (content of item.childNodes) {

                if (pattern.test(content.textContent)) {
                    break;
                } else if (content.nodeName == "#text") {
                    text += content.textContent;
                } else if (content.nodeName == "BR") {
                    text += "<br>";
                }
            }
            itemData.text = text;
            if (item.children.length > 0) {
                for (childList of item.children) {
                    if (childList.className == "list" || childList.className == "list-number") {
                        let temp = makeListData(childList);
                        itemData.lists.push(temp);
                    }
                }
            }
            data.items.push(itemData);
        }
    }
    //console.log(JSON.stringify(data));
    return data;
}

function getTableData(container) {
    let data = {
        type: "table",
        fontSize: null,
        fontFamily: null,
        content: {
            data: []
        }
    }
    let rowData = [];
    for (row of container.children[0].children[0].children) {

        if (!row.className.includes("operation")) {
            //console.log("Row");
            rowData = [];
            for (col of row.children) {
                if (!col.className.includes("operation")) {
                    //console.log(col);
                    rowData.push(col.textContent);
                }
            }
            data.content.data.push(rowData);
        }
    }

    //console.log(data);
    return data;
}

function getHeadingData(container) {
    let data = {
        type: "heading",
        fontSize: null,
        fontFamily: null,
        content: {
            align: "",
            hr: "",
            data: ""
        }
    }

    data.content.data = container.children[1].textContent;
    let hrStyle = container.children[1].children[0].style;
    data.content.hr = hrStyle.display == "" ? "block" : hrStyle.display;
    data.content.align = container.children[1].style["text-align"];

    return data;
}
rawdata = '{"cells":[{"type":"heading","fontSize":"18","fontFamily":"Arial, Helvetica, sans-serif","content":{"align":"center","hr":"block","data":"Test Heading"}},{"type":"table","fontSize":"16","fontFamily":"Arial, Helvetica, sans-serif","content":{"data":[["hello","hello","hello"],["hi","hi","hi"]]}},{"type":"list","fontSize":"16","fontFamily":"Arial, Helvetica, sans-serif","content":{"data":{"type":"list","items":[{"text":"hello<br>","lists":[{"type":"list","items":[{"text":"item1<br>","lists":[]},{"text":"item2<br>","lists":[]},{"text":"<br>","lists":[]},{"text":"<br>","lists":[]}]}]},{"text":"<br>","lists":[]},{"text":"<br>","lists":[]},{"text":"<br>","lists":[]}]}}},{"type":"text","fontSize":"16","fontFamily":"Arial, Helvetica, sans-serif","content":{"data":"gi:`dfgfdgdgd`gdgfdb:`gfdgvc`bcbc gfdgdg p:`gfdgdgd`"}},{"type":"image","fontSize":"16","fontFamily":"Arial, Helvetica, sans-serif","content":{"data":"data:image/png;base64,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"}}]}';

function setFullData(container, rawdata) {

    let saveButton = container.previousElementSibling.children[1].lastElementChild;
    let fulldata = JSON.parse(rawdata);
    let cell = null;
    if(fulldata.cells == null){
        saveButton.click();
        return;
    }
    //console.log(fulldata);
    for (celldata of fulldata.cells) {
        containerType = celldata.type;
        cell = createCell(containerType);
        switch (containerType) {
            case "image":
                setImageData(cell.firstElementChild.children[1].children[0], celldata);
                //data = getImageData(container);
                break;
            case "text":
                setTextData(cell.firstElementChild.children[1].children[0], celldata);
                //data = getTextData(container);
                break;
            case "heading":
                setHeadingData(cell.firstElementChild.children[1].children[0], celldata);
                //data = getHeadingData(container);
                break;
            case "list":
                setListData(cell.firstElementChild.children[1].children[0], celldata);
                //data = getListData(container);
                break;
            case "table":
                setTableData(cell.firstElementChild.children[1].children[0], celldata);
                //data = getTableData(container);
                break;
        }
        //console.log(cell.firstElementChild.children[1]);
        //console.log(cell.firstElementChild.firstElementChild.children[0].children[3]);
        cell.firstElementChild.firstElementChild.children[0].children[1].value = celldata.fontSize;
        cell.firstElementChild.firstElementChild.children[0].children[3].value = celldata.fontFamily;
        cell.firstElementChild.children[1].style["font-size"] = celldata.fontSize + "px";
        cell.firstElementChild.children[1].style["font-family"] = celldata.fontFamily;
        container.appendChild(cell);
        //console.log(container);
    }
    
    saveButton.click();
    
}

function setImageData(container, data) {
    //console.log(container.children[1].children[0].src);
    //console.log(data);
    container.children[1].children[0].src = data.content.data;
}

function setTableData(container, data) {
    let table = container.children[0].children[0];
    //console.log(table);

    //console.log(data)
    let rows = data.content.data;
    let trOperation = table.children[0];
    let collen = trOperation.cells.length;
    let tr, td;

    for (let i = 0; i < collen - 1; i++) {
        trOperation.deleteCell(0);
    }
    collen = rows[0].length;
    for (let i = 0; i < collen; i++) {
        td = trOperation.insertCell(0);
        td.innerHTML = '<button onclick="deleteColumn(event)" >del</button>';

    }

    let trlen = table.children.length - 2;
    //console.log(trlen);
    for (let i = 0; i < trlen; i++) {
        table.children[1].remove();
    }

    for (let row of rows) {
        tr = table.insertRow(table.children.length - 1);
        tr.contentEditable = false;
        for (col of row) {
            td = tr.insertCell();
            td.classList.add('editable');
            td.contentEditable = true;
            td.textContent = col;
        }
        td = tr.insertCell();
        td.classList.add("table-operation");
        td.innerHTML = '<button onclick="deleteRow(event)" contenteditable="false">X</button>';
    }
}

function setListData(container, data) {
    let list = container.children[0];
    //console.log(JSON.stringify(data.content.data));
    let type = data.content.data.type;
    //console.log("List :");
    //console.log(data)
    switch(type){
        case "list-number":
            list.classList.replace("list","list-number");
        break;
    }
    makeListFromData(list, data.content.data);
    //console.log(list);
    //document.getElementsByClassName("main-content")[0].appendChild(list)
}
function makeListFromData(list, data) {
    //console.log(data);
    //list.children[0].textContent = data.items[0].text ;
    list.children[0].remove();
    //<p class="item" oncontextmenu="contextmenuOperation(event)">...</p>
    let p, nlist,type="item";


    for (item of data.items) {
        p = document.createElement("p");
        p.classList.add("item");
        p.innerHTML = item.text;
        p.addEventListener('contextmenu', contextmenuOperation);
        for (itemlist of item.lists) {
            if (itemlist.type == "list")
                nlist = document.getElementById("template-list").content.cloneNode(true);
            else {
                nlist = document.getElementById("template-list-ordered").content.cloneNode(true);
            }
            //console.log(nlist.children[0]);
            makeListFromData(nlist.children[0], itemlist);
            p.appendChild(nlist);
        }
        list.appendChild(p);
    }

}

function setTextData(container, data) {
    let text = container.children[1];

    text.value = data.content.data;
    container.children[2].innerHTML = textToHtml(text.value);
    //console.log(data);
}

function setHeadingData(container, data) {
    let heading = container.children[1];


    heading.textContent = data.content.data;
    heading.appendChild(document.createElement("hr"));
    heading.children[0].style.display = data.content.hr;
    heading.style["text-align"] = data.content.align;
    //console.log(data);
}

let mainContent = document.querySelector(".main-content");
//console.log(mainContent);
//setFullData(mainContent, rawdata);

/*---------------------------------- Cell Script ----------------------------------*/

// Set Font Size
function setFontSize(ev) {
    let button = ev.target;
    let parentContainer = button.parentElement;
    let fontsizeInput = parentContainer.children[1];
    let cellContainer = parentContainer.parentElement.nextElementSibling;
    let fontsize = parseInt(fontsizeInput.value);

    switch (button.textContent) {
        case "-":
            fontsize -= 2;
            break;
        case "+":
            fontsize += 2;
            break;
    }
    fontsizeInput.value = fontsize;

    cellContainer.style["font-size"] = fontsizeInput.value + "px";

    //console.log(fontsizeInput.value);
    ev.stopPropagation();
}

function setFontFamily(ev) {
    let selectButton = ev.target;
    let fontStyle = selectButton.value;
    let cellContainer = selectButton.parentElement.parentElement.nextElementSibling;
    cellContainer.style["font-family"] = fontStyle;
    //console.log(cellContainer);

    ev.stopPropagation();
}

let target;

function deleteCell(ev) {
    ev.target.parentElement.parentElement.parentElement.remove();
    ev.stopPropagation();
}

function testDrag(ev) {
    let cell = ev.target;
    target = cell;
    //console.log(target);
}

function testDrop(ev) {
    ev.preventDefault();
    let cell = ev.target;
    //console.log("ON_DROP");
    //console.log("Before : "+cell.className);
    while (cell.className != "cell-container") {
        cell = cell.parentElement;
    }
    //console.log("After : "+cell.className);
    cell.insertAdjacentElement("afterend", target);
    //console.log(ev);

    ev.stopPropagation();
}

function testDragOver(ev) {
    //console.log(ev);

    ev.preventDefault();
}

function moveCell(ev) {
    let button = ev.target;
    let cell = button.parentElement.parentElement.parentElement;
    let nextCell = cell.nextElementSibling;
    let previousCell = cell.previousElementSibling;

    switch (button.textContent.toLowerCase()) {
        case "up":
            if (previousCell == null)
                return;
            previousCell.insertAdjacentElement("beforebegin", cell);
            break;
        case "down":
            if (nextCell == null)
                return;
            nextCell.insertAdjacentElement("afterend", cell);
            break;
    }

    cell.scrollIntoView({ block: "center" });
}

function containerOperation(ev) {
    let button = ev.target;
    let type = button.textContent.toLowerCase();
    let container = button.parentElement.parentElement;
    //console.log(button);
    let node = document.getElementById("template-cell-container");
    let cell = node.content.cloneNode(true);
    let element = null;
    //console.log(clone);
    switch (type) {
        case "heading":
            element = document.getElementById("template-heading-container").content.cloneNode(true);
            break;
        case "table":
            element = document.getElementById("template-table-container").content.cloneNode(true);
            break;
        case "list":
            element = document.getElementById("template-list-container").content.cloneNode(true);
            break;
        case "n-list":
            element = document.getElementById("template-n-list-container").content.cloneNode(true);
            break;
        case "text":
            element = document.getElementById("template-text-container").content.cloneNode(true);
            break;
        case "image":
            cell.querySelector(".cell-operation").children[0].style.display = "none";
            element = document.getElementById("template-image-container").content.cloneNode(true);
            break;
    }
    cell.firstElementChild.children[1].appendChild(element);
    container.insertAdjacentElement("afterend", cell.children[0]);

}

/*---------------------------------- Heading Script ----------------------------------*/

function textFormatHeading(ev) {
    let button = ev.target;
    let textarea = button.parentElement.nextElementSibling;
    //console.log(textarea);
    switch (button.textContent) {
        case "C":
            (textarea.style["text-align"] != "center") ? textarea.style["text-align"] = "center" : textarea.style["text-align"] = "start";
            break;
        case "L":
            (textarea.style["text-align"] != "left") ? textarea.style["text-align"] = "left" : textarea.style["text-align"] = "start";
            break;
        case "R":
            (textarea.style["text-align"] != "right") ? textarea.style["text-align"] = "right" : textarea.style["text-align"] = "start";
            break;
        case "H":
            if (textarea.lastElementChild == null)
                textarea.appendChild(document.createElement("hr"));
            (textarea.lastElementChild.style.display != "block") ? textarea.lastElementChild.style.display = "block" : textarea.lastElementChild.style.display = "none";
            break;
    }

    //console.log(textarea);
}

function getData(container) {
    //console.log(container);
    let h1Style = window.getComputedStyle(container.children[1]);
    let hrStyle = window.getComputedStyle(container.children[1].children[0]);
    let containerStyle = window.getComputedStyle(container);
    let data = {
        "version": "0.0.Dev",
        "type": "heading",
        "font-size": containerStyle.fontSize,
        "font-family": containerStyle.fontFamily,
        "content": {
            "align": h1Style.textAlign,//container.children[1].style["text-align"]=="" ? "left" : container.children[1].style["text-align"],
            "hr": hrStyle.display,//container.children[1].children[0].style.display=="" ? "none" : "block",
            "data": container.children[1].textContent
        }
    };

    return data;
}

function setData(data, container) {
    container.style["font-size"] = data["font-size"];
    container.children[1].style["text-align"] = data["content"]["align"];
    container.children[1].innerHTML = data["content"]["data"] + "<hr>";
    container.children[1].children[0].style.display = data["content"]["hr"];

    //console.log(container.children[1]);
}

//let val = getData(document.querySelectorAll(".heading-container")[0]);
//console.log(val); 

let data = {
    "version": "0.0.Dev",
    "type": "heading",
    "font-size": 16,
    "font-family": "Arial",
    "content": {
        "align": "",
        "hr": "none",
        "data": "dummy text"
    }
};
//setData(val ,document.querySelectorAll(".heading-container")[0] );

/*---------------------------------- List Script ----------------------------------*/

// Global variables
let mouseEventStorage = {
    rightKeyTarget: null,
    leftKeyTarget: null
};

// Add Item in the List
let addItem = (ev) => {

    let operation = ev.target.parentElement;
    let list = operation.previousElementSibling;

    list.innerHTML += '<p class="item" oncontextmenu="contextmenuOperation" ></p>';

    ev == undefined || ev.stopPropagation();
}


// Delete Item from the List
let deleteItem = (ev) => {
    let item = mouseEventStorage.rightKeyTarget;

    if (item.parentElement.children.length == 1) {
        item.parentElement.nextElementSibling.remove();
        item.parentElement.remove();
    }
    item.remove();
    contextmenuOperation(ev);
    ev.stopPropagation();
}

// Add nested List
let addList = (ev) => {

    let template = null;

    if (ev.target.getAttribute("data-type") == "ordered") {
        template = document.getElementById("template-list-ordered");
    } else {
        template = document.getElementById("template-list");
    }

    let node = ev.target;
    let list = node.parentElement.parentElement;
    let clone = template.content.cloneNode(true);
    let item = node.parentElement;
    let clone_node = clone.cloneNode(true);
    //console.log(clone_node);
    clone_node = mouseEventStorage.rightKeyTarget.appendChild(clone_node);

    contextmenuOperation(ev);

    ev.stopPropagation();
}
// Delete List
let deleteList = (ev) => {
    let operation = ev.target.parentElement;
    let list = operation.previousElementSibling;

    operation.remove();
    list.remove();

    ev.stopPropagation();
}

// Contextmenu Operation
function contextmenuOperation(ev) {
    ev.preventDefault();

    let contextmenu = document.querySelector(".contextmenu");

    mouseEventStorage.rightKeyTarget = ev.target;
    contextmenu.style.display = "none";

    if (ev.button != 2 || !ev.target.isContentEditable) {
        return;
    }

    if (contextmenu.style.display != "flex") {
        contextmenu.style.display = "flex";
        contextmenu.style.top = ev.clientY + "px";
        contextmenu.style.left = ev.clientX + "px";
    }
    ev.stopPropagation();
}

// Add Item from Contextmenu
let addItemContextmenu = (ev) => {

    if (mouseEventStorage.rightKeyTarget.className == "list") {
        mouseEventStorage.rightKeyTarget.insertAdjacentHTML("beforeend", '<p class="item" oncontextmenu="contextmenuOperation(event)" ></p>');
    } else if (mouseEventStorage.rightKeyTarget.className == "list-container") {
        //alert("Add a List Insert Item");
    } else {
        mouseEventStorage.rightKeyTarget.insertAdjacentHTML("afterend", '<p class="item" oncontextmenu="contextmenuOperation(event)" ></p>');
    }
}

// Global Window Listeners
window.addEventListener("click", (event) => {
    let contextmenu = document.querySelector(".contextmenu");
    contextmenu.style.display = "none";
});

window.addEventListener("keydown", (ev) => {

    let contextmenu = document.querySelector(".contextmenu");

    contextmenu.style.display = "none";

});

window.addEventListener("contextmenu", (event) => {
    event.preventDefault();
});

/*---------------------------------- Text Script ----------------------------------*/

function view(ev) {
    let containers = document.querySelectorAll(".text-container");
    let textView = "flex", textEdit = "none";

    for (let i = 0; i < containers.length; i++) {
        let text = containers[i].children[1].value;
        text = textToHtml(text);
        //console.log(text);
        containers[i].children[2].innerHTML = "<span>" + text + "</span>";
    }

    //console.log(containers);
    if (ev.target.textContent == "Edit") {
        //console.log("view:");
        textView = "none";
        textEdit = "flex";
    }
    for (let i = 0; i < containers.length; i++) {
        containers[i].children[1].style.display = textEdit;
        //console.log(containers[i].children[1].value);
        containers[i].children[2].style.display = textView;
    }

    ev.stopPropagation();
}
let textStorage = {
    selection: {
        start: null,
        end: null
    }
};

function selectText(ev) {
    //console.log(ev.target);
    textStorage.selection.start = ev.target.selectionStart;
    textStorage.selection.end = ev.target.selectionEnd;
    //console.log(textStorage);

    ev.stopPropagation();
}

function getCaret(ev) {
    //console.log(ev.target.selectionStart);
    let textarea = ev.target;
    let text = textarea.value;
    let b_text = text.slice(0, textarea.selectionStart);
    let m_text = text.slice(textStorage.selection.start, textStorage.selection.end);
    let a_text = text.slice(textarea.selectionEnd,);
    //console.log(b_text+"p:`dsfdsfs`"+a_text);

    ev.stopPropagation();
}

function textFormatText(ev) {
    //console.log(ev.target.parentElement.parentElement.nextElementSibling);
    let textarea = ev.target.parentElement.parentElement.nextElementSibling;
    let text = textarea.value;
    //console.log(textarea);
    let b_text = text.slice(0, textStorage.selection.start);
    let m_text = text.slice(textStorage.selection.start, textStorage.selection.end);
    let a_text = text.slice(textStorage.selection.end,);
    let type;
    switch (ev.target.textContent) {
        case "B":
            type = "b";
            break;
        case "I":
            type = "i";
            break;
        case "U":
            type = "u"
            break;
        case "Pop Up":
            type = "p"
            break;
    }
    let formattedText = b_text + type + ":`" + m_text + "`" + a_text;
    //console.log(formattedText);
    textarea.value = formattedText;

    ev.stopPropagation();
}

function clearText(ev) {
    let button = ev.target;
    let textarae = button.parentElement.parentElement.nextElementSibling;
    textarae.value = "";

    ev.stopPropagation();
}

function textToHtml(text) {
    let intermediateData = text, finalData;
    const pattern = /[biup]:`/g;
    let indexList = [-1];
    let index;
    while (intermediateData.search(pattern) != -1) {
        index = intermediateData.search(pattern);
        //console.log(index);
        indexList.push(indexList[indexList.length - 1] + index + 1);
        intermediateData = intermediateData.slice(index + 1);
    }

    intermediateData = text;
    let temp;
    let i = indexList.length - 1;
    let indexListEnd
    while (i > 0) {
        indexListEnd = intermediateData.indexOf("`", indexList[i] + 3);
        //console.log("i:"+intermediateData[indexList[i]]);
        switch (intermediateData[indexList[i]]) {
            case "b":
                temp = "<b>" + intermediateData.slice(indexList[i] + 3, indexListEnd) + "</b>";
                intermediateData = intermediateData.replace("b:`" + intermediateData.slice(indexList[i] + 3, indexListEnd) + "`", temp);
                //console.log(temp);
                break;
            case "i":
                temp = "<i>" + intermediateData.slice(indexList[i] + 3, indexListEnd) + "</i>";
                intermediateData = intermediateData.replace("i:`" + intermediateData.slice(indexList[i] + 3, indexListEnd) + "`", temp);
                //console.log(temp);
                break;
            case "u":
                temp = "<u>" + intermediateData.slice(indexList[i] + 3, indexListEnd) + "</u>";
                intermediateData = intermediateData.replace("u:`" + intermediateData.slice(indexList[i] + 3, indexListEnd) + "`", temp);
                //console.log(temp);
                break;
            case "p":
                temp = "<span class='popup'>!<span>" + intermediateData.slice(indexList[i] + 3, indexListEnd) + "</span></span>";
                intermediateData = intermediateData.replace("p:`" + intermediateData.slice(indexList[i] + 3, indexListEnd) + "`", temp);
                //console.log("P:"+temp);
                break;
            default:
                break;
        }
        i--;


    }
    intermediateData = intermediateData.replace(/\r\n|\n\r|\n/gm, "<br>");
    //console.log("text : "+intermediateData.charCodeAt(1));

    return intermediateData;
}

/*---------------------------------- Image Script ----------------------------------*/

let mouseDown = false, mouseMove = false;
let cursorPosition = {
    x: 0,
    y: 0,
    transformX: 0,
    transformY: 0,
    rotate: 0
};

// Zoom
let incr = 1;
let zoom = (ev) => {

    //ev.target+=incr;
    if (!mouseMove) {
        switch (ev.button) {
            case 0:
                incr += 0.2;
                break;
            case 2:
                incr -= 0.2;
                break;
        }
        ev.target.style.scale = incr;


        //ev.target.style.scale=incr;
    }
}

let changePosition = (ev) => {
    if (mouseDown) {
        mouseMove = true;
        let transformMatrix = new DOMMatrix(window.getComputedStyle(ev.target).transform);
        //console.log(ev.target.style.transform);
        //console.log(ev.clientX-cursorPosition.x);
        ev.target.style.transform = "translate(" + (cursorPosition.transformX + ev.clientX - cursorPosition.x) + "px," + (cursorPosition.transformY + ev.clientY - cursorPosition.y) + "px) rotate(" + cursorPosition.rotate + "deg)";

        //console.log(typeof(transformMatrix.e + ev.clientX - cursorPosition.x));

    }
}

let mouseHandler = (ev) => {
    switch (ev.type) {
        case "mousedown":
            //console.log("mousedown");
            let transformMatrix = new DOMMatrix(window.getComputedStyle(ev.target).transform);
            cursorPosition.transformX = transformMatrix.e;
            cursorPosition.transformY = transformMatrix.f;
            cursorPosition.x = ev.clientX;
            cursorPosition.y = ev.clientY;
            mouseDown = true;
            break;
        case "mouseup":
            cursorPosition.x = 0;
            cursorPosition.y = 0;
            mouseDown = false;
            mouseMove = false;
            break;
    }
}

// Reset Image
let resetImage = (ev) => {
    let button = ev.target;
    let image = button.parentElement.parentElement.nextElementSibling.children[0];
    image.style.scale = 1;
    image.style.transform = "translate(0,0) rotate(0deg)";
    cursorPosition.rotate = 0;
    cursorPosition.transformX = 0;
    cursorPosition.transformY = 0
    //console.log(image);
}

let degree = 0;

// Rotate Image
let rotateImage = (ev) => {
    let button = ev.target;
    let rotate = button.getAttribute("data-rotate");
    switch (rotate) {
        case "c": degree += 45;
            break;
        case "a": degree -= 45;
            break;
    }
    let image = button.parentElement.parentElement.nextElementSibling.children[0];
    image.style.transform = "rotate(" + degree + "deg) translate(" + cursorPosition.transformX + "px," + cursorPosition.transformY + "px)";
    cursorPosition.rotate = degree;
    //console.log("rotate("+degree+"deg) translate("+cursorPosition.transformX+"px,"+cursorPosition.transformY+"px)");
}

let showInfo = (ev) => {
    let info = (ev.target.nodeName == "IMG") ? ev.target.nextElementSibling : ev.target.children[1];

    switch (info.style.display) {
        case "block":
            info.style.display = "none";
            break;
        default:
            info.style.display = "block";
            break;
    }
}

let uploadImage = (ev) => {
    let input = ev.target.nextElementSibling;
    //console.log(input);
    input.click();

}

let getImageInput = (ev) => {
    //console.log("Target : " + ev.target);
    let file = ev.target.files[0];
    let reader = new FileReader();
    let image = ev.target.parentElement.parentElement.nextElementSibling.children[0];
    //console.log("Target : "+ev.target);
    reader.onload = (e) => {
        //console.log(e);
        //console.log(reader.result);
        let dataURL = reader.result;
        image.src = dataURL;
    };
    let imageBlob = reader.readAsDataURL(file);
}

// Delete Image
let deleteImage = (ev) => {
    let button = ev.target;
    let imageContainer = button.parentElement.parentElement.parentElement;
    imageContainer.remove();
}

/*---------------------------------- Table Script ----------------------------------*/

// Delete row of a table
let deleteRow = (ev) => {
    ev.target.parentElement.parentElement.remove();
    ev.stopPropagation();
}

// Delete column of a table
let deleteColumn = (ev) => {

    let node = ev.target.parentElement;
    let index = node.cellIndex;
    let row = node.parentElement;
    let table = row.parentElement;
    let rows = table.children;

    for (let i = 0; i < rows.length - 1; i++) {
        rows[i].children.item(index).remove();
    }
    ev.stopPropagation();
}

// Add row in table
let addRow = (ev) => {
    let node = ev.target;
    let table = node.parentElement.parentElement.parentElement;
    let coltmpl = '<td class="table-operation" contenteditable="false"><button onclick="deleteRow(event)" contenteditable="false">X</button></td>';
    let rowlen = table.children.length;
    let collen = table.children[0].childElementCount;

    for (let i = 0; i < collen - 1; i++) {
        coltmpl = '<td class="editable" contenteditable="true"></td>' + coltmpl;
    }
    table.insertRow(rowlen - 1).innerHTML = coltmpl;
    ev.stopPropagation();
}

// Add column in table
let addColumn = (ev) => {
    let node = ev.target;
    let table = node.parentElement.parentElement.parentElement;
    let rows = table.children;
    let collen = rows[0].childElementCount;
    let cell;
    for (let i = 0; i < rows.length - 1; i++) {
        rows[i].contentEditable = false;
        cell = rows[i].insertCell(collen - 1);
        if( i>0){
            cell.contentEditable = true;
            cell.classList.add("editable");
        }
    }
    let len = rows[0].childElementCount
    rows[0].children[len - 2].innerHTML = '<button onclick="deleteColumn(event)"" contenteditable="false">del</button>'
    ev.stopPropagation();
}