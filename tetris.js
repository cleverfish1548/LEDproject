const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
var turn = new Audio('ROTATE.mp3');
var skip = new Audio('Skip.mp3');
var music = new Audio('YEAHGOTETRIS.mp3')
var destroy3 = new Audio('destroy3line.mp3')
var die = new Audio('die.mp3')
var add = 'http://192.168.137.247'

context.scale(20, 20);



music.addEventListener('ended', function() { 
    this.currentTime = 0;
    this.play();
}, false);

function arenaSweep() {

    let rowCount = 1;
    outer: for (let y = arena.length -1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        player.score += rowCount * 10;
        destroy3.play();
        location.href=add+'/lightgogo';
        rowCount *= 2;
        if(player.score<=2000)
            dropInterval=550-(player.score/4)
    }
}

function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
             (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
        }
    }
}
return false;
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type)
{

    if (type === 'I') {
        location.href=add+'/red';
        return [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        ];

    } else if (type === 'L') {
        location.href=add+'/green';
        return [
        [0, 2, 0],
        [0, 2, 0],
        [0, 2, 2],
        ];
    } else if (type === 'J') {
        location.href=add+'/blue';
        return [
        [0, 3, 0],
        [0, 3, 0],
        [3, 3, 0],
        ];
    } else if (type === 'O') {
        location.href=add+'/yellow';
        return [
        [4, 4],
        [4, 4],
        ];
    } else if (type === 'Z') {
        location.href=add+'/cyan';
        return [
        [5, 5, 0],
        [0, 5, 5],
        [0, 0, 0],
        ];
    } else if (type === 'S') {
        location.href=add+'/magenta';
        return [
        [0, 6, 6],
        [6, 6, 0],
        [0, 0, 0],
        ];
    } else if (type === 'T') {
        location.href=add+'/white';
        return [
        [0, 7, 0],
        [7, 7, 7],
        [0, 0, 0],
        ];
    }
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x,
                   y + offset.y,
                   1, 1);
            }
        });
    });
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function rotate(matrix, dir) {
    music.play();
    turn.pause();
    turn.currentTime = 0;
    turn.play();
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
            matrix[x][y],
            matrix[y][x],
            ] = [
            matrix[y][x],
            matrix[x][y],
            ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerkoreanDrop() {
    if (player.pos.y >= 1){
        skip.pause();
        skip.currentTime = 0;
        skip.play();
    }
    while (player.pos.y >= 1){
        playerDrop();
    }
}

function playerMove(offset) {
    music.play();
    player.pos.x += offset;
    if (collide(arena, player)) {
        player.pos.x -= offset;
    }
}

function playerReset() {
    const pieces = 'TJLOSZI';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
    (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
        die.play();
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

let dropCounter = 0;
let dropInterval = 550;

let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    lastTime = time;

    draw();
    requestAnimationFrame(update);
}

function updateScore() {
    document.getElementById('score').innerText = player.score;
}

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        playerMove(-1);
    } else if (event.keyCode === 39) {
        playerMove(1);
    } else if (event.keyCode === 40) {
        playerDrop();
    }else if (event.keyCode === 32) {
        playerkoreanDrop();
    } else if (event.keyCode === 38) {
        playerRotate(-1);
    } else if (event.keyCode === 81) {
        playerRotate(-1);
    } else if (event.keyCode === 87) {
        playerRotate(1);
    }
});

const colors = [
null,
'#FF0000',
'#00FF00',
'#0000FF',
'#FFFF00',
'#00FFFF',
'#FF00FF',
'#FFFFFF',
];

const arena = createMatrix(12, 20);

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
};

playerReset();
updateScore();
update();
