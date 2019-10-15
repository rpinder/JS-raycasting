var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

var boundaries = [];
var anglefacing = 0;
var x = 400;
var y = 300;

var aPressed = false;
var sPressed = false;
var dPressed = false;
var wPressed = false;

class Ray {
    constructor(x, y, dir) {
        this.posX = x;
        this.posY = y;
        this.angle = dir;
        this.colx = null;
        this.coly = null;
        this.minDistance = 1000000;
    }

    draw() {
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

function keyDownHandler(event) {
    var keyPressed = String.fromCharCode(event.keyCode);
    switch (keyPressed) {
    case "A":
        aPressed = true;
        break;
     case "D":
        dPressed = true;
        break;
    case "W":
        wPressed = true;
        break;
    case "S":
        sPressed = true;
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

    if (aPressed) {
        anglefacing-=0.1;
    }
    if (dPressed) {
        anglefacing+=0.1;
    }
    if (wPressed) {
        x += 5 * Math.cos(anglefacing);
        y += 5 * Math.sin(anglefacing);
    }
    if (sPressed) {
        x -= 5 * Math.cos(anglefacing);
        y -= 5 * Math.sin(anglefacing);
    }
  

   var rays = [];
    for (var i = -Math.PI/3 + anglefacing; i < Math.PI/3 + anglefacing; i += (Math.PI/6) / 60) {
        rays.push(new Ray(x,y, i))
    }
    for (var i = 0; i < boundaries.length; i++) {
        boundaries[i].draw();
    }
    for (var i = 0; i < rays.length; i++) {
        rays[i].collisionTest();
        rays[i].draw();
    }
}

boundaries.push(new Boundary(700, 100, 700, 500))
boundaries.push(new Boundary(100, 100, 100, 500))
boundaries.push(new Boundary(300, 100, 500, 100))
boundaries.push(new Boundary(200, 400, 500, 400))

boundaries.push(new Boundary(0, 0, 800, 0))
boundaries.push(new Boundary(0, 0, 0, 600))
boundaries.push(new Boundary(800, 600, 800, 0))
boundaries.push(new Boundary(800, 600, 0, 600))


document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

setInterval(function() {
    update();
}, 1000/30);
