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
        var keypress = this.readKey(event.key)
        if(keypress != 'empty') this.move(keypress)
    
  }

    @ViewChild("game", {static: false})
    private gameCanvas: ElementRef;
    private p1Score: Number = 0;
    private p2Score: Number = 0;
    private time: number = 180;
    private context: any;
    private socket: any;
    private winner: Player;
    private player1: Player;
    private player2: Player;
    private Enemies_1 : Enemy[] = [] //Enemies at the left screen
    private Enemies_2 : Enemy[] = [] //Enemies at the right screen

    constructor(){
    }

interval;

startTimer() {
  this.interval = setInterval(() => {
    this.time -= 1;
  },1000)
}

    public ngOnInit() {
        this.socket = io("http://localhost:3000");
        this.positionInvaders();
        this.startTimer()
    }
    public ngAfterViewInit() {
      this.context = this.gameCanvas.nativeElement.getContext("2d");
      this.socket.on("position", data => {
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

  public moveLaser(laser,x,y){
    this.context = this.gameCanvas.nativeElement.getContext("2d");
    let x_position = x
    let y_position = y
    let laserInterval = setInterval(()=>{
        console.log("Moving: "+x_position+", "+y_position);
        this.context.clearRect(x_position,y_position, 35, 40);
        if(y_position < 5){ //THE LIMIT OF THE SCREEN
            this.context.clearRect(x_position,y_position, 35, 40);
            clearInterval(laserInterval);
        }else{
            y_position -= 5
            this.context.drawImage(laser,x_position,y_position,35,40);
        }
        this.move("appear"); //IT CALLS THE SERVER TO POSITION THE SPACESHIP AT THE LAST POSITION RECORDED
        //console.log("This bullet x: "+x_position+". This bullet y:"+y_position);
        let index = this.checkIfEnemyWasShot(x_position, y_position);
        if(index != -1){
            clearInterval(laserInterval);
            this.destroyEnemy(index);
        }
        /*if(index != -1){
            let context = this.context;
            console.log("About to destroy enemy");
            this.destroyEnemy(index);
            let remove_explosion = setTimeout(()=>{
                let explosion_x = this.Enemies_1[index].position_x;
                let explosion_y = this.Enemies_1[index].position_y;
                context.clearReact(explosion_x,explosion_y,35,40);
            },2000)
            remove_explosion;
            clearInterval(laserInterval);
        }*/
    },10)
    for(let enemy in this.Enemies_1){
        let index = this.Enemies_1.indexOf(this.Enemies_1[enemy]);
        console.log(index+" : "+JSON.stringify(this.Enemies_1[enemy]));
    }
  }

  public checkIfEnemyWasShot(x,y){
    for(let enemy in this.Enemies_1){
        if((this.Enemies_1[enemy].position_x + 10 >= x && this.Enemies_1[enemy].position_x - 10 <= x)
            &&
           (this.Enemies_1[enemy].position_y >= y && this.Enemies_1[enemy].position_y - 5 <= y)){
            console.log("Enemy shot!");
            let index = this.Enemies_1.indexOf(this.Enemies_1[enemy]);
            return index-1;
           }
    }
    return -1;
  }

  public destroyEnemy(index){
    let Enemy_posX = this.Enemies_1[index].position_x;
    let Enemey_posY = this.Enemies_1[index].position_y;
       
    this.context.clearRect(Enemy_posX, Enemey_posY, 35, 40); //REMOVES ENEMY FROM CANVAS
    let explosion_img = document.createElement("img");
    explosion_img.src = "../../assets/img/explosion2.png";
    let context = this.context;
    explosion_img.onload = function(){
        context.drawImage(explosion_img, Enemy_posX+45, Enemey_posY, 35, 40); //PUTS THE EXPLOSION ENEMY ON SCREEN
    }
    let remove_explosion = setTimeout(()=>{ //SETS A TIMER FOR .5 SECONDS TO REMOVE EXPLOSION IMG
        console.log("Timer fired");
        let explosion_x = this.Enemies_1[index].position_x;
        let explosion_y = this.Enemies_1[index].position_y;
        context.clearRect(explosion_x+45,explosion_y,35,40);
        delete this.Enemies_1[index]; //REMOVES ENEMY FROM ARRAY OF ENEMIES
        for(let enemy in this.Enemies_1){
            let index = this.Enemies_1.indexOf(this.Enemies_1[enemy]);
            console.log(index+" : "+JSON.stringify(this.Enemies_1[enemy]));
        }
    },500)

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
        //case('ArrowUp'):
               // return 'up';
        case('ArrowLeft'):
                return 'left';
        case('ArrowDown'):
            return 'down';
        case 'p':
            this.socket.emit("shoot", 'x')
            break;
        default:
            return 'empty';
      }
  }

  public positionInvaders(){
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
            }
            let invader = new Enemy();
            invader.position_x = pos_x;
            invader.position_y = pos_y+145;
            enemies.push(invader);
            var img = images[i];
            ctx.drawImage(img, 25+85 * i, pos_y, 35,40);
            pos_x+=88;
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

    1. The x an y positions of the invaders are the same as the ones I get for the click event properties
    2. Find out why the for loop in checkIfEnemyWasShot() is not catching the bullet that hit some enemies.

*/

//y+145
//x+88