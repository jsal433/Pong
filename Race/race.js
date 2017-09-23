var canvasEle;
var canvasContext;
var canvas;

var car1Pic = document.createElement('img');
var car1PicLoaded = false;
var car2Pic = document.createElement('img');
var car2PicLoaded = false;

var cheatsOn = false;

var car1;
var car2;

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

    car1Pic.src = 'car1.png';

    car1Pic.onload = function () {
        car1PicLoaded = true;
    }

    car2Pic.src = 'player1car.png';

    car2Pic.onload = function () {
        car2PicLoaded = true;
    }

    document.addEventListener('keypress', toggleCheatMode);
}

function initGame() {
    canvas = { x: 0, y: 0, width: canvasEle.width, height: canvasEle.height, colour: 'black' };
    car1 = new Car();
    car2 = new Car();
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
                        1,3,2,1,0,0,1,1,0,0,0,0,0,1,0,0,1,0,0,1,
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
    carReset(); 
}

function updateGame() {
    moveEverything();
    drawEverything();
}

function moveEverything() {

    car1.x += Math.cos(car1.angle) * car1.speed;
    car1.y += Math.sin(car1.angle) * car1.speed;
    car1.angle += 0.02;
    car2.angle += 0.1;

    //wallCollisionCheck();
    //trackCollisionCheck();
}

function trackExistsAndIsVisible(carIndex) {
    if (carIndex < trackGrid.length) {
        return trackGrid[carIndex].state === 1;
    }
    else return false;
}

function trackCollisionCheck() {
    var carCol = getColumn(car1.x);
    var carRow = getRow(car1.y);

    var carIndex = trackIndex(carCol, carRow);   

    if (carRow >= 0 && carRow < TRACK_ROWS // when car is on edge of screen it can enter unexpected col 
        && carCol >= 0 && carCol < TRACK_COLUMNS) { // or row this prevents weird wrapping bugs

            if (trackExistsAndIsVisible(carIndex)) { // car collided with new track

                var prevCarX = car1.x - ca1r.speedX;
                var prevCarY = car1.y - car1.speedY;
                var prevCarCol = getColumn(prevCarX);;
                var prevCarRow = getRow(prevCarY);

                var bothFailed = true;
                if (prevCarCol !== carCol) { // if the column the car was in the previous frame is not
                                             // the column it is in now, car hit side of track
                    // get index of last track the car was in
                    var leftorRightTrack = trackIndex(prevCarCol, carRow); 

                    // this check is used for if the car travels diagonally accross a column and row
                    // only reverse x direction if there is no track in the column next to the one being hit
                    if (!trackExistsAndIsVisible(leftorRightTrack)) {
                        car1.speedX = -car1.speedX;
                        bothFailed = false;
                    }
                }
                if (prevCarRow !== carRow) {
                    var topOrBottomTrack = trackIndex(carCol, prevCarRow);
                    //console.log(topOrBottomTrack);
                    if (!trackExistsAndIsVisible(topOrBottomTrack)) {
                        car1.speedY = -car1.speedY;
                        bothFailed = false;
                    }
                }

                if (bothFailed) {
                    car1.speedY = -car1.speedY;
                    car1.speedX = -car1.speedX;
                }
            }    
    }
}

function wallCollisionCheck() {
    if (car1.x > canvas.width && car1.speedX > 0) { // right side, only flip if car is travelling right
        car1.speedX = -car1.speedX;
    }
    if (car1.x < 0 && car1.speedX < 0) { // left side, only flip if car is travelling left
        car1.speedX = -car1.speedX;
    }

    if (car1.y > canvas.height) { // bottom
        carReset();
    }
    if (car1.y < 0 && car1.speedY < 0) { // top, only flip if car is travelling down
        car1.speedY = -car1.speedY;
    }
}

function carReset() {
    for (var row = 0; row < TRACK_ROWS; row++) {
        for (var col = 0; col < TRACK_COLUMNS; col++) {
            var arrayIndex = trackIndex(col, row);

            if (trackGridLayout[arrayIndex] === 2) {
                trackGridLayout[arrayIndex] = 0;
                car1.x = col * TRACK_WIDTH + TRACK_WIDTH / 2;
                car1.y = row * TRACK_HEIGHT + TRACK_HEIGHT / 2;
            }
            if (trackGridLayout[arrayIndex] === 3) {
                trackGridLayout[arrayIndex] = 0;
                car2.x = col * TRACK_WIDTH + TRACK_WIDTH / 2;
                car2.y = row * TRACK_HEIGHT + TRACK_HEIGHT / 2;
            }
        }
    } 
}

function drawEverything() {
    drawRect(canvasContext, canvas); // draw background

    if (car1PicLoaded) {
        drawBitmapCenteredWithRotation(canvasContext, car1Pic, car1.x, car1.y, car1.angle);
    }
    if (car2PicLoaded) {
        drawBitmapCenteredWithRotation(canvasContext, car2Pic, car2.x, car2.y, car2.angle);
    }
    
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
        car1.speedX = 5;
        car1.speedY = 7;
    }
}

function cheatMode() {
    car1.x = mouse.x; //cheat mode
    car1.y = mouse.y;
    car1.speedX = 4;
    car1.speedY = -4;
}