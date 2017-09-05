console.log('Hello');

var canvasEle;
var canvasContext;
var canvas;

const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 10;

const BALL_RADIUS = 10;

function Ball() {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.radius = BALL_RADIUS;
    this.speedX = 5;
    this.speedY = 3;
    this.colour = 'white';
};

var paddle1;
var paddle2;
var ball;

function Paddle(xPos){
    this.width = PADDLE_WIDTH;
    this.height = PADDLE_HEIGHT;
    this.y = (canvas.height / 2) - (this.height / 2);
    this.x = xPos;
    this.colour = 'white';
}

window.onload = function () {
    canvasEle = document.getElementById('gameCanvas');
    canvasContext = canvasEle.getContext('2d');
    canvas = { x: 0, y: 0, width: canvasEle.width, height: canvasEle.height, colour: 'black' };
    paddle1 = new Paddle(10);
    paddle2 = new Paddle(canvas.width - PADDLE_WIDTH - BALL_RADIUS);
    ball = new Ball();

    var framesPerSecond = 33;
    var refreshRate = 1000 / framesPerSecond;
    setInterval(function () {
        moveEverything();
        drawEverything();
    }, refreshRate);

    canvasEle.addEventListener('mousemove', function (evt) {
        var mousePos = getMousePosition(evt);
        paddle1.y = mousePos.y - (PADDLE_HEIGHT / 2);
        paddle2.y = mousePos.y - (PADDLE_HEIGHT / 2);
    });
}

function moveEverything(){
    
    // check collisions with paddle1
    if (ball.x - ball.radius < paddle1.x + PADDLE_WIDTH) {
        if (ball.y > paddle1.y && ball.y < (paddle1.y + PADDLE_HEIGHT)) {
            ball.speedX = ball.speedX * -1;
        }    
    }

    // check collisions with paddle2
    if (ball.x + ball.radius > paddle2.x) {
        if (ball.y > paddle2.y && ball.y < (paddle2.y + PADDLE_HEIGHT)) {
            ball.speedX = ball.speedX * -1;
        }    
    }

    // check collisions with right side of canvas
    if (ball.x > canvas.width) {
        ballReset();
        //ball.speedX = 0;
    }
    // check collisions with left side of canvas
    if (ball.x + ball.radius < 0) {
        ballReset();    
    }

    // check collisions with bottom of canvas
    if (ball.y + ball.radius > canvas.height) {
        ball.speedY = ball.speedY * -1;
        //ball.speedY = 0;
    }

    // check collisions with top of canvas
    if (ball.y - ball.radius < 0) {
        ball.speedY = ball.speedY * -1;
        //ball.speedY = 0;
    }
    ball.x += ball.speedX;
    ball.y += ball.speedY;
}

function drawEverything() {
    drawRect(canvas);
    drawRect(paddle1);
    drawRect(paddle2);
    drawBall(ball);
}

function drawRect(rect){
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
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speedX = ball.speedX * -1;
}

function getMousePosition(evt) {
    var rect = canvasEle.getBoundingClientRect();
    var root = document.documentElement;

    var mouseX = evt.clientX - rect.left - root.scrollLeft;
    var mouseY = evt.clientY - rect.top - root.scrollTop;

    console.log();

    return {
        x: mouseX,
        y: mouseY
    };
}