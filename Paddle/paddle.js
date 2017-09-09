var canvasEle;
var canvasContext;
var canvas;

var ball;
const BALL_RADIUS = 10;

var paddle;
const PADDLE_HEIGHT = 10;
const PADDLE_WIDTH = 100;
const PADDLE_EDGE_OFFSET = 15;

var brickGrid = [];
const NUMBER_OF_BRICKS = 8;
const BRICK_WIDTH = 100;
const BRICK_HEIGHT = 40;

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
}

function initGame() {
    canvas = { x: 0, y: 0, width: canvasEle.width, height: canvasEle.height, colour: 'black' };
    ball = new Ball(canvas, BALL_RADIUS);
    paddle = new Paddle();

    for (var i = 0; i < NUMBER_OF_BRICKS; i++) {
        var brickStart = BRICK_WIDTH * i;
        brickGrid.push(new Brick(brickStart, 0, BRICK_WIDTH - 2, BRICK_HEIGHT));
    }
}

function updateGame() {
    moveEverything();
    drawEverything();
}

function handleMouseMove(evt) {
    var mousePos = getMousePosition(evt, canvasEle);
    mouse.x = mousePos.x;
    mouse.y = mousePos.y;
    paddle.x = mousePos.x - (PADDLE_WIDTH / 2);
}

function moveEverything() {

    if (ball.x > canvas.width) { // right side
        ball.speedX = -ball.speedX;
    }
    if (ball.x < 0) { // left side
        ball.speedX = -ball.speedX;
    }

    if (ball.y > canvas.height) { // bottom
        //ball.speedY = -ball.speedY;
        ballReset();
    }
    if (ball.y < 0) { // top
        ball.speedY = -ball.speedY;
    }

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

    ball.x += ball.speedX;
    ball.y += ball.speedY;
}

function ballReset() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
}

function drawEverything() {
    drawRect(canvasContext, canvas);
    drawRect(canvasContext, paddle);
    drawBall(canvasContext, ball);
    drawMousePos(canvasContext, mouse);

    for (var i = 0; i < brickGrid.length; i++) {
        drawRect(canvasContext, brickGrid[i]);
    }
}

