
let simWindow = document.getElementById("simWindow");
let simComponentTemplate = document.getElementById("componentTemplate")
let simConnectionTemplate = document.getElementById("connectionTemplate");
let optionTemplate = document.getElementById("optionTemplate");

let currentTool = "pan";
let mouseDown = false;
let mouseDownOnComponent = false;

let solving = false;
// X increases to the right
// Y increases downwards
const initialZoom = 50;
let zoom = initialZoom;
const zoomStep = 5;
let offset = new Vector2(); // px offset

let mouseDownBrowserCoords = new Vector2(); // relative to center of div in pixels
let mouseDownSimulCoords = new Vector2();   // relative to simulation coords, where one image is one pixel and the "original"
// center of the simulation is 0,0
let currentBrowserCoords = new Vector2();
let currentSimulCoords = new Vector2();

let selectedComponent = null;
let mouseDownComponentCoords = new Vector2(); // relative to center of div in pixels
let mouseDownComponentSimulNodes = [];
let currentComponentCoords = new Vector2();

let boundingDiv;
let centerVector;

let toolData = {
    "pan": {
        "offsetAtBeginningOfPan": new Vector2()
    },
    "wire": {
        "wireComponent": null
    }
}
let componentsOnNode = new Map() // has entries of type: "vec": Vector2(), "components": [], "elem": null or dot
// let components = [
//     {
//         "idx": 0,
//         "type": "resistor",
//         "resistance": 20, // ohms
//         "pd": null,
//         "emf": undefined,
//         "current": null,
//         "nodes": [new Vector2(0, 0), new Vector2(0, 2)],
//         "elements": null,
//         "selected": false
//     },
//     {
//         "idx": 1,
//         "type": "resistor",
//         "resistance": 20, // ohms
//         "pd": null,
//         "emf": undefined,
//         "current": null,
//         "nodes": [new Vector2(1, 2), new Vector2(3, 2)],
//         "elements": null,
//         "selected": false
//     }
// ];
let components = [{ "idx": 0, "type": "resistor", "resistance": 20, "pd": null, "current": null, "nodes": [{ "x": 0, "y": 0 }, { "x": 0, "y": 2 }], "elements": null, "selected": false, "updateData": { "nodes": [{ "x": 0, "y": 0 }, { "x": 0, "y": 2 }] }, "nodeEquipotentials": [{ "idx": 0 }, { "idx": 2 }] }, { "idx": 1, "type": "resistor", "resistance": 20, "pd": null, "current": null, "nodes": [{ "x": 1, "y": 2 }, { "x": 3, "y": 2 }], "elements": null, "selected": false, "updateData": { "nodes": [{ "x": 1, "y": 2 }, { "x": 3, "y": 2 }] }, "nodeEquipotentials": [{ "idx": 2 }, { "idx": 1 }] }, { "idx": 2, "type": "resistor", "resistance": 20, "pd": null, "current": null, "nodes": [{ "x": 1, "y": 1 }, { "x": 3, "y": 1 }], "elements": null, "selected": false, "updateData": { "nodes": [{ "x": 1, "y": 1 }, { "x": 3, "y": 1 }] }, "nodeEquipotentials": [{ "idx": 2 }, { "idx": 1 }] }, { "idx": 3, "type": "cell", "emf": 5, "current": null, "nodes": [{ "x": 0, "y": -2 }, { "x": 2, "y": -2 }], "elements": null, "selected": false, "updateData": { "nodes": [{ "x": 0, "y": -2 }, { "x": 2, "y": -2 }] }, "nodeEquipotentials": [{ "idx": 0 }, { "idx": 1 }] }, { "idx": 4, "type": "resistor", "resistance": 20, "pd": null, "current": null, "nodes": [{ "x": 2, "y": 0 }, { "x": 4, "y": 0 }], "elements": null, "selected": false, "updateData": { "nodes": [{ "x": 2, "y": 0 }, { "x": 4, "y": 0 }] }, "nodeEquipotentials": [{ "idx": 1 }, { "idx": 4 }] }, null, null, { "idx": 7, "type": "cell", "emf": 5, "current": null, "nodes": [{ "x": 2, "y": -2 }, { "x": 4, "y": -2 }], "elements": null, "selected": true, "updateData": { "nodes": [{ "x": 2, "y": -2 }, { "x": 4, "y": -2 }] }, "nodeEquipotentials": [{ "idx": 1 }, { "idx": 4 }] }, { "idx": 8, "type": "wire", "resistance": 0, "current": 0, "nodes": [{ "x": 0, "y": -2 }, { "x": 0, "y": 0 }], "elements": null, "selected": false, "updateData": { "nodes": [{ "x": 0, "y": -2 }, { "x": 0, "y": 0 }] } }, { "idx": 9, "type": "wire", "resistance": 0, "current": 0, "nodes": [{ "x": 0, "y": 2 }, { "x": 1, "y": 1 }], "elements": null, "selected": false, "updateData": { "nodes": [{ "x": 0, "y": 2 }, { "x": 1, "y": 1 }] } }, { "idx": 10, "type": "wire", "resistance": 0, "current": 0, "nodes": [{ "x": 0, "y": 2 }, { "x": 1, "y": 2 }], "elements": null, "selected": false, "updateData": { "nodes": [{ "x": 0, "y": 2 }, { "x": 1, "y": 2 }] } }, { "idx": 11, "type": "wire", "resistance": 0, "current": 0, "nodes": [{ "x": 3, "y": 2 }, { "x": 3, "y": 1 }], "elements": null, "selected": false, "updateData": { "nodes": [{ "x": 3, "y": 2 }, { "x": 3, "y": 1 }] } }, { "idx": 12, "type": "wire", "resistance": 0, "current": 0, "nodes": [{ "x": 3, "y": 1 }, { "x": 2, "y": 0 }], "elements": null, "selected": false, "updateData": { "nodes": [{ "x": 3, "y": 1 }, { "x": 2, "y": 0 }] } }, { "idx": 13, "type": "wire", "resistance": 0, "current": 0, "nodes": [{ "x": 2, "y": 0 }, { "x": 2, "y": -2 }], "elements": null, "selected": false, "updateData": { "nodes": [{ "x": 2, "y": 0 }, { "x": 2, "y": -2 }] } }, { "idx": 14, "type": "wire", "resistance": 0, "current": 0, "nodes": [{ "x": 4, "y": -2 }, { "x": 4, "y": 0 }], "elements": null, "selected": false, "updateData": { "nodes": [{ "x": 4, "y": -2 }, { "x": 4, "y": 0 }] } }];
for (let idx in components) {
    if (components[idx] == null) {
        delete components[idx];
    }
    else {
        delete components[idx].updateData;
        components[idx].nodes = components[idx].nodes.map((x) => { return new Vector2(x.x, x.y) })
    }
}
let componentData = {
    "resistor": {
        "width": (c) => { return new Vector2().subVectors(c.nodes[0], c.nodes[1]).length() },
        "height": (c) => { return "auto" },
        "defaultNodes": [new Vector2(0, 0), new Vector2(2, 0)],
        "imageSrc": "resistor.svg",
        "makeLabel": (currComponent) => {
            if (currComponent.resistance !== null) {
                return currComponent.resistance + "Ω";
            }
            else {
                return "?Ω";
            }
        },
        "editableProperties": {
            "resistance": {
                "valid": (x) => { return x > 0; }
            }
        }
    },
    "wire": {
        "width": (c) => { return new Vector2().subVectors(c.nodes[0], c.nodes[1]).length() },
        "height": (c) => { return 13.5 / 50 },
        "imageSrc": "wire.svg",
        "makeLabel": (currComponent) => {
            return "";
        },
        "editableProperties": {}
    },
    "cell": {
        "width": (c) => { return new Vector2().subVectors(c.nodes[0], c.nodes[1]).length() },
        "height": (c) => { return "auto" },
        "defaultNodes": [new Vector2(0, 0), new Vector2(2, 0)],
        "imageSrc": "cell.svg",
        "makeLabel": (currComponent) => {
            let str = "";
            if (currComponent.emf !== null) {
                str = currComponent.emf + "V";
            }
            else {
                str = "?V";
            }
            if (currComponent.current !== null && currComponent.current !== undefined) {
                str += " " + currComponent.current + "A";
            }
            return str;
        },
        "editableProperties": {
            "emf": {
                "valid": (x) => { return x != 0; }
            },
            "current": {
                "valid": (x) => true
            }
        }
    },
    "voltmeter": {
        "width": (c) => { return new Vector2().subVectors(c.nodes[0], c.nodes[1]).length() },
        "height": (c) => { return "auto" },
        "defaultNodes": [new Vector2(2, 0), new Vector2(0, 0)],
        "imageSrc": "voltmeter.svg",
        "makeLabel": (currComponent) => {
            let str = "";
            if (currComponent.pd !== null) {
                str = currComponent.pd + "V";
            }
            else {
                str = "?V";
            }
            return str;
        },
        "editableProperties": {
            "pd": {
                "valid": (x) => true
            }
        }
    },
    "ammeter": {
        "width": (c) => { return new Vector2().subVectors(c.nodes[0], c.nodes[1]).length() },
        "height": (c) => { return "auto" },
        "defaultNodes": [new Vector2(2, 0), new Vector2(0, 0)],
        "imageSrc": "ammeter.svg",
        "makeLabel": (currComponent) => {
            let str = "";
            if (currComponent.current !== null) {
                str = currComponent.current + "A";
            }
            else {
                str = "?A";
            }
            return str;
        },
        "editableProperties": {
            "current": {
                "valid": (x) => true
            }
        }
    }
}

simWindow.addEventListener("dblclick", (ev) => { })
simWindow.addEventListener("mousedown", (ev) => {
    mouseDown = true;
    getBrowserCoords(ev, mouseDownBrowserCoords);
    getSimulCoords(ev, mouseDownSimulCoords);

    if (currentTool == "select") {
        if (!mouseDownOnComponent) {
            deselectSelectedComponent();
        }
    }
    if (currentTool == "pan") {
        toolData.pan.offsetAtBeginningOfPan.copy(offset);
    }
    if (currentTool == "wire") {
        // create a wire component
        let wireComponent = {
            "idx": components.length,
            "type": "wire",
            "resistance": 0, // ohms
            "pd": undefined,
            "emf": undefined,
            "current": 0,
            "nodes": [mouseDownSimulCoords.clone().round(), mouseDownSimulCoords.clone().round()],
            "elements": null,
            "selected": false
        }
        components.push(wireComponent)
        updateComponent(wireComponent);
        wireComponent.elements.elem.style.pointerEvents = "none";
        toolData.wire.wireComponent = wireComponent;
    }
})
simWindow.addEventListener("mousemove", (ev) => {
    getBrowserCoords(ev, currentBrowserCoords);
    getSimulCoords(ev, currentSimulCoords);

    if (currentTool == "select") {
        mouseMoveForComponent(ev);
    }
    else if (currentTool == "pan" && mouseDown) {
        offset.subVectors(currentBrowserCoords, mouseDownBrowserCoords).add(toolData.pan.offsetAtBeginningOfPan);
        redrawAll();
    }
    else if (currentTool == "wire" && mouseDown) {
        // move the wire component
        toolData.wire.wireComponent.nodes[1].copy(currentSimulCoords).round();
        updateComponent(toolData.wire.wireComponent);
    }
})
simWindow.addEventListener("mouseup", (ev) => {
    mouseDown = false;
    mouseDownOnComponent = false;
    if (currentTool == "wire") {
        // draw the wire
        // check if the wire is not zero length
        if (new Vector2().subVectors(toolData.wire.wireComponent.nodes[0], toolData.wire.wireComponent.nodes[1]).lengthSq() < 1) {
            deleteComponent(toolData.wire.wireComponent);
        }
        toolData.wire.wireComponent = null;
    }
})

document.getElementById("zoomInButton").onclick = () => {
    if (zoom < 100) {
        let newZoom = zoom;
        newZoom -= (newZoom % zoomStep);
        newZoom += zoomStep;
        offset.multiplyScalar(newZoom / zoom)
        zoom = newZoom;
        redrawAll();
    }
}
document.getElementById("zoomOutButton").onclick = () => {
    if (zoom > 10) {
        let newZoom = zoom;
        newZoom -= zoomStep - (newZoom % zoomStep);
        newZoom -= zoomStep;
        offset.multiplyScalar(newZoom / zoom)
        zoom = newZoom;
        redrawAll();
    }
}

function getBrowserCoords(e, targetVec) {
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left - (rect.width / 2); //x position within the element.
    var y = e.clientY - rect.top - (rect.height / 2);  //y position within the element.

    targetVec.x = x;
    targetVec.y = y;
}
function getSimulCoords(e, targetVec) {
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX - rect.left - (rect.width / 2) - offset.x; //x position within the element.
    var y = e.clientY - rect.top - (rect.height / 2) - offset.y;  //y position within the element.

    targetVec.x = x / zoom;
    targetVec.y = y / zoom;
}
function deselectSelectedComponent() {
    if (selectedComponent !== null) {
        selectedComponent.selected = false;
        updateComponent(selectedComponent);
    }
    selectedComponent = null
    updateComponentInfo();
}
function updateComponentInfo() {
    if (selectedComponent !== null) {
        // show the component info
        let selectedInfoDiv = document.getElementById("selectedInfo");
        let selectedOptionsDiv = document.getElementById("selectedOptions");
        selectedInfoDiv.classList.remove("d-none")
        // check if the div already has records
        if (parseInt(selectedInfoDiv.getAttribute("data-componentid")) === selectedComponent.id) {
            // options have already been initiated
            // TODO
        }
        else {
            document.getElementById("selecteddetails_component").innerHTML = selectedComponent.type;
            selectedOptionsDiv.innerHTML = "";
            let options = componentData[selectedComponent.type].editableProperties;
            for (let optionName in options) {
                let optionElem = optionTemplate.content.firstElementChild.cloneNode(true);
                optionElem.querySelector(".optionName").innerHTML = optionName;
                optionElem.querySelector("input").value = selectedComponent[optionName];
                optionElem.querySelector("input").addEventListener("change", (e) => {
                    let val = parseFloat(e.target.value);
                    if (isNaN(val) || !options[optionName].valid(val)) {
                        selectedComponent[optionName] = null;
                    }
                    else {
                        selectedComponent[optionName] = val;
                    }
                    updateComponent(selectedComponent);
                })
                selectedOptionsDiv.appendChild(optionElem);
            }
        }

    }
    else {
        document.getElementById("selectedInfo").classList.add("d-none")
    }
}
function updateNode(node) {
    let centerPos = (new Vector2()).addVectors(centerVector, offset).add((new Vector2()).copy(node.vec).multiplyScalar(zoom));
    node.elements.elem.style.top = centerPos.y;
    node.elements.elem.style.left = centerPos.x;
    node.elements.svg.style.width = zoom * (7 / 50);
    node.elements.svg.style.height = zoom * (7 / 50);

    if (node.components.size > 1) {
        node.elements.circle.style.fillOpacity = 1;
    }
    else {
        node.elements.circle.style.fillOpacity = 0;
    }

    if (node.color !== undefined) {
        node.elements.circle.style.fill = node.color;
        node.elements.circle.style.stroke = node.color;
    }
    else {
        node.elements.circle.style.fill = "black";
        node.elements.circle.style.stroke = "black";
    }
}
function redrawNodes() {
    for (const [key, node] of componentsOnNode) {
        updateNode(node);
    }
}

function addComponentToNode(pointData, currComponent) {
    if (componentsOnNode.get(pointData.vec.toString()) === undefined) {
        // create the element
        let connectorElem = simConnectionTemplate.content.firstElementChild.cloneNode(true);
        let circle = connectorElem.querySelector("circle");
        let svg = connectorElem.querySelector("svg");
        simWindow.appendChild(connectorElem);
        componentsOnNode.set(pointData.vec.toString(), {
            "vec": new Vector2().copy(pointData.vec),
            "components": new Map(),
            "elements": {
                "elem": connectorElem,
                "svg": svg,
                "circle": circle
            }
        });
    }
    let node = componentsOnNode.get(pointData.vec.toString());
    let compList = node.components;
    if (compList.get(currComponent) === undefined) compList.set(currComponent, []);
    compList.get(currComponent)[pointData.type] = true;
    // update the circle
    updateNode(node);
}
function removeComponentFromNode(pointData, currComponent) {
    if (componentsOnNode.get(pointData.vec.toString()) !== undefined) {
        let node = componentsOnNode.get(pointData.vec.toString());
        let compList = node.components;
        let componentTypeList = compList.get(currComponent);
        delete componentTypeList[pointData.type];
        let componentTypeListEmpty = true;
        for (let key in componentTypeList) { componentTypeListEmpty = false; break; }
        if (componentTypeListEmpty) {
            compList.delete(currComponent);
        }
        if (compList.size == 0) {
            // delete the element
            node.elements.elem.remove();
            componentsOnNode.delete(pointData.vec.toString());
        }
        else {
            updateNode(node);
        }
    }
}

let colorLookup = {};

function updateComponent(currComponent) {
    if (currComponent.elements === null) {
        // this is the component initialisation
        currComponent.updateData = {
            "nodes": []
        }
        for (let node of currComponent.nodes) { currComponent.updateData.nodes.push(node.clone()) }
        let points = []
        for (let i = 0; i < currComponent.nodes.length; i++) { points.push({ "vec": currComponent.nodes[i].clone(), "type": i }) }
        for (let pointData of points) {
            addComponentToNode(pointData, currComponent)
        }
        // create the element
        let clone = simComponentTemplate.content.firstElementChild.cloneNode(true);
        let img = clone.querySelector("img");
        img.src = componentData[currComponent.type].imageSrc;
        let labelTextWrapper = clone.querySelector(".labelTextWrapper");
        let labelText = clone.querySelector(".labelText");

        currComponent.elements = {
            "elem": clone,
            "img": img,
            "labelTextWrapper": labelTextWrapper,
            "labelText": labelText
        }
        clone.addEventListener("dblclick", (ev) => { })
        clone.addEventListener("mousedown", (ev) => {
            ev.preventDefault();
            deselectSelectedComponent();
            if (selectedComponent == currComponent) {
                // deselect component
                selectedComponent = null;
                updateComponentInfo();
            }
            else {
                selectedComponent = currComponent;
                updateComponentInfo();
                selectedComponent.selected = true;
                mouseDownComponentSimulNodes = [];
                for (let i = 0; i < selectedComponent.nodes.length; i++) {
                    mouseDownComponentSimulNodes.push(selectedComponent.nodes[i].clone());
                }
                updateComponent(currComponent);
            }
            mouseDownOnComponent = true;

            mouseDownComponentCoords.x = ev.clientX;
            mouseDownComponentCoords.y = ev.clientY;
            currentComponentCoords.x = ev.clientX;
            currentComponentCoords.y = ev.clientY;
        })
        clone.addEventListener("mousemove", (ev) => {
            ev.preventDefault();
            mouseMoveForComponent(ev);
        })
        clone.addEventListener("mouseup", (ev) => {
            ev.preventDefault();
            mouseDown = false;
            mouseDownOnComponent = false;
        })

        simWindow.appendChild(clone);
    }

    let centerPos = (new Vector2()).addVectors(centerVector, offset).add((new Vector2()).addVectors(currComponent.nodes[0], currComponent.nodes[1]).multiplyScalar(zoom / 2));
    let rotAngle = (new Vector2()).subVectors(currComponent.nodes[0], currComponent.nodes[1]).angle();
    currComponent.elements.elem.style.top = centerPos.y;
    currComponent.elements.elem.style.left = centerPos.x;
    currComponent.elements.img.style.transform = "translate(-50%, -50%) rotate(" + rotAngle + "rad)"
    currComponent.elements.img.style.width = zoom * componentData[currComponent.type].width(currComponent);
    currComponent.elements.img.style.height = zoom * componentData[currComponent.type].height(currComponent);
    let textPositionVector = (new Vector2(0, - zoom * 0.6)).rotateAround(new Vector2(), rotAngle);
    currComponent.elements.labelTextWrapper.style.transform = "translate(calc(-50% + " + textPositionVector.x + "px), calc(-50% + " + textPositionVector.y + "px))";// scale(${zoom / 50})`;
    currComponent.elements.labelText.style.transform = "translate(-50%, -50%) scale(" + (0.5 * zoom / 50) + ")";

    currComponent.elements.labelText.innerHTML = componentData[currComponent.type].makeLabel(currComponent);

    if (currComponent.selected) {
        currComponent.elements.elem.style.filter = "invert(42%) sepia(35%) saturate(458%) hue-rotate(96deg) brightness(100%) contrast(90%)";
    }
    else {
        if (currComponent.color !== undefined) {
            if (colorLookup[currComponent.color] === undefined) {
                const rgb = hexToRgb(currComponent.color);
                if (rgb.length !== 3) {
                    alert('Invalid format!');
                }

                const color = new Color(rgb[0], rgb[1], rgb[2]);
                const solver = new Solver(color);
                const result = solver.solve(); // result.filter is output

                colorLookup[currComponent.color] = result.filter;
            }
            currComponent.elements.elem.style.filter = colorLookup[currComponent.color];
        }
        else {
            currComponent.elements.elem.style.filter = "";
        }
    }

    let simulPosChanged = false;
    for (let i = 0; i < Math.max(currComponent.nodes.length, currComponent.updateData.nodes.length); i++) {
        if (currComponent.updateData.nodes[i] === undefined || currComponent.nodes[i] === undefined || !currComponent.nodes[i].equals(currComponent.updateData.nodes[i])) {
            simulPosChanged = true;
            if (currComponent.updateData.nodes[i] !== undefined) {
                removeComponentFromNode({ "vec": currComponent.updateData.nodes[i], "type": i }, currComponent);
            }
            if (currComponent.nodes[i] !== undefined) {
                addComponentToNode({ "vec": currComponent.nodes[i], "type": i }, currComponent);
            }
        }
    }
    if (simulPosChanged) {
        currComponent.updateData.nodes = [];
        for (let node of currComponent.nodes) { currComponent.updateData.nodes.push(node.clone()) }
    }
}
function redrawComponents() {
    for (let idx in components) {
        let currComponent = components[idx];
        updateComponent(currComponent);
    }
}
function redrawBackground() {
    simWindow.style.backgroundSize = zoom + "px " + zoom + "px";
    simWindow.style.backgroundPosition = "calc(50% + " + offset.x + "px) " + "calc(50% + " + offset.y + "px)";
}
function redrawAll() {
    boundingDiv = simWindow.getBoundingClientRect();
    centerVector = new Vector2(boundingDiv.width / 2, boundingDiv.height / 2);
    redrawComponents();
    redrawNodes();
    redrawBackground();
    //switchTool(currentTool);
}
//function addComponent()

function mouseMoveForComponent(ev) {
    if (mouseDownOnComponent) {
        if (selectedComponent !== null) {
            currentComponentCoords.x = ev.clientX;
            currentComponentCoords.y = ev.clientY;
            // move the component
            let movementVector = (new Vector2()).subVectors(currentComponentCoords, mouseDownComponentCoords).multiplyScalar(1 / zoom).round();

            for (let i = 0; i < selectedComponent.nodes.length; i++) {
                selectedComponent.nodes[i].addVectors(mouseDownComponentSimulNodes[i], movementVector);
            }
            updateComponent(selectedComponent);
        }
        return true;
    }
    return false;
}
function addComponent(type) {
    let centerSimCoords = offset.clone().multiplyScalar(- 1 / zoom).round();
    let newComponent = undefined;
    if (type == "resistor") {
        newComponent = {
            "idx": components.length,
            "type": "resistor",
            "resistance": 20, // ohms
            "pd": null,
            "emf": undefined,
            "current": null,
            "nodes": componentData[type].defaultNodes.map((node) => { return node.clone().add(currentSimulCoords).round() }),
            "elements": null,
            "selected": false
        }
    }
    else if (type == "cell") {
        newComponent = {
            "idx": components.length,
            "type": "cell",
            "resistance": undefined, // ohms
            "pd": undefined,
            "emf": 5,
            "current": null,
            "nodes": componentData[type].defaultNodes.map((node) => { return node.clone().add(currentSimulCoords).round() }),
            "elements": null,
            "selected": false
        }
    }
    else if (type == "ammeter") {
        newComponent = {
            "idx": components.length,
            "type": "ammeter",
            "resistance": undefined, // ohms
            "pd": undefined,
            "emf": undefined,
            "current": null,
            "nodes": componentData[type].defaultNodes.map((node) => { return node.clone().add(currentSimulCoords).round() }),
            "elements": null,
            "selected": false
        }
    }
    else if (type == "voltmeter") {
        newComponent = {
            "idx": components.length,
            "type": "voltmeter",
            "resistance": undefined, // ohms
            "pd": null,
            "emf": undefined,
            "current": undefined,
            "nodes": componentData[type].defaultNodes.map((node) => { return node.clone().add(currentSimulCoords).round() }),
            "elements": null,
            "selected": false
        }
    }
    if (newComponent !== undefined) {
        updateComponent(newComponent);
        components.push(newComponent);
    }
}
function deleteComponent(selectedComponent) {
    // remove from nodes, then remove elements, then delete.
    for (let i = 0; i < selectedComponent.nodes.length; i++) {
        removeComponentFromNode({ "vec": selectedComponent.nodes[i], "type": i }, selectedComponent);
    }
    selectedComponent.elements.elem.remove();
    delete components[selectedComponent.idx];
}
function deleteSelectedComponent() {
    if (selectedComponent !== null) {
        mouseDownOnComponent = false;
        deleteComponent(selectedComponent)
    }
}
function rotateSelectedComponent() {
    if (selectedComponent !== null) {
        // calculate the rotated node location
        for (let i = 1; i < selectedComponent.nodes.length; i++) {
            let dirVec = new Vector2().subVectors(selectedComponent.nodes[i], selectedComponent.nodes[0]);
            let newDir = new Vector2(-dirVec.y, dirVec.x);
            selectedComponent.nodes[i].addVectors(selectedComponent.nodes[0], newDir);
        }
        updateComponent(selectedComponent);
    }
}

let colors = ["#FF0000", "#FF7F00", "#00FF10", "#0010FF", "#FF00FF"];

function beginSolving() {
    solving = true;
    let equipotentials = [];
    // start at any component, then flood out
    // const specialRelationComponentTypes = ["cell", "ammeter", "voltmeter"]
    let specialRelationComponents = []
    for (let idx in components) {
        // clear data
        let currComponent = components[idx];
        delete currComponent.nodeEquipotentials;

        // if (specialRelationComponentTypes.indexOf(currComponent.type) !== -1) {
        //     specialRelationComponents.push(currComponent);
        // }
    }
    for (let [key, value] of componentsOnNode) {
        value.equipotential = undefined;
    }
    let floodWireEquipotentials, floodComponent;
    floodWireEquipotentials = (nodeVec, equipotential) => {
        //console.log(JSON.parse(JSON.stringify(components.map((x) => { return { nodes: x.nodes, nodeEquipotentials: x.nodeEquipotentials } }))));
        // go into the component list at this node
        if (componentsOnNode.get(nodeVec.toString()) === undefined) {
            console.warn("Component node accessed with no component");
        }
        else {
            let node = componentsOnNode.get(nodeVec.toString());
            if (node.equipotential === undefined) {
                // TODO: remember to clear this when restarting
                node.equipotential = equipotential;
                equipotential.nodes.push(node);

                let compList = node.components;
                compList.forEach((value, key) => {
                    let currComponent = key;
                    let connectedNodes = value;

                    if (currComponent.type === "wire") {
                        // TODO: we can set the equipotential that the wire is on here, might come in useful later
                        // wires are all 2 nodes, so just get the other one
                        equipotential.wires.push(currComponent);
                        for (let key in connectedNodes) {
                            if (key >= 0 && key < 2) {
                                floodWireEquipotentials(currComponent.nodes[1 - key], equipotential);
                            }
                            else {
                                console.error("Unexpected wires");
                            }
                        }
                    }
                    if (currComponent.type !== "wire") {
                        // set the equipotential for the nodes of this component, then flood it
                        for (let key in connectedNodes) {
                            if (currComponent.nodeEquipotentials === undefined) {
                                currComponent.nodeEquipotentials = [];
                                for (let i of currComponent.nodes) {
                                    currComponent.nodeEquipotentials.push(null); // null means we haven't assigned it a node equipotential yet
                                }
                            }
                            currComponent.nodeEquipotentials[key] = equipotential;
                        }
                    }
                })
            }
        }
    }
    floodComponent = (currComponent) => {
        // this should never be a wire
        if (currComponent.nodeEquipotentials === undefined) {
            currComponent.nodeEquipotentials = [];
            for (let i of currComponent.nodes) {
                currComponent.nodeEquipotentials.push(null); // null means we haven't assigned it a node equipotential yet
            }
        }
        // if a node equipotential hasn't been assigned yet, we need to create a new one
        for (let i = 0; i < currComponent.nodeEquipotentials.length; i++) {
            if (currComponent.nodeEquipotentials[i] === null) {
                let newEquipotential = {
                    "idx": equipotentials.length,
                    "value": undefined,
                    "nodes": [],
                    "wires": [],
                    "connections": new Map()
                };
                equipotentials.push(newEquipotential);
                currComponent.nodeEquipotentials[i] = newEquipotential;
                // now flood these wires
                floodWireEquipotentials(currComponent.nodes[i], newEquipotential)
            }
        }
    }
    for (let idx in components) {
        let currComponent = components[idx];
        if (currComponent.type !== "wire") {
            // check that this has no potentials assigned
            floodComponent(currComponent);
        }
    }

    // now that we have all of our equipotentials done, lets actually solve for the values of the equipotentials
    // first though
    // colors!!!
    for (let i = 0; i < equipotentials.length; i++) {
        // color everything
        for (let node of equipotentials[i].nodes) {
            node.color = colors[i % (colors.length)];
        }
        for (let wire of equipotentials[i].wires) {
            wire.color = colors[i % (colors.length)];
        }
    }
    redrawAll();

    let variables = {};
    let addVariable = (variable) => {
        variables[variable.name] = variable;
    }
    let equations = [];
    let nonLinearEquations = [];
    // first assign a voltage to each equipotential
    for (let i = 0; i < equipotentials.length; i++) {
        let variable = new Variable("P_" + i);
        addVariable(variable);
        equipotentials[i].value = variable;

        console.log(colors[i % (colors.length)], variable.toString());
    }
    // next go through current-related components and assign voltage relationships
    // brb, adding ammeters and voltmeters
    // OK done
    let currentVars = 0;
    let voltageVars = 0;
    let resistanceVars = 0;
    let productVars = 0; // this is a product of an unknown voltage difference and resistance
    for (let idx in components) {
        let component = components[idx];

        // also add connections to their equipotentials
        let addToConnlist = () => {
            for (let i = 0; i < 2; i++) {
                let connList = component.nodeEquipotentials[i].connections.get(component.nodeEquipotentials[1 - i]);
                if (connList === undefined) {
                    component.nodeEquipotentials[i].connections.set(component.nodeEquipotentials[1 - i], [])
                    connList = component.nodeEquipotentials[i].connections.get(component.nodeEquipotentials[1 - i]);
                }
                connList.push({
                    "component": component,
                    "forwards": i != 0
                })
            }
        }
        if (component.type === "cell") {
            // variables for everything!
            if (component.emf === null) {
                let variable = new Variable("V_" + voltageVars);
                voltageVars += 1;
                addVariable(variable);
                component.emf = variable;
            }
            if (component.current === null) {
                let variable = new Variable("I_" + currentVars);
                currentVars += 1;
                addVariable(variable);
                component.current = variable;
            }

            equations.push(new Expression(0).add(component.nodeEquipotentials[1].value).sub(component.nodeEquipotentials[0].value).sub(component.emf));

            addToConnlist();
        }
        else if (component.type === "ammeter") {
            // voltage link both equipotentials
            equations.push(new Expression(0).add(component.nodeEquipotentials[0].value).sub(component.nodeEquipotentials[1].value));
            if (component.current === null) {
                let variable = new Variable("I_" + currentVars);
                currentVars += 1;
                addVariable(variable);
                component.current = variable;
            }

            addToConnlist();
        }
        else if (component.type === "voltmeter") {
            // same as cell
            if (component.pd === null) {
                let variable = new Variable("V_" + voltageVars);
                voltageVars += 1;
                addVariable(variable);
                component.pd = variable;
            }
            equations.push(new Expression(0).add(component.nodeEquipotentials[1].value).sub(component.nodeEquipotentials[0].value).sub(component.pd));

            addToConnlist();
        }
        else if (component.type === "resistor") {
            if (component.resistance == null) {
                let variable = new Variable("G_" + resistanceVars);
                resistanceVars += 1;
                addVariable(variable);
                component.conductance = variable;
            }
            else {
                component.conductance = 1 / component.resistance;
            }
            addToConnlist();
        }
    }
    // now do relations for each node equipotential
    for (let equipotential of equipotentials) {
        let equation = new Expression(0);
        for (let [targetEquipotential, connections] of equipotential.connections) {
            for (let connInfo of connections) {
                let component = connInfo.component;
                let forwards = connInfo.forwards;

                if (component.type === "cell") {
                    equation = equation.add(component.current.mul(forwards ? 1 : -1))
                }
                else if (component.type === "ammeter") {
                    equation = equation.add(component.current.mul(forwards ? 1 : -1))
                }
                else if (component.type === "voltmeter") {
                    // no current
                }
                else if (component.type === "resistor") {
                    // equipotentials need to be calculated anyway, but do we know conductance?
                    // eh whatever, make a compound variable and check for solvabilty
                    let compound = new Variable("X_" + productVars);
                    addVariable(compound);
                    let current = (new Expression(0).add(targetEquipotential.value).sub(equipotential.value)).mul(component.conductance);
                    nonLinearEquations.push(new Equation(compound, current));
                    equation = equation.add(current);
                }
            }
        }
        equations.push(equation);
    }
    // looks like we're writing our own equation solver
    // luckily for now everything can be linsolved
    // uh.... let's also assume our circuit is fully connected so V diffs aren't too bad
    // basically, a lot of stuff can break this, so lets just hope that stuff doesn't break this! teehee.
    // in all seriousness, what we should expect is that eliminated 4/5 equipot variables eliminates the 5th as well
    for (in)
}
function stopSolving() {
    solving = false;
}

function switchTool(targetTool) {
    if (targetTool == "solve") {
        stopSolving();
        beginSolving();
        redrawComponents();
    }
    if (targetTool == "closeSolve") {
        stopSolving();
        redrawComponents();
    }
    if (targetTool == "select") {
        // turn on pointer events for all components
        for (let idx in components) {
            let component = components[idx];
            if (component.elements !== null) {
                component.elements.elem.style.pointerEvents = "auto";
            }
        }
    }
    else {
        // turn off pointer events for all components
        for (let idx in components) {
            let component = components[idx];
            if (component.elements !== null) {
                component.elements.elem.style.pointerEvents = "none";
            }
        }
    }
    currentTool = targetTool;
}

new ResizeObserver(redrawAll).observe(simWindow)

redrawAll();