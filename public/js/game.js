const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const board = [];

ctx.strokeStyle = 'black';
ctx.fillStyle = 'blue';
const sqrSize = 20;

canvas.addEventListener('click', onMouseClick, false);

function setEventHandlers() {
    socket.on('boardChanged', onBoardChanged);
    socket.on('simulationFinished', onSimulationFinished);
    socket.on('simulationStarted', onSimulationStarted);
}

function onBoardChanged(board) {
    draw(board);
    console.log('Board changed');
    window.board = board;
}

function draw(board) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    board.forEach(function(row, x) {
        row.forEach(function(cell, y) {
            ctx.beginPath();
            ctx.rect(y*sqrSize, x*sqrSize, sqrSize, sqrSize);
            if (cell) {
                ctx.fill();
            } else {
                ctx.stroke();
            }
        });
    });
}

function loadShape(shape) {
    socket.emit('loadShape', shape);
}

function restart() {
    socket.emit('clear');
}

function simulate() {
    const days = parseInt(document.getElementById('days').value);
    const speed = parseInt(document.getElementById('speed').value);
    socket.emit('simulate', {days, speed});
}

function onMouseClick(event) {
    const rect = canvas.getBoundingClientRect();
    const y = Math.floor((event.clientX - rect.left) / sqrSize);
    const x = Math.floor((event.clientY - rect.top) / sqrSize);
    console.log(x, y);
    socket.emit('cellChanged', {x, y});
}

function stopSimulation() {
    socket.emit('simulationStopped');
}

function onSimulationStarted() {
    document.getElementById("nextButton").disabled = true;
}

function onSimulationFinished() {
    document.getElementById("nextButton").disabled = false;
}

setEventHandlers();