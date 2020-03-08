import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import io from "socket.io-client";
import { HostListener } from '@angular/core';
import { Enemy } from '../classes/Enemy';
import {Player} from '../classes/Player';
import {
    trigger,
    state,
    style,
    animate,
    transition,
    // ...
  } from '@angular/animations';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css'],
    animations: [
        // animation triggers go here
      ]
})
export class GameComponent implements OnInit {
    
    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) { 
        //event.preventDefault();
        console.log(event.key);
        if(this.gameOver == false)
        //allows player to play game if game is not over
        {
            var keypress = this.readKey(event.key)
            if(keypress != 'empty') this.move(keypress)
        }
    
  }

    @ViewChild("game", {static: false})
    private gameCanvas: ElementRef;
    private p1Score: number = 0;
    private p2Score: number = 0;
    private time: number = 180;
    private context: any;
    private socket: any;
    private gameOver: boolean = false;
    private playerDeath: boolean = false;
    private winner: Player;
    private player1: Player;
    private player2: Player;
    private message: String = " "
    private Enemies_1 : Enemy[] = [] //Enemies at the left screen
    private Enemies_2 : Enemy[] = [] //Enemies at the right screen

    constructor(){
    }

interval;

gameEnd(){
        this.gameOver = true
        if(this.playerDeath){
            this.message = "Game over!"
        }
        else{
            if(this.p1Score > this.p2Score) this.message= "Player 1 wins!"
            else if(this.p2Score > this.p1Score) this.message = "Player 2 wins!"
            else this.message = "It's a draw!"
        }
        
}

startTimer() {
  /*
    DIFFICULTY NUMBER:
    1 => Is going to shoot every second
    2 => Is going to shoot every 2 seconds
    3 => Is going to shoot every 3 seconds.
  */  
  let difficulty_number = 1;
  let counter = 0;
  this.interval = setInterval(() => {
    
    if(!this.gameOver){
    if(difficulty_number == 1){
        this.invaderShoot();
    }
    else if(difficulty_number == 2){
        if(counter == 2){
            this.invaderShoot();
            counter = 0;
        }
    }
    else if(difficulty_number == 3){
        if(counter == 3){
            this.invaderShoot();
            counter = 0;
        }
    }}
      //stops timer after 0
      if(!this.gameOver){
    if(this.time > 0) this.time -= 1;
    if(this.time == 0){
        //if game ends
        this.gameEnd()
    } }
    counter++;
  },1000)
}

    /*public shootOnDifficulty(difficulty_number, counter){
        if(difficulty_number == 1){
            this.invaderShoot();
        }
        else if(difficulty_number == 2){
            if(counter == 2){
                this.invaderShoot();
                counter = 0;
            }
        }
        else if(difficulty_number == 3){
            if(counter == 3){
                this.invaderShoot();
                counter = 0;
            }
        }
    }*/

    public ngOnInit() {
        this.socket = io("http://localhost:3000");
        this.positionInvaders();
        this.player1 = new Player()
        this.player1.position_x = 230
        this.player1.position_y = 400
        this.startTimer();
    }
    public ngAfterViewInit() {
      this.context = this.gameCanvas.nativeElement.getContext("2d");
      this.socket.on("position", data => {
          this.player1.position_x = data.position.x
          this.player1.position_y = data.position.y 
          //console.log(data.oldposx)
          //console.log(data.oldposy)
          //console.log(data.position)
          //this.context.clearRect(0, 0, this.gameCanvas.nativeElement.width, this.gameCanvas.nativeElement.height);
          this.context.clearRect(data.oldposx, data.oldposy, 35, 40);
          let space_img = document.createElement("img");
          space_img.src = "../../assets/img/spaceship.png";
          space_img.id = "spacecraft";
          this.context.drawImage(space_img, data.position.x, data.position.y, 35, 40)

        
    })


    this.socket.on("shoot", data=>{
        let laser = this.createLaserElement(data.x,data.y); 
        this.context.drawImage(laser,data.x,data.y-15,35,40);
        this.moveLaser(laser,data.x,data.y)

    })
  }

  public invaderShoot(){
      console.log("Invader shoot");
      let random = Math.floor(Math.random() * (this.Enemies_1.length -1 - 0) + 0);
      console.log(random);

      //commented this as it caused an infinite loop once all enemies killed
      /*while(this.Enemies_1[random] == undefined){
        random = Math.floor(Math.random() * (this.Enemies_1.length -1 - 0) + 0);
      }*/
      if(this.Enemies_1[random] != undefined){
          let pos_x = this.Enemies_1[random].position_x;
          let pos_y = this.Enemies_1[random].position_y;
          let laser = this.createInvaderLaserElement(pos_x,pos_y);
          this.context.drawImage(laser,pos_x,pos_y+20,35,40);
          this.moveInvaderLaser(laser, pos_x, pos_y+20);
          
      }
  }

  public createInvaderLaserElement(x,y){
    let x_position = x;
    let y_position = y;
    let new_laser = document.createElement("img");
    new_laser.src = "../../assets/img/laser.png";
    new_laser.classList.add('laser');
    new_laser.style.left = `${x_position-10}px`;
    new_laser.style.top = `${y_position+30}px`;
    return new_laser;
  }
  public createLaserElement(x,y){ // LOADS LASER IMAGE
      let x_position = x;
      let y_position = y;
      let new_laser = document.createElement("img");
      new_laser.src = "../../assets/img/laser.png";
      new_laser.classList.add('laser');
      new_laser.style.left = `${x_position+40}px`;
      new_laser.style.top = `${y_position+40}px`;
      return new_laser;
  }
  public moveInvaderLaser(laser,x,y){
      this.context = this.gameCanvas.nativeElement.getContext("2d");
      let x_position = x;
      let y_position = y;
      var count = 0
      let laserInterval = setInterval(()=>{
        let img = this.context.getImageData(x_position,y_position, 35,40);
        //to ensure only the bullet is fully cleared
        if(count > 2) this.context.clearRect(x_position,y_position-5, 35, 40);

        if(y_position > 670){ //THE LIMIT OF THE SCREEN
            this.context.clearRect(x_position,y_position, 35, 40);
            clearInterval(laserInterval);
        }else{
            if(!this.checkIfPlayerWasShot(x_position, y_position)){
            y_position += 5
            count++
            this.context.drawImage(laser,x_position,y_position,35,40);}

            //this line was causing a glitchy animation
            //this.context.putImageData(img,35,40);
        }


        
        //  this.context.clearRect(x_position,y_position, 35, 40)
        //this.drawEnemy(x_position,y_position);
        
      },10)
  }

  public drawEnemy(x,y){
    let ctx = this.context;
    let invader_img = document.createElement("img");
    invader_img.src = "../../assets/img/invader.png";
    invader_img.id = "spacecraft";
    invader_img.onload = function(){
        ctx.drawImage(invader_img, x, y, 35, 40);
    }   
  }


  public moveLaser(laser,x,y){
    this.context = this.gameCanvas.nativeElement.getContext("2d");
    let x_position = x
    let y_position = y
    let laserInterval = setInterval(()=>{
        //console.log("Moving: "+x_position+", "+y_position);
        this.context.clearRect(x_position,y_position, 35, 40);

        if(y_position < 5){ //THE LIMIT OF THE SCREEN
            this.context.clearRect(x_position,y_position, 35, 40);
            clearInterval(laserInterval);
        }else{
            y_position -= 5
            this.context.drawImage(laser,x_position,y_position,35,40);
        }
        this.move("appear"); //IT CALLS THE SERVER TO POSITION THE SPACESHIP AT THE LAST POSITION RECORDED

        
        let index = this.checkIfEnemyWasShot(x_position, y_position);
        if(index != -1){
            clearInterval(laserInterval);
            this.context.clearRect(x_position,y_position, 35, 40);
            this.destroyEnemy(index);
            return
        }


    },10)

  }

  public checkIfPlayerWasShot(x,y){
        if((this.player1.position_x + 20 >= x && this.player1.position_x - 20 <= x)
            &&
           (this.player1.position_y + 10 >= y && this.player1.position_y - 10 <= y)){
            this.playerDeath = true
            this.destroyPlayer(x, y)
            this.gameEnd()
            return true
           }
    return false;
  }

  public destroyPlayer(x,y){
      var stop = false
      if(!stop){

      
    //adjusted some of the values to line up enemy/ animation
    this.context.clearRect(x,y, 35, 40); //REMOVES ENEMY FROM CANVAS
    let explosion_img = document.createElement("img");
    explosion_img.src = "../../assets/img/player_explosion.png";
    let context = this.context;
    explosion_img.onload = function(){
        context.drawImage(explosion_img, x,y, 35, 40); //PUTS THE EXPLOSION IMAGE ON SCREEN
    }


    //moved above lines out of the timer so enemy is deleted before animation plays, so player can't hit same enemy twice
    let remove_explosion = setTimeout(()=>{ //SETS A TIMER FOR .5 SECONDS TO REMOVE EXPLOSION IMG

        
        context.clearRect(x-20,y+20,35,40);
        stop = true
    },1000)}}

  public checkIfEnemyWasShot(x,y){
    for(let enemy in this.Enemies_1){
        if((this.Enemies_1[enemy].position_x + 20 >= x && this.Enemies_1[enemy].position_x - 20 <= x)
            &&
           (this.Enemies_1[enemy].position_y + 10 >= y && this.Enemies_1[enemy].position_y - 10 <= y)){

            //will need to be changed to be dynamic to the player
            this.p1Score +=10 
            let index = this.Enemies_1.indexOf(this.Enemies_1[enemy]);
            return index;
           }
    }
    return -1;
  }

  public destroyEnemy(index){
    let Enemy_posX = this.Enemies_1[index].position_x;
    let Enemy_posY = this.Enemies_1[index].position_y;

    console.log("x:" + Enemy_posX + " y: " + Enemy_posY)
       

    //adjusted some of the values to line up enemy/ animation
    this.context.clearRect(Enemy_posX, Enemy_posY, 35, 40); //REMOVES ENEMY FROM CANVAS
    let explosion_img = document.createElement("img");
    explosion_img.src = "../../assets/img/explosion2.png";
    let context = this.context;
    explosion_img.onload = function(){
        context.drawImage(explosion_img, Enemy_posX, Enemy_posY, 35, 40); //PUTS THE EXPLOSION IMAGE ON SCREEN
    }
    let explosion_x = this.Enemies_1[index].position_x;
    let explosion_y = this.Enemies_1[index].position_y;
    delete this.Enemies_1[index]; //REMOVES ENEMY FROM ARRAY OF ENEMIES


    //moved above lines out of the timer so enemy is deleted before animation plays, so player can't hit same enemy twice
    let remove_explosion = setTimeout(()=>{ //SETS A TIMER FOR .5 SECONDS TO REMOVE EXPLOSION IMG

        
        context.clearRect(explosion_x,explosion_y,35,40);
    },1000)

  }

  public enemyPass(//player
  ){
      //if an enemy passes your ship and goes off screen


      /*
      if((player.score -10) < 0){ player.score = 0}
      else {player.score -=10}
      */
  }

  public shipCollision(//player, invader
  ){
    /*
    if player and invader collide

    if (player.position_x == invader.position_x && player.position_y == invader.position_y){
        if(player == player1){
            winner = player2
        }
        else if(player == player2){
            winner = player1
        }
    }
    */
  }

  public move(direction: string) {
    this.socket.emit("move", direction);
}

  public readKey(value: string){
      switch(value){
        case('ArrowRight'):
            return 'right';
        case('ArrowLeft'):
                return 'left';
        case 'p':
            this.socket.emit("shoot", 'x')
            break;
        default:
            return 'empty';
      }
  }

  public positionInvaders(){
    //this.socket.emit("resetPosition");
    var enemies : Enemy[] = []
    var canvas = <HTMLCanvasElement> document.getElementById("canvas_1");
    var ctx = canvas.getContext("2d");
    var images = [ // THE LENGTH IS DEFINED BY HOW MANY IMAGES WE WANT IN A SINGLE ROW
        "../../assets/img/invader.png",
        "../../assets/img/invader.png",
        "../../assets/img/invader.png",
        "../../assets/img/invader.png",
        "../../assets/img/invader.png",
        "../../assets/img/invader.png",
        "../../assets/img/invader.png",
    ]
    .map(function(i){
        var img = document.createElement("img");
        img.src = i;
        return img;
    });
    Promise.all(images.map(function(image){
        return new Promise(function(resolve,reject){ // WAITS FOR THE IMAGE TO BE LOADED BEFORE IT CAN DRAW IT ON THE CANVAS
            image.onload = resolve;
        });
    }))
    .then(function(){
        let stop = false;
        let rows = 1;
        let pos_y = 5;
        let pos_x = 50;
        for(var i= 0; i < images.length; i++){
            if(i == images.length -1 && !stop){ // WE WANT TO STOP IF 3 ROWS HAVE ALREADY BE DRAWN
                if(rows == 3){
                    break;
                }
                rows++;
                i = 0;
                pos_y += 65

                //lining up the third row
                
                pos_x += 12
            }
            let invader = new Enemy();
            invader.position_x = pos_x;
            //console.log(pos_x)

            //invader.position_y = pos_y + 145 **invaders were being drawn off the map
            invader.position_y = pos_y;
            enemies.push(invader);
            var img = images[i];
            console.log("x:" + invader.position_x + " y: " + invader.position_y)
            ctx.drawImage(img, invader.position_x, invader.position_y, 35,40);
            console.log()
            pos_x+=88;

            //invaders were being drawn off the map
            if(pos_x >= 540){
                pos_x -= 540
            }
            //ctx.drawImage(img, 25+85 * i, pos_y, 35,40);
        }
        let space_img = document.createElement("img");
        space_img.src = "../../assets/img/spaceship.png";
        space_img.id = "spacecraft";
        space_img.onload = function(){
            ctx.drawImage(space_img, 230, 400, 35, 40);
            
        }   
    });
    this.Enemies_1 = enemies;
  }

}

/* TODO:

    2. Make the invaders to shoot when randomly

*/
