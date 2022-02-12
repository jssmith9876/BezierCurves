/*
 *  BEGIN CONSTANTS
 */

// Canvas
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

// Node info
const nodeFillStyle = "#22CCCC";
const nodeStrokeStyle = "#009999";
const nodeRadius = 7;

/*
 *  END CONSTANTS
 */

let nodes = [];

const resizeCanvas = () => {
    canvas.width = 0.75 * window.innerWidth;
    canvas.height = 400;
}

const drawNode = (x, y) => {
    ctx.beginPath();
    ctx.fillStyle = nodeFillStyle;
    ctx.arc(x, y, nodeRadius, 0, Math.PI * 2, true);
    ctx.strokeStyle = nodeStrokeStyle;
    ctx.stroke();
    ctx.fill();
}

// Canvas onclick handler
canvas.addEventListener('mousedown', (event) => {
    // Get the coordinates with respect to the canvas 
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let clickedOnANode = false;

    // Check if the user clicked on a node
    nodes.every(([node_x, node_y]) => {
        const dx = Math.abs(node_x - x);
        const dy = Math.abs(node_y - y);

        if (Math.sqrt( (dx * dx) + (dy * dy)) <= nodeRadius) {
            clickedOnANode = true;
            return false;
        }

        return true;
    });

    if (clickedOnANode) {
        
    } else {
        // Create the node
        nodes.push([x, y]);
        drawNode(x, y);
    }
});