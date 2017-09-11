function Ball(canvas, radius) {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    //this.x = 100;
    //this.y = 100;
    this.radius = radius;
    this.speedX = 8; // 5
    this.speedY = 9; // 7
    this.colour = 'white';
}