/*
 *  BEGIN CONSTANTS
 */

// Canvas
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

// Node info
const nodeFillStyle = "#22CCCC";
const selectedNodeFillStyle = "#88aaaa";
const nodeStrokeStyle = "#009999";
const nodeRadius = 7;

/*
 *  END CONSTANTS
 */

// Globals
let nodes = [];
let currentSelected = undefined; 

/*
 *  BEGIN HELPER FUNCTIONS
 */

// Resizes the canvas dynamically to the window size when the page first laods
const resizeCanvas = () => {
    canvas.width = 0.75 * window.innerWidth;
    canvas.height = 400;
}

// Gets the position of the mouse with respect to the canvas
const getMousePosition = (mouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    return [mouseEvent.clientX - rect.left,
            mouseEvent.clientY - rect.top];
}

// Draws a node at the current position
const drawNodes = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    nodes.forEach((node) => {
        ctx.beginPath();
        ctx.fillStyle = node.selected ? selectedNodeFillStyle : nodeFillStyle;
        ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2, true);
        ctx.strokeStyle = nodeStrokeStyle;
        ctx.stroke();
        ctx.fill();
    });
}

// Checks if the current mouse position is clicking on a node
const clickedOnNode = (mouseX, mouseY) => {
    return nodes.find((node) => {
        return mouseX > (node.x - nodeRadius) &&
               mouseX < (node.x + nodeRadius) &&
               mouseY > (node.y - nodeRadius) &&
               mouseY < (node.y + nodeRadius);
    });
}

/*
 *  END HELPER FUNCTIONS
 */

/*
 *  BEGIN EVENT HANDLERS
 */

canvas.addEventListener('mousemove', (event) => {
    if (currentSelected) { 
        const [mouseX, mouseY] = getMousePosition(event);
        currentSelected.x = mouseX;
        currentSelected.y = mouseY;
        drawNodes();
    }
});

canvas.addEventListener('mousedown', (event) => {
    const [mouseX, mouseY] = getMousePosition(event);

    const clickedTarget = clickedOnNode(mouseX, mouseY);
    if (currentSelected && currentSelected.selected) {
        currentSelected.selected = false;
    } 
    if (clickedTarget) {
        currentSelected = clickedTarget;
        currentSelected.selected = true;
        drawNodes();
    }
});

canvas.addEventListener('mouseup', (event) => {
    if (!currentSelected) {
        const [mouseX, mouseY] = getMousePosition(event);

        let newNode = {
            x: mouseX,
            y: mouseY,
            selected: false
        };
        nodes.push(newNode);
        drawNodes();
    } 
    if (currentSelected && currentSelected.selected) {
        currentSelected.selected = false;
        currentSelected = undefined;
    }
    drawNodes();
});

/*
 *  END EVENT HANDLERS
 */