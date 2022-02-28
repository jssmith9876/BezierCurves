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

// This really starts to chug when we have more than 15 nodes at a given time
const factorial = (n) => {
    if (n == 0 || n == 1) 
        return 1;

    return n * factorial(n - 1);
}
const binomialCoeff = (n, k) => {
    return factorial(n) / (factorial(k) * factorial(n - k))
}

const bernstein = (i, n, t) => {
    let res;
    if (i != n) {
        res = binomialCoeff(n, i) * Math.pow((1-t), (n - i)) * Math.pow(t, i);
    } else {
        res = binomialCoeff(n, i) *  Math.pow(t, i);
    }
    return res;
}

const bezierCurve = (t) => {
    const n = nodes.length - 1;

    let bx = 0,
        by = 0;

    for (let i = 0; i <= n; i++) {
        bx += nodes[i].x * bernstein(i, n, t);
        by += nodes[i].y * bernstein(i, n, t);
    }

    return [ bx, by ];
}

/*
 *  END MATH FUNCTIONS
 */

/*
 *  BEGIN HELPER FUNCTIONS
 */

// Button functions
const toggleLines = () => {
    displayLines = !displayLines;
    drawNodes();
}
const toggleNodes = () => {
    displayNodes = !displayNodes;
    drawNodes();
}
const clearNodes = () => {
    nodes = [];
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
    let bezierPoints = [bezierCurve(0)];

    ctx.beginPath();
    ctx.strokeStyle = bezierColor;

    for (let t = bezierStep; t <= 1; t += bezierStep) {
        // Add the next point to the curve
        bezierPoints.push(bezierCurve(t));
        
        // Draw a line to connect the current and previous points
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

    // Draw our Bezier curve
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