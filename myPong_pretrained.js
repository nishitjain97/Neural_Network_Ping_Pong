/*  Loading pretrained model */
async function init() {
    model = await tf.loadModel('http://localhost/Neural_Network_Ping_Pong/tfjsmodel/model.json');
    console.log('Model fetched successfully!')
    animate(step);
}

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

Paddle.prototype.move = function(xDir, yDir) {
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
    this.xSpeed = Math.floor(Math.random() * 4 - 2);
    this.ySpeed = 4;
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
        this.xSpeed = Math.floor(Math.random() * 4 - 2);
        this.ySpeed = 4;
        saveDat.newTurn();
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
    this.aiPlays = false;
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
        delta = -5;
    }
    else if(delta > 0 && delta > 4) {
        delta = 5;
    }
    
    this.paddle.move(delta, 0);
    
    if(this.paddle.xPosition < 0) {
        this.paddle.xPosition = 0;
    }
    else if(this.paddle.xPosition + this.paddle.paddleWidth > tableWidth) {
        this.paddle.xPosition = tableWidth - this.paddle.paddleWidth;
    }
};

Computer.prototype.aiUpdate = function(move) {
    if(move != 0) {
        move = -move;
    }
    this.paddle.move(4 * move, 0);
}

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

function SaveData() {
    // Class to store and save data
    
    this.previousData = null;
    this.trainingData = [[], [], []];
    this.lastDataObject = null;
    this.turn = 0;
    this.dataXS = [];
    this.dataYS = [];
}

SaveData.prototype.generateData = function(player, computer, ball) {
    
    if(this.previousData == null) {
        data = [tableWidth - player.xPosition, tableWidth - ball.xPosition, tableHeight - ball.yPosition, tableWidth - ball.xSpeed, tableHeight - ball.ySpeed];
        this.previousData = data;
        return
    }
    
    dataX = [tableWidth - player.xPosition, tableWidth - ball.xPosition, tableHeight - ball.yPosition, tableWidth - ball.xSpeed, tableHeight - ball.ySpeed];
    
    index = (tableWidth -  player.xPosition > this.previousData[0]) ? 0 : ((tableWidth - player.xPosition  == this.previousData[0]) ? 1 : 2);
    
    this.lastDataObject = [...this.previousData, ...dataX];
    this.trainingData[index].push(this.lastDataObject);
    this.previousData = dataX;
};

SaveData.prototype.newTurn = function() {
    this.turn += 1;
    console.log('Turn' + this.turn);
    
    computer.ai_plays = true;
    
    if(this.turn % 2 == 0) {
        computer.aiPlays = true;
    }
    
    if(this.turn % 3 == 0) {
        computer.aiPlays = false;
        this.saveData();
    }
}

SaveData.prototype.saveData = function() {
    // Creates dataset after n turns and retrains model
    
    console.log('Trainig');
    
    len = Math.min(this.trainingData[0].length, this.trainingData[1].length, this.trainingData[2].length);
    
    if(!len) {
        console.log('No data to save');
        return;
    }
    
    for(i = 0; i < 3; i++) {
        this.dataXS.push(...this.trainingData[i].slice(0, len));
        this.dataYS.push(...Array(len).fill([i == 0 ? 1: 0, i == 1 ? 1 : 0, i == 2 ? 1 : 0]));
    }
    
    ai.train(this.dataXS, this.dataYS);
    this.resetData();
}

SaveData.prototype.resetData = function() {
    // Delete previous data after training model
    
    this.previousData = null;
    this.trainingData = [[], [], []];
    this.dataXS = [];
    this.dataYS = [];
};

function AI() {
}

AI.prototype.train = function(dataXS, dataYS) {
    const xs = tf.tensor(dataXS);
    const ys = tf.tensor(dataYS);
    
    (async function() {
        const optimizer = tf.train.adam(0.001);
        model.compile({
            optimizer: optimizer,
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy'],
        });
        
        let result = await model.fit(xs, ys, {
            batchSize: 64,
            epochs: 1,
            shuffle: true,
            validationSplit: 0.1,
            callbacks: {
                onBatchEnd: async(batch, logs) => {
                    console.log("Step " + batch + ", loss:" + logs.loss.toFixed(5) + ", acc: " + logs.acc.toFixed(5));
                },
            },
        });
    }());
    
    console.log("Trained");
};

AI.prototype.predict = function() {
    if(saveDat.lastDataObject != null) {
        var prediction = model.predict(tf.tensor2d([saveDat.lastDataObject], [1, 10]));
        return -(tf.argMax(prediction, 1).dataSync()-1);
    }
}

/*  Global variables    */
var tableHeight = 600;
var tableWidth = 400;
var keysDown = {};
var stop = false;

// Create a canvas
var canvas = document.createElement("canvas");
canvas.width = tableWidth;
canvas.height = tableHeight;
var context = canvas.getContext("2d");

// Provides animation
var animate = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
    window.setTimeout(callback, 1000 / 60);
};

// Create a Ball
var ball = new Ball(200, 300);

// Create a User player
var player = new Player();

// Create a Computer player
var computer = new Computer();

// Create a SaveData object
var saveDat = new SaveData();

// AI object
var ai = new AI();

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
    player.update(ball);
    saveDat.generateData(player.paddle, computer.paddle, ball);
    
    if(computer.ai_plays) {
        move = ai.predict();
        computer.aiUpdate(move);
    }
    else {
        computer.update(ball);
    }
    ball.update(player.paddle, computer.paddle);
}

var model = null;

// Animate this function to create each frame
var step = function() {
    if(stop) {
        return;
    }
    
    update();
    render();
    animate(step);
}

/*  // Global variables */

/*  Initialization  */
document.body.appendChild(canvas);
init();

// Check keystrokes for user interaction
window.addEventListener('keydown', function(event) {
    keysDown[event.keyCode] = true;
});

window.addEventListener('keyup', function(event) {
    delete keysDown[event.keyCode];
})