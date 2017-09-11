var canvasEle;
var canvasContext;
var canvas;

var cheatsOn = false;

var ball;
const BALL_RADIUS = 10;

var paddle;
const PADDLE_HEIGHT = 10;
const PADDLE_WIDTH = 100;
const PADDLE_EDGE_OFFSET = 15;

var bricksLeft;
var brickGrid;
const BRICK_COLUMNS = 10;
const BRICK_WIDTH = 80;

const BRICK_ROWS = 14;
const BRICK_HEIGHT = 20;

const BRICK_GAP = 2;

var mouse = { x: 0, y: 0 };

function Paddle() {
    this.width = PADDLE_WIDTH;
    this.height = PADDLE_HEIGHT;
    this.y = canvas.height - (PADDLE_EDGE_OFFSET + PADDLE_HEIGHT);
    this.x = (canvas.width / 2) - (PADDLE_WIDTH / 2);
    this.colour = 'white';
    this.speed = 8;
}

window.onload = function () {
    canvasEle = document.getElementById('gameCanvas');
    canvasContext = canvasEle.getContext('2d');

    initGame();

    var framesPerSecond = 33;
    var refreshRate = 1000 / framesPerSecond;
    setInterval(updateGame, refreshRate);

    canvasEle.addEventListener('mousemove', handleMouseMove);

    document.addEventListener('keypress', toggleCheatMode);
}

function initGame() {
    canvas = { x: 0, y: 0, width: canvasEle.width, height: canvasEle.height, colour: 'black' };
    ball = new Ball(canvas, BALL_RADIUS);
    paddle = new Paddle();

    bricksLeft = 0;
    brickGrid = [];
    for (var row = 0; row < BRICK_ROWS; row++) {
        for (var col = 0; col < BRICK_COLUMNS; col++) {
            var brickStartX = BRICK_WIDTH * col;
            var brickStartY = BRICK_HEIGHT * row;
            
            if (row <= 3) {
                brickGrid.push(new Brick(brickStartX, BRICK_HEIGHT * row, 
                    BRICK_WIDTH - BRICK_GAP, BRICK_HEIGHT - BRICK_GAP, false));
            }  
            else{
                brickGrid.push(new Brick(brickStartX, BRICK_HEIGHT * row, 
                    BRICK_WIDTH - BRICK_GAP, BRICK_HEIGHT - BRICK_GAP, true));
                bricksLeft++;
            }    
        }
    } 
       
}

function updateGame() {
    moveEverything();
    drawEverything();
}

function moveEverything() {

    ball.x += ball.speedX;
    ball.y += ball.speedY;

    wallCollisionCheck();
    paddleCollisionCheck();
    brickCollisionCheck();
}

function brickCollisionCheck() {
    var ballCol = getColumn(ball.x);
    var ballRow = getRow(ball.y);

    var ballIndex = brickIndex(ballCol, ballRow);   

    if (ballRow >= 0 && ballRow < BRICK_ROWS 
        && ballCol >= 0 && ballCol < BRICK_COLUMNS) { // prevent weird wrapping bugs

            if (brickGrid[ballIndex].visible) {
                brickGrid[ballIndex].setVisibility(false);
                bricksLeft--;
                console.log(bricksLeft);

                var prevX = ball.x - ball.speedX;
                var prevY = ball.y - ball.speedY;
                var prevCol = getColumn(prevX);;
                var prevRow = getRow(prevY);

                var bothFailed = true;
                if (prevCol !== ballCol) {
                    var leftorRightBrick = brickIndex(prevCol, ballRow);
                    //console.log(leftorRightBrick);
                    if (!brickGrid[leftorRightBrick].visible) {
                        ball.speedX = -ball.speedX;
                        bothFailed = false;
                    }
                }
                if (prevRow !== ballRow) {
                    var topOrBottomBrick = brickIndex(ballCol, prevRow);
                    //console.log(topOrBottomBrick);
                    if (!brickGrid[topOrBottomBrick].visible) {
                        ball.speedY = -ball.speedY;
                        bothFailed = false;
                    }
                }

                if (bothFailed) {
                    ball.speedY = -ball.speedY;
                    ball.speedX = -ball.speedX;
                }
            }    
    }
}

function paddleCollisionCheck() {
    var paddleTop = paddle.y;
    var paddleBottom = paddleTop + PADDLE_HEIGHT;
    var paddleLeft = paddle.x;
    var paddleRight = paddleLeft + PADDLE_WIDTH;

    if (ball.y > paddleTop && ball.y < paddleBottom
        && ball.x > paddleLeft && ball.x < paddleRight
        && ball.speedY > 0) { // only if ball is going down, otherwise can have weird bounce on paddle
        ball.speedY = -ball.speedY;

        var paddleCenter = paddle.x + (PADDLE_WIDTH / 2);
        var ballDeltaXFromPaddle = ball.x - paddleCenter;
        ball.speedX = ballDeltaXFromPaddle * 0.3;
    }
}

function wallCollisionCheck() {
    if (ball.x > canvas.width) { // right side
        ball.speedX = -ball.speedX;
    }
    if (ball.x < 0) { // left side
        ball.speedX = -ball.speedX;
    }

    if (ball.y > canvas.height) { // bottom
        ballReset();
    }
    if (ball.y < 0) { // top
        ball.speedY = -ball.speedY;
    }
}

function ballReset() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
}

function drawEverything() {
    drawRect(canvasContext, canvas);
    drawRect(canvasContext, paddle);
    drawBall(canvasContext, ball);
    
    for (var i = 0; i < brickGrid.length; i++) {
        if (brickGrid[i].visible) {
            drawRect(canvasContext, brickGrid[i]);
        }
    }

    drawMousePos(canvasContext, mouse);
}

function getColumn(xPos) {
    return Math.floor(xPos/BRICK_WIDTH);
}

function getRow(yPos) {
    return Math.floor(yPos/BRICK_HEIGHT);
}

function drawMousePos(canvasContext, mouse) {
    var mouseCol = getColumn(mouse.x);
    var mouseRow = getRow(mouse.y);

    var mouseIndex = brickIndex(mouseCol, mouseRow);

    var mousePosText = '(' + mouseCol + ',' + mouseRow + '): ' + mouseIndex;
    canvasContext.fillStyle = 'yellow';
    canvasContext.fillText(mousePosText, mouse.x, mouse.y);
}

function brickIndex(col, row) {
    return col + (BRICK_COLUMNS * row);
}

function handleMouseMove(evt) {
    var mousePos = getMousePosition(evt, canvasEle);
    mouse.x = mousePos.x;
    mouse.y = mousePos.y;
    paddle.x = mousePos.x - (PADDLE_WIDTH / 2);
    
    if (cheatsOn) {
        cheatMode();
    }
}

function toggleCheatMode(e) {
    if (e.keyCode === 99) { // c key
        cheatsOn = !cheatsOn;
        ball.speedX = 5;
        ball.speedY = 7;
    }
}

function cheatMode() {
    ball.x = mouse.x; //cheat mode
    ball.y = mouse.y;
    ball.speedX = 4;
    ball.speedY = -4;
}