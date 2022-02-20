/*
 *  BEGIN CONSTANTS
 */

// Canvas
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

// Color and styling specs
const nodeFillStyle = "#22CCCC";
const selectedNodeFillStyle = "#88aaaa";
const nodeStrokeStyle = "#009999";
const nodeRadius = 7;

const fontSize = 18;
const fontStyle = fontSize + "px Arial";
const fontColor = "#000000";

const lineColor = "#000000";

const bezierStep = 0.01;
const bezierColor = "#FF0000";
const pointRadius = 1;

/*
 *  END CONSTANTS
 */

/*
 *  BEGIN GLOBALS
 */

// An array of nodes currently on the canvas
//  Each node element contains:
//      x => current x position of the node
//      y => current y position of the node
//      selected => boolean of whether the node is currently selected
let nodes = [];

// Node that is currently being selected
let currentSelected = undefined; 

// Value to check if we should display certain elements
let displayLines = true;
let displayNodes = true;

/*
 *  END GLOBALS
 */

/*
 *  BEGIN MATH FUNCTIONS
 */

const cubicBSpline = (i, x) => {
    switch (i) {
        case 0:
            return (x >= 0 && x < 1) ? 1 : 0;
        case 1:
            return x * cubicBSpline(i - 1, x) + (2 - x) * cubicBSpline(i - 1, x - 1);
        case 2:
            return x * cubicBSpline(i - 1, x) / 2 + (3 - x) / 2 * cubicBSpline(i - 1, x - 1);
        case 3:
            return x * cubicBSpline(i - 1, x) / 3 + (4 - x) / 3 * cubicBSpline(i - 1, x - 1);
    }
}

const support = (i, x) => {
    switch (i) {
        case 1:
            return x * x * (1 - x) * cubicBSpline(0, x) / 2 + x * (2 - x) * cubicBSpline(1, x) / 4 + (3 - x) * cubicBSpline(2, x) / 3;
        case 2:
            return x * (1 - x) * (2 - 3 * x / 2) * cubicBSpline(0, x) + (2 - x) * (2 - x) * cubicBSpline(1, x) / 4;
        case 3:
            return (1 - x) * (1 - x) * (1 - x) * cubicBSpline(0, x);
    }
}

const bezierCurve = (t) => {
    const n = nodes.length - 3;
    const nt = n * t;
    let bx = 0, by = 0;

    bx += nodes[0].x * support(3, nt) + nodes[1].x * support(2, nt) + nodes[2].x * support(1, nt);
    by += nodes[0].y * support(3, nt) + nodes[1].y * support(2, nt) + nodes[2].y * support(1, nt);

    for (let i = 1; i <= n - 3; i++) {
        const B3 = cubicBSpline(3, nt - i + 2);
        bx += nodes[i + 2].x * B3;
        by += nodes[i + 2].y * B3;
    }

    bx += nodes[n].x * support(1, n - nt) + nodes[n + 1].x * support(2, n - nt) + nodes[n + 2].x * support(3, n - nt);
    by += nodes[n].y * support(1, n - nt) + nodes[n + 1].y * support(2, n - nt) + nodes[n + 2].y * support(3, n - nt);

    return [ bx, by ];
}

/*
 *  END MATH FUNCTIONS
 */

/*
 *  BEGIN HELPER FUNCTIONS
 */

// Toggle display functions
const toggleLines = () => {
    displayLines = !displayLines;
    drawNodes();
}
const toggleNodes = () => {
    displayNodes = !displayNodes;
    drawNodes();
}

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

const drawBezier = () => {
    // TODO: This logic could probably be simplified and cleaned-up

    let bezierPoints = [bezierCurve(0)];

    ctx.beginPath();
    ctx.strokeStyle = bezierColor;

    for (let t = bezierStep; t <= 1; t += bezierStep) {
        bezierPoints.push(bezierCurve(t));
        
        const currPoint = bezierPoints[bezierPoints.length - 1];
        const prevPoint = bezierPoints[bezierPoints.length - 2];
        ctx.moveTo(prevPoint[0], prevPoint[1]);
        ctx.lineTo(currPoint[0], currPoint[1]);
    }

    ctx.stroke();
}

const drawLines = () => {
    if (!displayLines) {
        return;
    }

    ctx.beginPath();
    ctx.strokeStyle = lineColor;

    nodes.forEach((node) => {
        if (node.number != nodes.length) {
            const nextNode = nodes[node.number];
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(nextNode.x, nextNode.y);
        }
    });
    
    ctx.stroke();
}

// Draws all nodes from the `nodes` array 
const drawNodes = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = fontStyle;

    // Draw lines connecting each node
    drawLines();

    if (nodes.length > 2) {
        drawBezier();
    }

    if (!displayNodes) {
        return;
    }

    nodes.forEach((node) => {
        ctx.beginPath();

        // Draw the node
        ctx.fillStyle = node.selected ? selectedNodeFillStyle : nodeFillStyle;
        ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2, true);
        ctx.strokeStyle = nodeStrokeStyle;
        ctx.stroke();
        ctx.fill();

        // Draw the text for the node
        ctx.fillStyle = fontColor;
        ctx.fillText(`a${node.number}`, node.x + fontSize / 2, node.y + fontSize);
    });
}

// Checks if the current mouse position is clicking on a node
//  Will return the node if they are, undefined otherwise
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
    // If we are currently selecting a node, move it to the current
    //   mouse position and redraw 
    if (currentSelected) { 
        const [mouseX, mouseY] = getMousePosition(event);
        currentSelected.x = mouseX;
        currentSelected.y = mouseY;
        drawNodes();
    }
});

canvas.addEventListener('mousedown', (event) => {
    const [mouseX, mouseY] = getMousePosition(event);
    
    // If we're currently selecting a node, clear it 
    if (currentSelected && currentSelected.selected) {
        currentSelected.selected = false;
    } 

    // Check if we are clicking on a node, and redraw 
    const clickedTarget = clickedOnNode(mouseX, mouseY);
    if (clickedTarget) {
        currentSelected = clickedTarget;
        currentSelected.selected = true;
        drawNodes();
    }
});

canvas.addEventListener('mouseup', (event) => {
    // If we aren't currently selecting a node, create a new one
    //   at the current mouse position 
    if (!currentSelected) {
        const [mouseX, mouseY] = getMousePosition(event);

        const newNode = {
            x: mouseX,
            y: mouseY,
            selected: false,
            number: nodes.length + 1
        };

        nodes.push(newNode);
        drawNodes();
    } 

    // If we were selecting a node, let it go since we 'unclicked' it
    if (currentSelected && currentSelected.selected) {
        currentSelected.selected = false;
        currentSelected = undefined;
    }

    // Redraw 
    drawNodes();
});

/*
 *  END EVENT HANDLERS
 */