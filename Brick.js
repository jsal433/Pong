function Brick(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.colour = 'blue';
    this.visible = true;
}

Brick.prototype.setVisibility = setVisibility;

function setVisibility(visible) {
    this.visible = visible;
}