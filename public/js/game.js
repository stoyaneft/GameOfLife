const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const shapesSelect = document.getElementById('shapes');
const sqrSize = 20;
let shapes = [];


function initGame() {
    setEventHandlers();
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'blue';
}

function setEventHandlers() {
    socket.on('stateChanged', onStateChanged);
    socket.on('simulationFinished', onSimulationFinished);
    socket.on('simulationStarted', onSimulationStarted);
    canvas.addEventListener('click', onMouseClick, false);
}


function onStateChanged(state) {
    draw(state.board);
    document.getElementById('days').value = state.days;
    document.getElementById('speed').value = state.speed;
    document.getElementById("nextButton").disabled = state.isInProcess;
    document.getElementById('generationCount').innerText = state.generation;
    document.getElementById('populationCount').innerText = state.population;
    if (shapes.length === 0) {
        shapes = state.shapeOptions;
        shapes.forEach(shape => {
            var option = document.createElement("option");
            option.text = shape;
            shapesSelect.add(option);
        });
    }
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

function loadPattern(shape) {
    socket.emit('loadPattern', shape);
}

function restart() {
    socket.emit('clear');
}

function simulate() {
    const days = parseInt(document.getElementById('days').value);
    const speed = parseInt(document.getElementById('speed').value);
    document.getElementById("nextButton").disabled = true;
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

initGame();