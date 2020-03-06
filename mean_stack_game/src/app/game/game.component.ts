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
        event.preventDefault();
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
          console.log(data.oldposx)
          console.log(data.oldposy)
          console.log(data.position)
          //this.context.clearRect(0, 0, this.gameCanvas.nativeElement.width, this.gameCanvas.nativeElement.height);
          this.context.clearRect(data.oldposx, data.oldposy, 35, 40);
          let space_img = document.createElement("img");
          space_img.src = "../../assets/img/spaceship.png";
          space_img.id = "spacecraft";
          this.context.drawImage(space_img, data.position.x, data.position.y, 35, 40)

        
          /*space_img.onload = function(){
          this.context.drawImage(space_img, 230, 400, 35, 40);
      });*/
    })
      /*this.socket.on("shoot", data =>{
        var shot = {'x': data.x, 'y': data.y-5}
        var ctx = this.context;
        var canvas = this.gameCanvas
        for (var x = 0; x < 10; x++)
        {
            setTimeout(function(){
            ctx.clearRect(0, 0, canvas.nativeElement.width, canvas.nativeElement.height);
            ctx.fillStyle ='blue'
            ctx.fillRect(shot['x'], shot['y'], 10, 10)
            shot['y'] -= 5
            ctx.fillStyle = 'black'
            ctx.fillRect(data.x, data.y, 20, 20);
            }, 2000);
        }        
    })*/

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
        this.context.clearRect(x_position,y_position, 35, 40);
        if(y_position < -50){ //THE LIMIT OF THE SCREEN
            this.context.clearRect(x_position,y_position, 35, 40);
        }else{
            y_position -= 5
            this.context.drawImage(laser,x_position,y_position,35,40);
        }
        this.move("appear"); //IT CALLS THE SERVER TO POSITION THE SPACESHIP AT THE LAST POSITION RECORDED
        //this.checkIfEnemyWasShot(x_position, y_position);
    },10)
  }

  public checkIfEnemyWasShot(x,y){
    for(let enemy in this.Enemies_1){
        if((this.Enemies_1[enemy].position_x >= x+4 && this.Enemies_1[enemy].position_x <= x-4)
            &&
           (this.Enemies_1[enemy].position_y >= y+4 && this.Enemies_1[enemy].position_y <= y-4)){
                let index = this.Enemies_1.indexOf(this.Enemies_1[enemy]);
                console.log("Enemy called at: "+index);
            }
        //console.log("X:"+this.Enemies_1[enemy].position_x+" Y:"+this.Enemies_1[enemy].position_y)
    }
  }

  public destroyEnemy(//player1, player2
  ){
    /*player.score += 10
    //if player1.score >= 500{
        winner = player1                                          
    }
    else if player2.score >=500{
        winner = player2
    }


    */
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
        case('ArrowUp'):
                return 'up';
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
            invader.position_x = 33+40 * i;
            invader.position_y = pos_y;
            enemies.push(invader);
            var img = images[i];
            ctx.drawImage(img, 25+85 * i, pos_y, 35,40);
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