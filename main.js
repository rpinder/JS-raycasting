var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

var boundaries = [];
var walls = [];
var anglefacing = 0;
var x = 150;
var y = 300;

var aPressed = false;
var sPressed = false;
var dPressed = false;
var wPressed = false;

var view3d = false;

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
        ctx.strokeStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(x, y);
        if (this.colx != null) {
            ctx.lineTo(this.colx, this.coly)
        } else {
            ctx.lineTo(this.posX + 1000 * Math.cos(this.angle), this.posY + 1000 * Math.cos(this.angle));
        }
        ctx.stroke();
    }

    draw3d() {
        ctx.strokeStyle = 'white'
        for (var i = 0; i < 800; i++) {
            ctx.beginPath();
            var height = 600 / this.minDistance;
            ctx.moveTo(i,300-height/2);
            ctx.lineTo(i,300+height/2);
            ctx.stroke();
        }
    }

    collisionTest() {
        for (var i = 0; i < boundaries.length; i++) {
            var x1 = this.posX;
            var y1 = this.posY;
            var x2 = this.posX + 10 * Math.cos(this.angle);
            var y2 = this.posY + 10 * Math.sin(this.angle);

            var x3 = boundaries[i].startX;
            var y3 = boundaries[i].startY;
            var x4 = boundaries[i].endX;
            var y4 = boundaries[i].endY;

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

        boundaries.push(new Boundary(x, y, x+w, y));
        boundaries.push(new Boundary(x, y, x, y+h));
        boundaries.push(new Boundary(x+w, y, x+w, y+h));
        boundaries.push(new Boundary(x, y+h, x+w, y+h));
    }
}

function keyDownHandler(event) {
    var keyPressed = String.fromCharCode(event.keyCode);
    switch (keyPressed) {
    case "A":
        aPressed = true;
        break;
    case "D":
        dPressed = true;
        console.log("dpressed");
        break;
    case "W":
        wPressed = true;
        break;
    case "S":
        sPressed = true;
        break;
    case "H":
        view3d = !view3d;
        break;
    }
}

function keyUpHandler(event) {
    var keyReleased = String.fromCharCode(event.keyCode);
    switch (keyReleased) {
    case "A":
        aPressed = false;
        break;
    case "D":
        dPressed = false;
        break;
    case "W":
        wPressed = false;
        break;
    case "S":
        sPressed = false;
        break;
    }
}

function update() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0,800,600);

    var moveLockForward = false;
    var moveLockBackward = false;

    for (var i = 0; i < walls.length; i++) {
        if (x + 20 * Math.cos(anglefacing) > walls[i].x &&
            x + 20 * Math.cos(anglefacing) < walls[i].x + walls[i].width &&
            y + 20 * Math.sin(anglefacing) > walls[i].y &&
            y + 20 * Math.sin(anglefacing) < walls[i].y + walls[i].height) {
            moveLockForward = true;
        }

        if (x - 20 * Math.cos(anglefacing) > walls[i].x &&
            x - 20 * Math.cos(anglefacing) < walls[i].x + walls[i].width &&
            y - 20 * Math.sin(anglefacing) > walls[i].y &&
            y - 20 * Math.sin(anglefacing) < walls[i].y + walls[i].height) {
            moveLockBackward = true;
        } 
    }

    if (aPressed) {
        anglefacing-=0.05;
    }
    if (dPressed) {
        anglefacing+=0.05;
    }
    if (wPressed && !moveLockForward) {
        x += 2.5 * Math.cos(anglefacing);
        y += 2.5 * Math.sin(anglefacing);
    }
    if (sPressed && !moveLockBackward) {
        x -= 5 * Math.cos(anglefacing);
        y -= 5 * Math.sin(anglefacing);
    }
    

    var rays = [];
    for (var i = -Math.PI/6 + anglefacing; i < Math.PI/6 + anglefacing; i += (Math.PI/3) / 800) {
        rays.push(new Ray(x,y, i))
    }


    for (var i = 0; i < boundaries.length; i++) {
        if (view3d == false) {
            boundaries[i].draw();
        }
    }
    for (var i = 0; i < rays.length; i++) {
        rays[i].collisionTest();
        if (view3d == true) {
            var height = 600 / (0.03 * rays[i].minDistance);
            if (height > 600) {
                height = 600;
            }

            brightness = Math.round(height / ((600 / 255)**0.1));
            if (brightness > 255) {
                brightness = 255;
            }
            colorcode = '#' + brightness.toString(16) + brightness.toString(16) + brightness.toString(16);
            ctx.strokeStyle = colorcode;
            ctx.beginPath();
            ctx.moveTo(i,300-height/2);
            ctx.lineTo(i,300+height/2);
            ctx.stroke();

            ctx.strokeStyle = 'blue';
            ctx.beginPath();
            ctx.moveTo(i, 300-height/2);
            ctx.lineTo(i, 0);
            ctx.stroke();
        } else {
            rays[i].draw2d();
        }
    }
}
walls.push(new Wall(0,-100,800,100));
walls.push(new Wall(0,600,800,100));
walls.push(new Wall(-100,-100,100,800));
walls.push(new Wall(800,-100,800,800));

walls.push(new Wall(100,100,100,100));
walls.push(new Wall(300,100,100,300));
walls.push(new Wall(400,300,100,100));
walls.push(new Wall(500,100,200,100));
walls.push(new Wall(300,500,100,100));

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

setInterval(function() {
    update();
}, 1000/60);
