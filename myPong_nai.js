/*  Classes     */
function Paddle(xPosition, yPosition, paddleWidth, paddleHeight) {
    // This class generates a pong paddle
    
    this.xPosition = xPosition;
    this.yPosition = yPosition;
    this.paddleWidth = paddleWidth;
    this.paddleHeight = paddleHeight;
    this.xSpeed = 0;
    this.ySpeed = 0;
}

Paddle.prototype.render = function() {
    // Paddle class instance function. Draws the paddle
    
    context.fillStyle = "#59a6ff";
    context.fillRect(this.xPosition, this.yPosition, this.paddleWidth, this.paddleHeight);
};

Paddle.prototype.move = function(xDir = 0, yDir = 0) {
    //Paddle class instance function. Moves the paddle xDir and yDir
    
    this.xPosition += xDir;
    this.yPosition += yDir;
    this.xSpeed = xDir;
    this.ySpeed = yDir;
    
    if(this.xPosition < 0) {
        this.xPosition = 0;
        this.xSpeed = 0;
    }
    else if(this.xPosition + this.paddleWidth > tableWidth) {
        this.xPosition = 400 - this.paddleWidth;
        this.xSpeed = 0;
    }
};

function Ball(xPosition, yPosition) {
    // This class creates a ball.
    
    this.xPosition = xPosition;
    this.yPosition = yPosition;
    this.xSpeed = 0;
    this.ySpeed = 5;
    this.radius = 5;
}

Ball.prototype.render = function() {
    // Ball class instance function. Draws a ball.
    
    context.beginPath();
    context.arc(this.xPosition, this.yPosition, this.radius, 2 * Math.PI, false);
    context.fillStyle = "#ddff59";
    context.fill();
};

Ball.prototype.update = function(userPaddle, computerPaddle) {
    // Ball class instance function. Updates position of ball
    
    this.xPosition += this.xSpeed;
    this.yPosition += this.ySpeed;
    
    var leftEdge = this.xPosition - this.radius;
    var rightEdge = this.xPosition + this.radius;
    var topEdge = this.yPosition - this.radius;
    var bottomEdge = this.yPosition + this.radius;
    
    if(leftEdge < 0) {
        this.xPosition = 5;
        this.xSpeed = -this.xSpeed;
    }
    else if(rightEdge > tableWidth) {
        this.xPosition = tableWidth - this.radius;
        this.xSpeed = -this.xSpeed;
    }
    
    if(this.yPosition < 0 || this.yPosition > tableHeight) {
        this.xPosition = 200;
        this.yPosition = 300;
        this.xSpeed = 0;
        this.ySpeed = 5;
    }
    
    if(topEdge > (tableHeight / 2)) {
        if(leftEdge < (userPaddle.xPosition + userPaddle.paddleWidth) && rightEdge > userPaddle.xPosition && bottomEdge > userPaddle.yPosition) {
            this.ySpeed = -this.ySpeed;
            this.xSpeed += (userPaddle.xSpeed / 2);
            this.yPosition -= this.radius;
        }
    }
    else {
        if(leftEdge < (computerPaddle.xPosition + computerPaddle.paddleWidth) && rightEdge > computerPaddle.xPosition && bottomEdge > computerPaddle.yPosition && topEdge < (computerPaddle.yPosition + computerPaddle.paddleHeight)) {
            this.ySpeed = -this.ySpeed;
            this.xSpeed += (computerPaddle.xSpeed / 2);
            this.yPosition += this.radius;
        }
    }
}


function Computer() {
    // Creates a computer player
    
    this.paddle = new Paddle(175, 10, 50, 10);
}

Computer.prototype.render = function() {
    // Computer class instance function. Draws computer paddle
    
    this.paddle.render();
};

Computer.prototype.update = function(ball) {
    // Computer class instance function. Moves computer paddle location based on location of ball
    
    var xBall = ball.xPosition;
    // Finds position difference between computer paddle and ball
    var delta = -((this.paddle.xPosition + (this.paddle.paddleWidth / 2)) - xBall);
    
    if(delta < 0 && delta < -4) {
        delta = -4;
    }
    else if(delta > 0 && delta > 4) {
        delta = 4;
    }
    
    this.paddle.move(delta, 0);
    
    if(this.paddle.xPosition < 0) {
        this.paddle.xPosition = 0;
    }
    else if(this.paddle.xPosition + this.paddle.paddleWidth > tableWidth) {
        this.paddle.xPosition = tableWidth - this.paddle.paddleWidth;
    }
};

function Player() {
    // Creates a user player
    
    this.paddle = new Paddle(175, 580, 50, 10);
}

Player.prototype.render = function() {
    // Player class instance function. Draws player paddle
    
    this.paddle.render();
};

Player.prototype.update = function() {
    // Player class instance function. Changes position of player paddle
    
    for (var key in keysDown) {
        var keyPressed = Number(key);
        
        if(keyPressed == 37) {
            this.paddle.move(-4, 0);
        }
        else if(keyPressed == 39) {
            this.paddle.move(4, 0);
        }
        else {
            this.paddle.move(0, 0);
        }
    }
};

/*  Global variables    */
var tableHeight = 600;
var tableWidth = 400;
var keysDown = {};

// Create a canvas
var canvas = document.createElement("canvas");
canvas.width = tableWidth;
canvas.height = tableHeight;
var context = canvas.getContext("2d");

// Provides animation
var animate = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
    window.setTimeout(callback, 1000 / 60);
};

// Create a ball
var ball = new Ball(200, 300);

// Create a user player
var player = new Player();

// Create a computer player
var computer = new Computer();

// Render different elements
var render = function() {
    context.fillStyle = "#000000";
    context.fillRect(0, 0, tableWidth, tableHeight);
    ball.render();
    player.render();
    computer.render();
}

// Update different elements
var update = function() {
    player.update();
    computer.update(ball);
    ball.update(player.paddle, computer.paddle);
}

// Animate this function to create each frame
var step = function() {
    update();
    render();
    animate(step);
}

/*  // Global variables */

/*  Initialization  */
document.body.appendChild(canvas);
animate(step);

// Check keystrokes for user interaction
window.addEventListener('keydown', function(event) {
    keysDown[event.keyCode] = true;
});

window.addEventListener('keyup', function(event) {
    delete keysDown[event.keyCode];
})