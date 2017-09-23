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

var bricksRemaining;
var brickGrid;
const BRICK_COLUMNS = 10;
const BRICK_WIDTH = 80;

const BRICK_ROWS = 14;
const BRICK_HEIGHT = 20;

const BRICK_GAP = 2;

var mouse = { x: 0, y: 0 };

var brickCollisionSound;
var paddleCollisionSound;
var ballOffScreenSound;
var gameWinSound;

function loadSounds() {
    brickCollisionSound = new Audio("../Sound/Tab2.m4a");
    paddleCollisionSound  = new Audio("../Sound/Error5.m4a");
    ballOffScreenSound = new Audio("../Sound/Error2.m4a");
    gameWinSound = new Audio("../Sound/Success2.m4a");
}

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
    loadSounds();

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

    bricksRemaining = 0;
    brickGrid = [];
    for (var row = 0; row < BRICK_ROWS; row++) {
        for (var col = 0; col < BRICK_COLUMNS; col++) {
            var brickStartX = BRICK_WIDTH * col;
            var brickStartY = BRICK_HEIGHT * row;

            if (row <= 3) {
                brickGrid.push(new Brick(brickStartX, BRICK_HEIGHT * row,
                    BRICK_WIDTH - BRICK_GAP, BRICK_HEIGHT - BRICK_GAP, false));
            }
            else {
                brickGrid.push(new Brick(brickStartX, BRICK_HEIGHT * row,
                    BRICK_WIDTH - BRICK_GAP, BRICK_HEIGHT - BRICK_GAP, true));
                bricksRemaining++;
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

function brickExistsAndIsVisible(ballIndex) {
    if (ballIndex < brickGrid.length) {
        return brickGrid[ballIndex].visible;
    }
    else return false;
}

function brickCollisionCheck() {
    var ballCol = getColumn(ball.x);
    var ballRow = getRow(ball.y);

    var ballIndex = brickIndex(ballCol, ballRow);

    if (ballRow >= 0 && ballRow < BRICK_ROWS // when ball is on edge of screen it can enter unexpected col 
        && ballCol >= 0 && ballCol < BRICK_COLUMNS) { // or row this prevents weird wrapping bugs

        if (brickExistsAndIsVisible(ballIndex)) { // ball collided with new brick
            brickCollisionSound.currentTime = 0;
            brickCollisionSound.play();
            brickGrid[ballIndex].setVisibility(false);
            bricksRemaining--;
            if (bricksRemaining < 1) {
                gameWinSound.currentTime = 0;
                gameWinSound.play();
                initGame();
                return;
            }

            var prevBallX = ball.x - ball.speedX;
            var prevBallY = ball.y - ball.speedY;
            var prevBallCol = getColumn(prevBallX);;
            var prevBallRow = getRow(prevBallY);

            var bothFailed = true;
            if (prevBallCol !== ballCol) { // if the column the ball was in the previous frame is not
                // the column it is in now, ball hit side of brick
                // get index of last brick the ball was in
                var leftorRightBrick = brickIndex(prevBallCol, ballRow);

                // this check is used for if the ball travels diagonally accross a column and row
                // only reverse x direction if there is no brick in the column next to the one being hit
                if (!brickExistsAndIsVisible(leftorRightBrick)) {
                    ball.speedX = -ball.speedX;
                    bothFailed = false;
                }
            }
            if (prevBallRow !== ballRow) {
                var topOrBottomBrick = brickIndex(ballCol, prevBallRow);
                //console.log(topOrBottomBrick);
                if (!brickExistsAndIsVisible(topOrBottomBrick)) {
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
        paddleCollisionSound.currentTime = 0;
        paddleCollisionSound.play();
        ball.speedY = -ball.speedY;

        var paddleCenter = paddle.x + (PADDLE_WIDTH / 2);
        var ballDeltaXFromPaddle = ball.x - paddleCenter;
        ball.speedX = ballDeltaXFromPaddle * 0.3;
    }
}

function wallCollisionCheck() {
    if (ball.x > canvas.width && ball.speedX > 0) { // right side, only flip if ball is travelling right
        ball.speedX = -ball.speedX;
    }
    if (ball.x < 0 && ball.speedX < 0) { // left side, only flip if ball is travelling left
        ball.speedX = -ball.speedX;
    }

    if (ball.y > canvas.height) { // bottom
        ballOffScreenSound.currentTime = 0;
        ballOffScreenSound.play();
        ballReset();
    }
    if (ball.y < 0 && ball.speedY < 0) { // top, only flip if ball is travelling down
        ball.speedY = -ball.speedY;
    }
}

function ballReset() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
}

function drawEverything() {
    drawRect(canvasContext, canvas); // draw background
    drawRect(canvasContext, paddle); // draw paddle
    drawBall(canvasContext, ball); // draw ball

    for (var i = 0; i < brickGrid.length; i++) { // draw visible bricks
        if (brickGrid[i].visible) {
            drawRect(canvasContext, brickGrid[i]);
        }
    }

    //drawMousePos(mouse); // draw mouse position (debugging)
}

function getColumn(xPos) {
    return Math.floor(xPos / BRICK_WIDTH);
}

function getRow(yPos) {
    return Math.floor(yPos / BRICK_HEIGHT);
}

function drawMousePos(mouse) {
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