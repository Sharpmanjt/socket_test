import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import io from "socket.io-client";
import { HostListener } from '@angular/core';
import { Enemy } from '../classes/Enemy';

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
    
    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) { 
        console.log(event.key);
        var keypress = this.readKey(event.key)
        if(keypress != 'empty') this.move(keypress)
    
  }

    @ViewChild("game", {static: false})
    private gameCanvas: ElementRef;

    private context: any;
    private socket: any;

    private Enemies_1 : Enemy[] = [] //Enemies at the left screen
    private Enemies_2 : Enemy[] = [] //Enemies at the right screen

    constructor(){
    }

    public ngOnInit() {
        this.socket = io("http://localhost:3000");
        this.positionInvaders();
    }
    public ngAfterViewInit() {
      this.context = this.gameCanvas.nativeElement.getContext("2d");
      this.socket.on("position", data => {
          this.context.clearRect(0, 0, this.gameCanvas.nativeElement.width, this.gameCanvas.nativeElement.height);
          this.context.fillStyle='white';
          this.context.fillRect(data.x, data.y, 20, 20);
      });

      this.socket.on("shoot", data =>{
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
        
        
    })
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
            var img = images[i];
            ctx.drawImage(img, 25+85 * i, pos_y, 35,40);
        }
        let space_img = document.createElement("img");
        space_img.src = "../../assets/img/spacecraft.jpg";
        space_img.id = "spacecraft";
        space_img.onload = function(){
            ctx.drawImage(space_img, 230, 400, 35, 40);
        }   
    });
  }

}