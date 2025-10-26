/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
CANVAS_WIDTH = canvas.width = window.innerWidth;
CANVAS_HEIGHT = canvas.height = window.innerHeight;

const canvas1 = document.getElementById("canvasHitBox");
const collisionCTX = canvas1.getContext("2d");
canvas1.width = window.innerWidth;
canvas1.height = window.innerHeight;

let interval = 900;
let lastTime = 0;
let nextBirdTime = 0;
let bird = [];
let explosion = [];
let backgroundMusic = new Audio();
backgroundMusic.src = 'neon-gaming-128925.mp3';
let score = 0;
let gameOver = false;
ctx.font = '50px Impact';

function drawScore(){
    ctx.textAlign = 'left';
    ctx.fillStyle = 'black';
    ctx.fillText('Score : ' + score, 45, 75);
    ctx.fillStyle = 'white';
    ctx.fillText('Score : ' + score, 50, 75);
    
}

function drawgameOver(){
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    ctx.fillText('GAME OVER, Score: ' + score, canvas.width/2, canvas.height/2);

    ctx.fillStyle = 'white';
    ctx.fillText('GAME OVER, Score: ' + score, canvas.width/2 - 5, canvas.height/2 - 5);
    
    ctx.font = '30px Impact';
    ctx.fillStyle = 'yellow';
    ctx.fillText('Click to Restart', canvas.width/2, canvas.height/2 + 60);
    ctx.font = '50px Impact'; // reset font for next frame
}

function restartGame() {
    bird = [];
    explosion = [];
    score = 0;
    gameOver = false;
    nextBirdTime = 0;
    lastTime = 0;
    animate(0);
}


window.addEventListener('click', (clickCoord)=> {

    if (gameOver) {
        restartGame();
        return;
    }

    // playBackgroundMusic();
    const detectedColor = collisionCTX.getImageData(clickCoord.x, clickCoord.y, 1, 1);
    const pointColor = detectedColor.data;
    // console.log(pointColor);
    bird.forEach( tmp => {
        if(pointColor[0] == tmp.color[0] && pointColor[1] == tmp.color[1] && pointColor[2] == tmp.color[2]){
            tmp.marked = true;
            score++;
            explosion.push(new Explosion(tmp.x, tmp.y, tmp.width));
        }
    });
});

// const audioContext = new (window.AudioContext || window.webkitAudioContext)();
// let audioBuffer;
// async function loadAudio(url) {
//     const response = await fetch(url);
//     const arrayBuffer = await response.arrayBuffer();
//     audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
// }

// loadAudio('neon-gaming-128925.mp3');

// function playBackgroundMusic() {
//     const source = audioContext.createBufferSource();
//     source.buffer = audioBuffer;
//     source.loop = true;
//     source.connect(audioContext.destination);
//     source.start(0);
// }



class Explosion{
    constructor(x,y,size){
        this.image = new Image();
        this.image.src = 'boom.png';
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.size = size;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.newImageInterval = 100;
        this.currTime = 0;
        this.marked = true;

    }
    update(deltaTime){
        if(this.currTime > this.newImageInterval){
            this.frame > 4 ? this.marked = false : this.frame++;
            this.currTime = 0;
        }
        this.currTime += deltaTime;
    }
    draw(){
        ctx.drawImage(this.image, this.frame*this.spriteWidth, 0,
            this.spriteWidth, this.spriteHeight, this.x, this.y,
            this.size, this.spriteHeight);
    }
}

class Bird {
    constructor(){
        this.spriteWidth = 271;
        this.spriteHeight = 194;
        this.sizeModifier = 0.2 + 0.6*Math.random();
        this.width = this.spriteWidth*this.sizeModifier;
        this.height = this.spriteHeight*this.sizeModifier;
        this.x = window.innerWidth;
        this.y = (canvas.height - this.height)*Math.random();
        this.speedX = 1+5*Math.random();
        this.speedY = 1 + 5*Math.random() - 2.5;
        this.marked = false;
        this.image = new Image();
        this.image.src = 'enemy_raven.png';
        this.frame = 0;
        this.lastFlap = 0;
        this.flapInterval = 100 + 50*this.sizeModifier;
        this.color = [Math.floor(Math.random()*255),Math.floor(Math.random()*255),Math.floor(Math.random()*255)];
        this.colorText = 'rgb(' + this.color[0] + ','+ this.color[1] + ','+ this.color[2] + ')';

    }
    update(deltaTime){
        this.x -= this.speedX;
        this.y += this.speedY;
        if(this.x < -this.width){
            this.marked = true;
            gameOver = true;
        }
        if(this.y < 0 || this.y > canvas.height-this.height){
            this.speedY = -this.speedY; 
        }
        if(this.lastFlap > this.flapInterval){
            this.frame > 4 ? this.frame = 0 : this.frame++;
            this.lastFlap = 0;
        }
        this.lastFlap += deltaTime;
    }
    draw(){
        collisionCTX.fillStyle = this.colorText;
        collisionCTX.fillRect(this.x,this.y,this.width,this.height);
        ctx.drawImage(this.image, this.frame*this.spriteWidth, 0, this.spriteWidth, this.spriteHeight,
            this.x, this.y, this.width, this.height);
    }
}

function animate(timestamp){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    collisionCTX.clearRect(0,0,canvas.width,canvas.height);
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    nextBirdTime += deltaTime;
    if(nextBirdTime > interval){
        bird.push(new Bird());
        nextBirdTime = 0;
    }
    drawScore();
    [...bird, ...explosion].forEach(tmp => tmp.update(deltaTime));
    [...bird, ...explosion].forEach(tmp => tmp.draw());
    bird = bird.filter(obj => !obj.marked);
    if(!gameOver) requestAnimationFrame(animate);  
    else drawgameOver();

}

animate(0);