import { Bitmap, Canvas } from "./canvas.js";
import { CoreEvent } from "./core.js";
import { Vector2 } from "./vector.js";



export class Satellite {


    private center : Vector2;
    private timer : number;

    private readonly radarWidth : number;
    private readonly raderHeight : number;
    private readonly radarAngle : number;
    private readonly speed : number;


    constructor(cx : number, cy : number, 
        radarWidth : number, radarHeight : number, 
        radarAngle : number, speed : number,
        startTime = 0.0) {

        this.center = new Vector2(cx, cy);

        this.timer = startTime;

        this.radarWidth = radarWidth;
        this.raderHeight = radarHeight;
        this.radarAngle = radarAngle;
        this.speed = speed;
    }


    private computePosition() : Vector2 {

        let angle = this.timer * Math.PI * 2;

        let p = new Vector2(
            Math.cos(angle) * this.radarWidth / 2,
            Math.sin(angle) * this.raderHeight / 2);

        let s = Math.sin(this.radarAngle);
        let c = Math.cos(this.radarAngle);

        return new Vector2(
            this.center.x + c * p.x + s * p.y,
            this.center.y - s * p.x + c * p.y);
    }


    private drawBase(canvas : Canvas, bmp : Bitmap, row : number) : void {
        
        let p = this.computePosition();

        let dx = Math.round(p.x) - 8;
        let dy = Math.round(p.y) - 8;

        canvas.drawBitmapRegion(bmp, 96, row*16, 16, 16, dx, dy);
    }


    private isBehind = () : boolean => this.timer <= 0.5;


    public update(event : CoreEvent) : void {

        this.timer = (this.timer + this.speed * event.step) % 1.0;
    }


    public drawBack(canvas : Canvas, bmp : Bitmap, row : number) : void {

        if (!this.isBehind())
            return;

        this.drawBase(canvas, bmp, row);
    }


    public drawFront(canvas : Canvas, bmp : Bitmap, row : number) : void {

        if (this.isBehind())
            return;

        this.drawBase(canvas, bmp, row);
    }
}
