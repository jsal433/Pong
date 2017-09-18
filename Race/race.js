var canvasEle;
var canvasContext;
var canvas;

var carPick = document.createElement('img');
var carPickLoaded = false;

var cheatsOn = false;

var ball;
const BALL_RADIUS = 10;

var trackGrid;
const TRACK_COLUMNS = 20;
const TRACK_WIDTH = 40;

const TRACK_ROWS = 15;
const TRACK_HEIGHT = 40;

const TRACK_GAP = 2;

var mouse = { x: 0, y: 0 };

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
    trackGridLayout = [ 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
                        1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,
                        1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                        1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,
                        1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,
                        1,0,0,1,1,0,0,1,1,1,1,1,0,0,0,0,1,0,0,1,
                        1,0,0,1,0,0,0,0,1,1,1,0,0,0,0,0,1,0,0,1,
                        1,0,0,1,0,0,0,0,0,1,1,0,0,1,0,0,1,0,0,1,
                        1,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0,1,0,0,1,
                        1,0,0,1,0,0,1,1,0,0,1,0,0,1,0,0,1,0,0,1,
                        1,0,2,1,0,0,1,1,0,0,0,0,0,1,0,0,1,0,0,1,
                        1,1,1,1,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,1,
                        1,0,0,0,0,0,1,1,1,0,0,0,1,1,0,0,0,0,0,1,
                        1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,1,1,
                        1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1 ];
    trackGrid = [];
    var index = 0;
    for (var row = 0; row < TRACK_ROWS; row++) {
        for (var col = 0; col < TRACK_COLUMNS; col++) {
            var trackStartX = TRACK_WIDTH * col;
            var trackStartY = TRACK_HEIGHT * row;
            
            trackGrid.push(new Track(trackStartX, TRACK_HEIGHT * row, 
                TRACK_WIDTH - TRACK_GAP, TRACK_HEIGHT - TRACK_GAP, trackGridLayout[index]));

                index++;
        }
    } 
    ballReset(); 
}

function updateGame() {
    //moveEverything();
    drawEverything();
}

function moveEverything() {

    ball.x += ball.speedX;
    ball.y += ball.speedY;

    wallCollisionCheck();
    trackCollisionCheck();
}

function trackExistsAndIsVisible(ballIndex) {
    if (ballIndex < trackGrid.length) {
        return trackGrid[ballIndex].state === 1;
    }
    else return false;
}

function trackCollisionCheck() {
    var ballCol = getColumn(ball.x);
    var ballRow = getRow(ball.y);

    var ballIndex = trackIndex(ballCol, ballRow);   

    if (ballRow >= 0 && ballRow < TRACK_ROWS // when ball is on edge of screen it can enter unexpected col 
        && ballCol >= 0 && ballCol < TRACK_COLUMNS) { // or row this prevents weird wrapping bugs

            if (trackExistsAndIsVisible(ballIndex)) { // ball collided with new track

                var prevBallX = ball.x - ball.speedX;
                var prevBallY = ball.y - ball.speedY;
                var prevBallCol = getColumn(prevBallX);;
                var prevBallRow = getRow(prevBallY);

                var bothFailed = true;
                if (prevBallCol !== ballCol) { // if the column the ball was in the previous frame is not
                                             // the column it is in now, ball hit side of track
                    // get index of last track the ball was in
                    var leftorRightTrack = trackIndex(prevBallCol, ballRow); 

                    // this check is used for if the ball travels diagonally accross a column and row
                    // only reverse x direction if there is no track in the column next to the one being hit
                    if (!trackExistsAndIsVisible(leftorRightTrack)) {
                        ball.speedX = -ball.speedX;
                        bothFailed = false;
                    }
                }
                if (prevBallRow !== ballRow) {
                    var topOrBottomTrack = trackIndex(ballCol, prevBallRow);
                    //console.log(topOrBottomTrack);
                    if (!trackExistsAndIsVisible(topOrBottomTrack)) {
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

function wallCollisionCheck() {
    if (ball.x > canvas.width && ball.speedX > 0) { // right side, only flip if ball is travelling right
        ball.speedX = -ball.speedX;
    }
    if (ball.x < 0 && ball.speedX < 0) { // left side, only flip if ball is travelling left
        ball.speedX = -ball.speedX;
    }

    if (ball.y > canvas.height) { // bottom
        ballReset();
    }
    if (ball.y < 0 && ball.speedY < 0) { // top, only flip if ball is travelling down
        ball.speedY = -ball.speedY;
    }
}

function ballReset() {
    for (var row = 0; row < TRACK_ROWS; row++) {
        for (var col = 0; col < TRACK_COLUMNS; col++) {
            var arrayIndex = trackIndex(col, row);

            if (trackGridLayout[arrayIndex] === 2) {
                trackGridLayout[arrayIndex] = 0;
                ball.x = col * TRACK_WIDTH + TRACK_WIDTH / 2;
                ball.y = row * TRACK_HEIGHT + TRACK_HEIGHT / 2;
            }
        }
    } 
}

function drawEverything() {
    drawRect(canvasContext, canvas); // draw background
    drawBall(canvasContext, ball); // draw ball
    
    for (var i = 0; i < trackGrid.length; i++) { // draw visible tracks
        if (trackGrid[i].state === 1) {
            drawRect(canvasContext, trackGrid[i]);
        }
    }

    //drawMousePos(mouse); // draw mouse position (debugging)
}

function getColumn(xPos) {
    return Math.floor(xPos/TRACK_WIDTH);
}

function getRow(yPos) {
    return Math.floor(yPos/TRACK_HEIGHT);
}

function drawMousePos(mouse) {
    var mouseCol = getColumn(mouse.x);
    var mouseRow = getRow(mouse.y);

    var mouseIndex = trackIndex(mouseCol, mouseRow);

    var mousePosText = '(' + mouseCol + ',' + mouseRow + '): ' + mouseIndex;
    canvasContext.fillStyle = 'yellow';
    canvasContext.fillText(mousePosText, mouse.x, mouse.y);
}

function trackIndex(col, row) {
    return col + (TRACK_COLUMNS * row);
}

function handleMouseMove(evt) {
    var mousePos = getMousePosition(evt, canvasEle);
    mouse.x = mousePos.x;
    mouse.y = mousePos.y;
    
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