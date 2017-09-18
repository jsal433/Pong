function Track(x, y, width, height, state) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.colour = 'blue';
    this.state = state;
}

Track.prototype.setState = setState;

function setState(state) {
    this.state = state;
}