   const canvas = document.getElementById('gameCanvas').getContext('2d');

   canvas.strokeStyle = 'black';
   canvas.fillStyle = 'cadetblue';

   function setEventHandlers() {
       socket.on('boardChanged', onBoardChanged);
   }

   function onBoardChanged(board) {
       draw(board);
       console.log('Board changed');
   }

   function draw(board) {
       canvas.clearRect(0, 0, 600, 600);
       board.forEach(function(row, x) {
           row.forEach(function(cell, y) {
               canvas.beginPath();
               canvas.rect(x*20, y*20, 20, 20);
               if (cell) {
                   canvas.fill();
               } else {
                   canvas.stroke();
               }
           });
       });
       //setTimeout(function() {();}, 70);
       //window.requestAnimationFrame(update); // Too fast!
   }

   setEventHandlers();