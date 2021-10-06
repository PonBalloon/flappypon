// sanity check
// alert("test")

let canvas = document.getElementById("screen");
let ctx = canvas.getContext("2d");

class Player{

    lives;
    position; //[x,y]
    velocity; //[x,y]
    image;
    size;
    complete;
    spriteData;
    frames;
    currentFrame;
    duration;
    timing;
    animationState;

    trail;
    trailLoaded;
    trailSprite;
    particles;

    constructor(){
        this.lives = 3;
        this.position = [200,canvas.height /2]; //center screen
        this.velocity = [0,0];
        this.image = new Image();
        this.size = 20;
        this.trail = []
        this.trailLoaded = false;
        this.trailSprite = new Image();
        this.trailSprite.src = "img/trail.png";
        this.trailSprite.onload = ()=>{
            this.trailLoaded = true;
        }
    }

    sprite(image, json){
        let passthough = this;
        
        fetch(json)
        .then(response => {
        return response.json();
        })
        .then(data =>{
            //load the json
            passthough.spriteData = data;
            //then try to load the image
            passthough.loadImage(image)
        });
    }

    loadImage(image){
        this.seconds = 0;
        this.maxSeconds = 10;
        this.complete = false;
        this.done = false;
        let passthough = this;

        this.image = new Image();
        this.image.src = image;
        this.image.onload = ()=>{
            passthough.complete = true;
            passthough.duration = []
            passthough.animationState = false;
            this.currentFrame = 0;
            this.timing = 0;
            this.frames = 0;
            for(let property in this.spriteData.frames) {
                this.sizeWidth = this.spriteData.frames[property].frame.w;
                this.sizeHeight = this.spriteData.frames[property].frame.h;
                this.duration.push(this.spriteData.frames[property].duration)
                this.frames++
            }
            
        }
    }

    flap(value){
        this.velocity[1] = -1.4;
        this.animationState = true;
        this.currentFrame = 0
    }

    gravity(delta){
        this.velocity[1] += 8/1000 * delta;
    }

    addTrail(){
        this.trail.push([this.position[0] - 4 ,this.position[1]])
    }

    resetTrail(){
        this.trail = []
    }

    updateTrail(delta){
        this.trail.forEach( (t, i) =>{
            t[0] -= .06 * delta
            if(t[0] < -20){
                //remove trail offscreen

                this.trail.splice(i,1)
            }
        })
      
    }

    update(delta){
        this.gravity(delta);
        //update position based on velocity
        this.position[0] += this.velocity[0];
        this.position[1] += this.velocity[1];

        //check collision
        gates.forEach( gate =>{

            //hit top
            if(this.position[0] + this.size > gate.position[0] &
               this.position[0] < gate.position[0] + gate.size  &&
               this.position[1] < gate.position[1] + 20 
            ){
                alert("Hit Top")
                reset()
            }

            //hit top
            if(this.position[0] + this.size > gate.position[0] &
                this.position[0] < gate.position[0] + gate.size  &&
                this.position[1] + this.size > gate.position[1] + 150 - difficulty
             ){
                 alert("Hit bottom")
                 reset()
             }
           
            if(this.position[1] >= canvas.height){
                alert("hit Floor")
                reset()
            }

            if(this.position[1] < -this.size){
                alert("hit roof")
                reset()
            }


        })



        if(this.animationState){
            this.timing += 1.4 * delta;
            if(this.timing >= 100){
                
                this.currentFrame++
                this.timing = 0;
                //if current frame goes over total frames then reset
                if(this.currentFrame >= this.frames){
                    this.currentFrame = 0;
                    this.animationState = false;
                };
            }
        }

        //trail
        this.addTrail()
        this.updateTrail(delta)
        
        
    }

    draw(){

        //trail
        ctx.fillStyle = "white"
        ctx.globalAlpha = 0.00;

        for(let i = 0; i < this.trail.length; i++){
            ctx.globalAlpha += .0020    ;
            let ranY =  Math.floor(Math.random() * 32)
            let ranX =  Math.floor(Math.random() * 20)
            ctx.fillRect(
                this.trail[i][0] + ranX , //x
                this.trail[i][1] + ranY, //y
                2 , //width
                2 , //height
            )
            
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = "black"
        

        //currently a square;
        if(this.complete){
            //ctx.drawImage(this.image, this.position[0], this.position[1]);
            ctx.drawImage(this.image, 
                this.currentFrame * this.sizeWidth, 0, 
                this.sizeWidth, this.sizeHeight, 
                this.position[0], this.position[1], 
                this.sizeWidth, this.sizeHeight);
        }else{
            ctx.fillRect(
                this.position[0], //x
                this.position[1], //y
                this.size , //width
                this.size , //height
            )
        }

        if(this.trailLoaded){
            ctx.globalAlpha = 0.0;
            for(let i = 0; i < this.trail.length; i++){
                ctx.globalAlpha += .00005
                if(ctx.globalAlpha > 0.1){
                    ctx.globalAlpha = 0.1
                }
                ctx.drawImage(this.trailSprite ,
                    this.trail[i][0], //x
                    this.trail[i][1]+ (i / 200), //y
                    20  , //width
                    20 - (i / 200), //height
                )
                
            }
            ctx.globalAlpha = 1;
        }else{
            for(let i = 0; i < this.trail.length; i++){
                ctx.fillRect(
                    this.trail[i][0], //x
                    this.trail[i][1], //y
                    4 , //width
                    4 , //height
                )
            }
        }

        
        
        
        
        

    }

}

class InputHandler{

    key = new Map()
    func = new Map()

    constructor(){
        this.flap = false;
    }

    addKey(code, action){
        this.func.set(code, action)

        window.addEventListener("keydown", (e)=>{
            if(e.keyCode == code){
                
                this.key.set(code, true)
            }
        }, false)
        window.addEventListener("keyup", (e)=>{
            if(e.keyCode == code){
                this.key.set(code, false)
            }
        }, false);
    }

    update(){
        this.key.forEach( (value, key) =>{
            if(value){
                this.func.get(key)( )
            }
        })
    }

}

class Gate{

    position;
    size;

    constructor(x, y){
        if(x | y){
            this.position = [x,y];
        }else{
            this.position = [100,0];
        }
        
        this.size = 100;
    }

    draw(){

        

        if(loaded[0] && loaded[1]){
            
            ctx.drawImage(pillarT, 
                0, 0, 
                pillarT.width, 1,
                this.position[0], 0, 
                this.size , //width
                20 + this.position[1] );

            ctx.drawImage(pillarT, 
                this.position[0], //x
                this.position[1]  - pillarT.height + 20, //y
                this.size , //width
                pillarT.height) //height

            ctx.drawImage(pillarT, 
                0, 0, 
                pillarT.width, 1,
                this.position[0], this.position[1] + 150 - difficulty + pillarB.height ,
                this.size , //width
                canvas.height) //height

            ctx.drawImage(pillarB, 
                this.position[0], //x
                this.position[1] + 150 - difficulty + 10 , //the plus 10 is jank
                this.size , //width
                pillarT.height) //height

                

        }
        else{

            ctx.fillRect(
                this.position[0], //x
                0, //y
                this.size , //width
                20 + this.position[1], //height
            )
    
            ctx.fillRect(
                this.position[0], //x
                this.position[1] + 150 - difficulty , //y
                this.size , //width
                520, //height
            )
        }

        
        
    }

}

class CloudGen{

    clouds;
    loaded;
    constructor(cloudnum){
        this.totalClouds = cloudnum;
        this.clouds = [];
        this.position = [];
        this.timings = 0;
        this.type = [];
        this.velocity = [];
        this.loaded = [];

        this.clouds[0] = new Image();
        this.clouds[1] = new Image();

        this.clouds[0].src = "img/cloud1.png"
        this.clouds[1].src = "img/cloud2.png"

        this.clouds[0].onload = ()=>{
            this.loaded[0] = true;
        }
        this.clouds[1].onload = ()=>{
            this.loaded[1] = true;
        }

        this.spacing = this.totalClouds / canvas.width;
        this.createCloud(30)
        this.createCloud(150);
        this.createCloud(220)
        this.createCloud(330)
        this.createCloud(530)
    }

    createCloud(location){
        let x
        if(location){
            x = location;
        }else{
            x = canvas.width;
        }
        let y = Math.floor(Math.random() * canvas.height-50) ;
        let vel = Math.floor(Math.random() * 500) /100 ;
        let type = Math.floor(Math.random() * 2)
        this.position.push([x,y]);
        this.velocity.push(vel);
        this.type.push(type);
    }

    deleteCloud(index){
        this.position.splice(index, 1);
        this.velocity.splice(index, 1);
        this.type.splice(index, 1);
    }

    draw(){
        
        if(this.loaded[0] && this.loaded[1]){
            for(let i = 0; i < this.position.length;i++){
                    ctx.drawImage(this.clouds[this.type[i]],
                    this.position[i][0],
                    this.position[i][1]);
            }
        }
    }

    update(delta){

        if(this.timing < this.spacing){
            this.createCloud();
        }
        //for spawning new gates
        this.timing += 1 * delta;

        for(let i = 0; i < this.position.length;i++){
            this.position[i][0] -= this.velocity[i]/20 * delta;
            if(this.position[i][0] < -300){
                this.deleteCloud(i);
                this.createCloud();
            }
        }
    }

}

//TODO: allocate to game object 
let oldTime = 0;
let start = false;
let player;
let ih;
let gates = [];
let difficulty =  0
let spacing = 230 ;
let gateCounter = 0;
let pillarT = new Image();
let pillarB = new Image();
let loaded = [false,false];
let cg;
let score = 0;


//TODO: createGateGenerator object 
function CreateGate(){

    let x = canvas.width;
    let y = Math.floor(Math.random() * canvas.height-150) + 50;

    gates.push( new Gate(x,y))
}

function drawScore(){
    ctx.font = '20px impact';
    ctx.fillStyle = 'white';
        ctx.fillText('Score: ' + score, 0, 20);
        ctx.fillStyle = 'black';
        ctx.strokeText('Score: ' + score, 0, 20 );
}

function init(){
    player = new Player();
    player.sprite("img/twilightfly.png", "img/twilightfly.json")
    ih = new InputHandler();

    ih.addKey(32, ()=>{

        if(!start){
            start = true;
        }else{
            player.flap();
        } 
        
    })


    pillarT.src = "img/pillarT.png";
    pillarT.onload = ()=>{
        loaded[0] = true;
    }
    pillarB.src =  "img/pillarB.png" ;
    pillarB.onload = ()=>{
        loaded[1] = true;
    }

    cg = new CloudGen(8);
    gates.push( new Gate(400,canvas.height/2 ))
    CreateGate()
    requestAnimationFrame(loop);
}

function reset(){
    alert("Your score: " + score);
    gates = [];
    gates.push( new Gate(400,canvas.height/2 ))
    player.position = [200,canvas.height /2];
    player.velocity = [0,0];
    player.resetTrail();
    start = false;
    score = 0;
}


function loop(timestamp){

    let delta = timestamp - oldTime;

    if(gateCounter > spacing){
        gateCounter = 0;
        CreateGate();
    }

    ih.update();
    //logic 
    if(start){
        cg.update(delta)
        player.update(delta);
        gates.forEach((gate, i) =>{

            gate.position[0] -= .06 * delta;
            if(gate.position[0] < - gate.size){
                gates.splice(i, 1)
            }
            if(gate.position[0] >= 199 && gate.position[0] <= 200  ){
                score++;
            }

       
        })
        //for spawning new gates
        gateCounter += .06 * delta;
        
    }
    

    //drawing
    ctx.clearRect(0,0, canvas.width, canvas.height)

    //background
    ctx.fillStyle = '#84d3f0';
    ctx.fillRect(0,0,canvas.width,canvas.height)
    ctx.fillStyle = 'black';

    cg.draw();

    player.draw();

    gates.forEach( gate =>{
        gate.draw();
    })
    drawScore()

    if(!start){
        ctx.font = '48px impact';
        ctx.fillStyle = 'white';
        ctx.fillText('Press Space to Start', canvas.width/2 - 200, canvas.height/2 - 48);
        ctx.fillStyle = 'black';
        ctx.strokeText('Press Space to Start', canvas.width/2 - 200, canvas.height/2 - 48);
    }
    

    oldTime = timestamp;
    requestAnimationFrame(loop);
}

init();

