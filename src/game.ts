import { Canvas } from "./canvas.js";
import { CoreEvent } from "./core.js";
import { KeyState } from "./keyboard.js";
import { Vector2 } from "./vector.js";


export class Game {


    private testPos : Vector2;


    constructor(event : CoreEvent) {

        this.testPos = new Vector2(80, 72);
    }


    public update(event : CoreEvent) : void {

        const SPEED = 2.0;

        let dir = new Vector2();

        if (event.keyboard.getActionState("right") & KeyState.DownOrPressed)
            dir.x = 1;
        else if (event.keyboard.getActionState("left") & KeyState.DownOrPressed)
            dir.x = -1;

        if (event.keyboard.getActionState("up") & KeyState.DownOrPressed)
            dir.y = -1;
        else if (event.keyboard.getActionState("down") & KeyState.DownOrPressed)
            dir.y = 1;

        let len = Math.hypot(dir.x, dir.y);
        if (len > 0.0001) {

            dir.x /= len;
            dir.y /= len;
        }

        this.testPos.x += dir.x * SPEED * event.step;
        this.testPos.y += dir.y * SPEED * event.step;
    }


    public redraw(canvas : Canvas) : void {

        canvas.clear(170)
              .setFillColor(255, 0, 0)
              .fillRect(this.testPos.x-8, this.testPos.y-8, 16, 16);
    }

}
