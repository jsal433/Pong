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