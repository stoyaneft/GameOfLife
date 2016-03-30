const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const board = [];

ctx.strokeStyle = 'black';
ctx.fillStyle = 'blue';
const sqrSize = 20;
canvas.addEventListener('click', onMouseClick, false);
//////////////////////////////////////////////////////////////////
//        var scaleFactor = 1.1;
//        var lastX=canvas.width/2, lastY=canvas.height/2;
//        var zoom = function(){
//            ctx.translate(lastX,lastY);
//            ctx.scale(1.5,1.5);
//            ctx.translate(-lastX,-lastY);
//            draw(board);
//        };
//
//        var handleScroll = function(evt){
//            console.log('Scrolled');
//            var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;
//            if (delta) zoom();
//            return evt.preventDefault() && false;
//        };
//        canvas.addEventListener('DOMMouseScroll',handleScroll,false);
//        canvas.addEventListener('mousewheel',handleScroll,false);

function setEventHandlers() {
    socket.on('boardChanged', onBoardChanged);
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

setEventHandlers();