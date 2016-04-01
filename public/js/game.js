const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const patternsSelect = document.getElementById('patterns');
const sqrSize = 15;

function initGame() {
    setEventHandlers();
    ctx.strokeStyle = 'gray';
    ctx.fillStyle = 'lightgreen';
}

function setEventHandlers() {
    socket.on('patternsLoaded', onPatternsLoaded);
    socket.on('stateChanged', onStateChanged);
    socket.on('simulationFinished', onSimulationFinished);
    socket.on('simulationStarted', onSimulationStarted);
    canvas.addEventListener('click', onMouseClick, false);
}

function onPatternsLoaded(patternNames) {
    while (patternsSelect.firstChild) {
        patternsSelect.removeChild(patternsSelect.firstChild);
    }
    patternNames.forEach((shape) => {
        var option = document.createElement('option');
        option.text = shape;
        option.value = shape;
        patternsSelect.add(option);
    });
}

function onStateChanged(state) {
    draw(state.board);
    document.getElementById('days').value = state.days;
    document.getElementById('speed').value = state.speed;
    document.getElementById('nextButton').disabled = state.isInProcess;
    document.getElementById('stopButton').disabled = !state.isInProcess;
    document.getElementById('generationCount').innerText = state.generation;
    document.getElementById('populationCount').innerText = state.population;
    patternsSelect.value = state.selectedPattern;
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

function loadPattern(pattern) {
    socket.emit('loadPattern', pattern);
}

function restart() {
    patternsSelect.selectedIndex = -1;
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
    socket.emit('cellChanged', {x, y});
}

function stopSimulation() {
    socket.emit('simulationStopped');
}

function onSimulationStarted() {
    document.getElementById('nextButton').disabled = true;
    document.getElementById('stopButton').disabled = false;
}

function onSimulationFinished(lastNext) {
    document.getElementById('nextButton').disabled = false;
    document.getElementById('stopButton').disabled = true;
    document.getElementById('days').value = lastNext;
}

initGame();