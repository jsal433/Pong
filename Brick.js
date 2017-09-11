function Brick(x, y, width, height, visible) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.colour = 'blue';
    this.visible = visible;
}

Brick.prototype.setVisibility = setVisibility;

function setVisibility(visible) {
    this.visible = visible;
}