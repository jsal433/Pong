function drawRect(canvasContext, rect) {
    canvasContext.fillStyle = rect.colour;
    canvasContext.fillRect(rect.x, rect.y, rect.width, rect.height);
}

function drawBall(canvasContext, ball) {
    var startAngle = 0;
    var endAngle = Math.PI * 2;

    canvasContext.fillStyle = ball.colour;
    canvasContext.beginPath();
    canvasContext.arc(ball.x, ball.y, ball.radius, startAngle, endAngle, true);
    canvasContext.fill();
}

function drawBitmapCenteredWithRotation(canvasContext, img, posX, posY, angle) {
    canvasContext.save();
    canvasContext.translate(posX, posY);
    canvasContext.rotate(angle);
    canvasContext.drawImage(img, -img.width/2, -img.height/2);
    canvasContext.restore();
}