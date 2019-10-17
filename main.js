var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

var game = {
    view3d: false,
    boundaries: [],
    walls: [],
    keysHeld: []
}

var player = {
    angle: 0,
    x: 150,
    y: 300,
    moveLockForward: false,
    moveLockBackward: false,
    collision: function() {
        this.moveLockForward = false;
        this.moveLockBackward = false;

        for (var i = 0; i < game.walls.length; i++) {
            if (this.x + 20 * Math.cos(this.angle) > game.walls[i].x &&
                this.x + 20 * Math.cos(this.angle) < game.walls[i].x + game.walls[i].width &&
                this.y + 20 * Math.sin(this.angle) > game.walls[i].y &&
                this.y + 20 * Math.sin(this.angle) < game.walls[i].y + game.walls[i].height) {
                this.moveLockForward = true;
            }
            
            if (this.x - 20 * Math.cos(this.angle) > game.walls[i].x &&
                this.x - 20 * Math.cos(this.angle) < game.walls[i].x + game.walls[i].width &&
                this.y - 20 * Math.sin(this.angle) > game.walls[i].y &&
                this.y - 20 * Math.sin(this.angle) < game.walls[i].y + game.walls[i].height) {
                this.moveLockBackward = true;
            } 
        }
    },
    movement: function() {
        if (game.keysHeld['A'.charCodeAt(0)]) {
            this.angle-=0.05;
        }
        if (game.keysHeld['D'.charCodeAt(0)]) {
            this.angle+=0.05;
        }
        if (game.keysHeld['W'.charCodeAt(0)] && !this.moveLockForward) {
            this.x += 2.5 * Math.cos(this.angle);
            this.y += 2.5 * Math.sin(this.angle);
        }
        if (game.keysHeld['S'.charCodeAt(0)] && !this.moveLockBackward) {
            this.x -= 2.5 * Math.cos(this.angle);
            this.y -= 2.5 * Math.sin(this.angle);
        } 
    }
}

class Ray {
    constructor(x, y, dir) {
        this.posX = x;
        this.posY = y;
        this.angle = dir;
        this.colx = null;
        this.coly = null;
        this.minDistance = 1000000;
    }

    draw2d() {
        if (this.colx != null) {
            ctx.strokeStyle = 'white';
            ctx.beginPath();
            ctx.moveTo(player.x, player.y);
            ctx.lineTo(this.colx, this.coly)
            ctx.stroke();
        }
    }
    
    draw3d(x) {
        var height = canvas.height / (0.03 * this.minDistance);
        if (height > canvas.height) {
            height = canvas.height;
        }

        var brightness = Math.round(height / ((canvas.height / 255)**0.1));
        if (brightness > 255) {
            brightness = 255;
        }
        var colorcode = '#'
            + brightness.toString(16)
            + brightness.toString(16)
            + brightness.toString(16);

        ctx.strokeStyle = colorcode;
        ctx.beginPath();
        ctx.moveTo(x,300-height/2);
        ctx.lineTo(x,300+height/2);
        ctx.stroke();

        ctx.strokeStyle = 'blue';
        ctx.beginPath();
        ctx.moveTo(x, 300-height/2);
        ctx.lineTo(x, 0);
        ctx.stroke();

    }

    collisionTest() {
        for (var i = 0; i < game.boundaries.length; i++) {
            var x1 = this.posX;
            var y1 = this.posY;
            var x2 = this.posX + 10 * Math.cos(this.angle);
            var y2 = this.posY + 10 * Math.sin(this.angle);

            var x3 = game.boundaries[i].startX;
            var y3 = game.boundaries[i].startY;
            var x4 = game.boundaries[i].endX;
            var y4 = game.boundaries[i].endY;

            var denominator = (x1 - x2)*(y3 - y4) - (y1 - y2)*(x3 - x4)
            if (denominator == 0) {
                return;
            }
            var t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4))/denominator;
            var u = -( (x1 - x2)*(y1 - y3) - (y1 - y2)*(x1 - x3) )/denominator;

            if (t > 0 && u > 0 && u < 1) {
                var x = x3 + u * (x4 - x3);
                var y = y3 + u * (y4 - y3);
            }
            var distance = Math.sqrt((x - this.posX)**2 + (y - this.posY)**2);
            if (distance < this.minDistance) {
                this.colx = x;
                this.coly = y;
                this.minDistance = distance;
            }
        }
    }
}

class Boundary {
    constructor(x1, y1, x2, y2) {
        this.startX = x1;
        this.startY = y1;
        this.endX = x2;
        this.endY = y2;
    }

    draw() {
        ctx.strokeStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY);
        ctx.lineTo(this.endX, this.endY);
        ctx.stroke();
    }
}

class Wall {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;

        game.boundaries.push(new Boundary(x, y, x+w, y));
        game.boundaries.push(new Boundary(x, y, x, y+h));
        game.boundaries.push(new Boundary(x+w, y, x+w, y+h));
        game.boundaries.push(new Boundary(x, y+h, x+w, y+h));
    }
}

function keyDownHandler(event) {
    game.keysHeld[event.keyCode] = true;

    if (event.keyCode == 'H'.charCodeAt(0)) {
        game.view3d = !game.view3d;
    }
}

function keyUpHandler(event) {
    game.keysHeld[event.keyCode] = false;
}

function clearScreen() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function castRays() {
    game.rays = [];
    for (var i = -Math.PI/6 + player.angle; i < Math.PI/6 + player.angle; i += (Math.PI/3) / canvas.width) {
        game.rays.push(new Ray(player.x,player.y, i))
    }
}

function render() {
    clearScreen();
    if (game.view3d == false) {
        for (var i = 0; i < game.boundaries.length; i++) {
            game.boundaries[i].draw();
        }
        for (var i = 0; i < game.rays.length; i++) {
            game.rays[i].collisionTest();
            game.rays[i].draw2d();
        }
    } else {
        for (var i = 0; i < game.rays.length; i++) {
            game.rays[i].collisionTest();
            game.rays[i].draw3d(i);
        }
    }
}

function update() {
    player.collision();
    player.movement();
    castRays();
    render();
}

game.walls.push(new Wall(0,-100,800,100));
game.walls.push(new Wall(0,600,800,100));
game.walls.push(new Wall(-100,-100,100,800));
game.walls.push(new Wall(800,-100,800,800));

game.walls.push(new Wall(100,100,100,100));
game.walls.push(new Wall(300,100,100,300));
game.walls.push(new Wall(400,300,100,100));
game.walls.push(new Wall(500,100,200,100));
game.walls.push(new Wall(300,500,100,100));

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

setInterval(function() {
    update();
}, 1000/60);
