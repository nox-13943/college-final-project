//get a random integer between the range or [min,max]

function getRandomInt(min, max){
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
// generate a new tetromino sequence
function generateSequence(){
    const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

    while(sequence.length){
     const rand = getRandomInt(0, sequence.length - 1);
     const name = sequence.splice(rand, 1)[0];
      tetrominoSequence.push(name);
    }
}
// get the next tetromino in the sequence
function getNextTetromino(){
    if (tetrominoSequence.length === 0){
        generateSequence();
    }

    const name = tetrominoSequence.pop();
    const matrix = tetrominos[name];
   
 // I and O start centered, all others start in left-middle
    const C = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);
// I starts on row 21 (-1), all others start on row 22 (-2)
    const row = name === 'I' ? -1: -2;

    return{
        name: name,         // name of the piece (L, O, etc.)
        matrix: matrix,      // the current rotation matrix
        row: row,           // current row (starts offscreen)
        C: C,               // current col
    };
}
// rotate an NxN matrix 90deg
function rotate(matrix){
    const N = matrix.length -1;
    const result = matrix.map((row, i) =>
    row.map((val, j) => matrix[N - j][i]));
    return result;
}
// check to see if the new matrix/row/col is valid
function isValidMove(matrix, cellRow, cellC){
    for (let row = 0; row < matrix.length; row++){
        for (let C = 0; C < matrix[row].length; C++){
            if (matrix[row][C] && (
                // outside the game bounds
                cellC + C < 0 || 
                cellC + C >= playfield[0].length ||
                cellRow + row >= playfield.length ||
                 // collides with another piece
                playfield[cellRow +row][cellC + C])
            ) {
                 return false;
            }
        }
    }
    return true;
}
// place the tetromino on the playfield
function placeTetromino(){
    for (let row = 0; row < tetromino.matrix.length; row++){
        for(let C = 0; C < tetromino.matrix[row].length; C++){
            if (tetromino.matrix[row][C]){
                if (tetromino.row + row <0){
                     // game over if piece has any part offscreen
                    return showGameOver();
                }
            playfield[tetromino.row + row][tetromino.C + C] = tetromino.name;
            }
        }
    }
    // check for line clears starting from the bottom and working our way up
    for (let row = playfield.length -1; row >= 0;){
        if (playfield[row].every(cell => !!cell)){
            // drop every row above this one
            for (let r = row; r >= 0; r--){
                 for (let C = 0; C < playfield[r].length; C++){
                 playfield[r][C] = playfield[r-1][C];
                }
            }
        } 
        else{
            row--;
        }   
    }

    tetromino = getNextTetromino();
}
// show the game over screen
function showGameOver() {
    cancelAnimationFrame(rAF);
    gameOver = true;

    context.fillStyle = 'black';
    context.globalAlpha = 0.75;
    context.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);

    context.globalAlpha = 1;
    context.fillStyle = 'white';
    context.font = '36px monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2);
}

const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const grid = 32; 
const tetrominoSequence = [];
// keep track of what is in every cell of the game using a 2d array
// tetris playfield is 10x20, with a few rows offscreen
const playfield = [];
// populate the empty state
for (let row = -2; row < 20; row++){
    playfield[row] = [];
    for (let C = 0; C < 10; C++){
        playfield[row][C] = 0;
    }
}
// how to draw each tetromino
const tetrominos = {
    'I': [
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0],
    ],
    'J': [
        [1,0,0],
        [1,1,1],
        [0,0,0],
    ],
    'L': [
        [0,0,1],
        [1,1,1],
        [0,0,0],
    ],
    'O':[
        [1,1],
        [1,1],
    ],
    'S':[
        [0,1,1],
        [1,1,0],
        [0,0,0],
    ],
    'Z': [
        [1,1,0],
        [0,1,1],
        [0,0,0],
    ],
    'T': [
        [0,1,0],
        [1,1,1],
        [0,0,0],
    ],
};
// color of each tetromino
const colors = {
    'I': 'cyan',
    'O': 'yellow',
    'T': 'purple',
    'S': 'green',
    'Z': 'red',
    'J': 'blue',
    'L': 'orange',
};

let count = 0; 
let tetromino = getNextTetromino();
let rAF = null; // keep track of the animation frame so we can cancel it
let gameOver = false;
// game loop
function loop(){
    rAF = requestAnimationFrame(loop);
    context.clearRect(0,0,canvas.width,canvas.height);
          // draw the playfield
    for (let row = 0; row <20; row++){
        for (let C = 0; C < 10; C++){
            if (playfield[row][C]){
                const name = playfield[row][C];
                context.fillStyle = colors[name];
                    // drawing 1 px smaller than the grid creates a grid effect
                context.fillRect(C * grid, row * grid, grid-1, grid-1);
            }
        }
    }
  // draw the active tetromino
    if (tetromino){
        // tetromino falls every 35 frames
        if(++count > 35){
            tetromino.row++;
            count = 0;
                 // place piece if it runs into anything
            if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.C)){
                tetromino.row--;
                placeTetromino();
            }
        }

        context.fillStyle = colors[tetromino.name];
        

        for (let row = 0; row < tetromino.matrix.length; row++){
            for (let C = 0; C < tetromino.matrix[row].length; C++){
                if (tetromino.matrix[row][C]){
                      // drawing 1 px smaller than the grid creates a grid effect
                    context.fillRect((tetromino.C + C ) * grid, (tetromino.row + row ) * grid, grid-1, grid-1);
                }
            }
        }
    }
}
// listen to keyboard events to move the active tetromino
document.addEventListener('keydown', function(e) {
    if (gameOver) return;
    // left and right arrow keys (move)
    if (e.which  === 37 || e.which === 39) {
        const C = e.which === 37 ? tetromino.C - 1 : tetromino.C + 1;

        if(isValidMove(tetromino.matrix, tetromino.row, C)) {
            tetromino.C = C;
        }
    }
    // up arrow key (rotate)
    if (e.which === 38){
        const matrix = rotate(tetromino.matrix);
        if (isValidMove(matrix, tetromino.row, tetromino.C)){
            tetromino.matrix = matrix;
        }
    }
    // down arrow key (drop)
    if(e.which === 40) {
        const row = tetromino.row + 1;

        if (!isValidMove(tetromino.matrix, row, tetromino.C)){
            tetromino.row = row - 1;

            placeTetromino();
            return;
        }

        tetromino.row = row;
    }
});
    // start the game
rAF = requestAnimationFrame(loop);