var keysPressed = {};

var winScreen;

var canvasEle;
var canvasContext;
var canvas;

const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 10;

const BALL_RADIUS = 10;

const WINNING_SCORE = 3;
var player1Score;
var player2Score;

var paddle1;
var paddle2;
var ball;

function Ball() {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.radius = BALL_RADIUS;
    this.speedX = 8;
    this.speedY = 5;
    this.colour = 'white';
};

function Paddle(xPos) {
    this.width = PADDLE_WIDTH;
    this.height = PADDLE_HEIGHT;
    this.y = (canvas.height / 2) - (this.height / 2);
    this.x = xPos;
    this.colour = 'white';
    this.speed = 8;
}

function Score(x, y) {
    this.value = 0;
    this.x = x;
    this.y = y;
}

window.onload = function () {
    canvasEle = document.getElementById('gameCanvas');
    canvasContext = canvasEle.getContext('2d');

    initGame();

    var framesPerSecond = 33;
    var refreshRate = 1000 / framesPerSecond;
    setInterval(function () {
        moveEverything();
        drawEverything();
    }, refreshRate);

    canvasEle.addEventListener('mousemove', function (evt) {
        var mousePos = getMousePosition(evt);
        paddle1.y = mousePos.y - (PADDLE_HEIGHT / 2);
    });

    canvasEle.addEventListener('mousedown', handleMouseClick);

    document.addEventListener('keydown', function (e) {
        keysPressed[e.keyCode] = true;
    });
    document.addEventListener('keyup', function (e) {
        keysPressed[e.keyCode] = false;
    });
}

function handleMouseClick(evt) {
    if (winScreen) {
        initGame();
    }
}

function playerMoves() {
    if (keysPressed[87]) { // w key
        paddle1.y -= paddle2.speed;
    }
    if (keysPressed[83]) { // s key
        paddle1.y += paddle2.speed;
    }
    if (keysPressed[38]) { // up key
        paddle2.y -= paddle2.speed;
    }
    if (keysPressed[40]) { // down key
        paddle2.y += paddle2.speed;
    }
}

function initGame() {
    canvas = { x: 0, y: 0, width: canvasEle.width, height: canvasEle.height, colour: 'black' };
    paddle1 = new Paddle(10);
    paddle2 = new Paddle(canvas.width - PADDLE_WIDTH - BALL_RADIUS);
    ball = new Ball();

    var scoreXPos = (1 / 8) * canvas.width;
    var scoreYPos = (1 / 6) * canvas.height;

    player1Score = new Score(scoreXPos, scoreYPos);
    player2Score = new Score(canvas.width - scoreXPos, scoreYPos);

    winScreen = false;
}

function moveEverything() {

    if (winScreen) {
        return;
    }

    computerMovement();
    //playerMoves();

    // check collisions with paddle1
    if (ball.x - ball.radius < paddle1.x + PADDLE_WIDTH) {
        if (ball.y > paddle1.y && ball.y < (paddle1.y + PADDLE_HEIGHT)) {
            ball.speedX = -ball.speedX;
            var deltaY = ball.y - (paddle1.y + PADDLE_HEIGHT / 2);
            ball.speedY = deltaY * 0.35;
        }
    }

    // check collisions with paddle2
    if (ball.x + ball.radius > paddle2.x) {
        if (ball.y > paddle2.y && ball.y < (paddle2.y + PADDLE_HEIGHT)) {
            ball.speedX = -ball.speedX;
            var deltaY = ball.y - (paddle2.y + PADDLE_HEIGHT / 2);
            ball.speedY = deltaY * 0.35;
        }
    }

    // check collisions with right side of canvas
    if (ball.x > canvas.width) {
        player1Score.value++;
        ballReset();
    }
    // check collisions with left side of canvas
    if (ball.x + ball.radius < 0) {
        player2Score.value++;
        ballReset();
    }

    // check collisions with bottom of canvas
    if (ball.y + ball.radius > canvas.height) {
        ball.speedY = ball.speedY * -1;
    }

    // check collisions with top of canvas
    if (ball.y - ball.radius < 0) {
        ball.speedY = ball.speedY * -1;
    }

    ball.x += ball.speedX;
    ball.y += ball.speedY;

}

function drawEverything() {

    drawRect(canvas);

    if (winScreen) {
        canvasContext.fillStyle = 'white';
        var scoreString;

        if (player1Score.value >= WINNING_SCORE) {
            canvasContext.fillText('Player One Won!', 360, 150);
            scoreString = player1Score.value + ' - ' + player2Score.value + '!';
            canvasContext.fillText(scoreString, 380, 180);
        }
        if (player2Score.value >= WINNING_SCORE) {
            canvasContext.fillText('Player Two Won!', 360, 150);
            scoreString = player2Score.value + ' - ' + player1Score.value + '!';
            canvasContext.fillText(scoreString, 380, 180);
        }

        canvasContext.fillText('Click to restart', 365, 250);

        return;
    }

    drawRect(paddle1);
    drawRect(paddle2);
    drawBall(ball);
    canvasContext.fillText(player1Score.value, player1Score.x, player1Score.y);
    canvasContext.fillText(player2Score.value, player2Score.x, player2Score.y);
}

function drawRect(rect) {
    canvasContext.fillStyle = rect.colour;
    canvasContext.fillRect(rect.x, rect.y, rect.width, rect.height);
}

function drawBall(ball) {
    var startAngle = 0;
    var endAngle = Math.PI * 2;

    canvasContext.fillStyle = ball.colour;
    canvasContext.beginPath();
    canvasContext.arc(ball.x, ball.y, ball.radius, startAngle, endAngle, true);
    canvasContext.fill();
}

function ballReset() {

    if (player1Score.value >= WINNING_SCORE ||
        player2Score.value >= WINNING_SCORE) {
        winScreen = true;
    }

    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speedX = ball.speedX * -1;
}

function computerMovement() {
    var paddle2Center = paddle2.y + (PADDLE_HEIGHT / 2);
    var thirdPaddle = PADDLE_HEIGHT / 3;
    if ((paddle2Center + thirdPaddle) < ball.y) {
        paddle2.y += paddle2.speed;
    }
    else if ((paddle2Center - thirdPaddle) > ball.y) {
        paddle2.y -= paddle2.speed;
    }
}

function getMousePosition(evt) {
    var rect = canvasEle.getBoundingClientRect();
    var root = document.documentElement;

    var mouseX = evt.clientX - rect.left - root.scrollLeft;
    var mouseY = evt.clientY - rect.top - root.scrollTop;

    return {
        x: mouseX,
        y: mouseY
    };
}