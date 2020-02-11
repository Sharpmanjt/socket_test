import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import io from "socket.io-client";
import { HostListener } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    
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

    public ngOnInit() {
        this.socket = io("http://localhost:3000");
    }
    public ngAfterViewInit() {
      this.context = this.gameCanvas.nativeElement.getContext("2d");
      this.socket.on("position", data => {
          this.context.clearRect(0, 0, this.gameCanvas.nativeElement.width, this.gameCanvas.nativeElement.height);
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

}