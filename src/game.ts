import { DefaultBitmaps, generateDefaultBitmaps } from "./bitmaps.js";
import { Canvas } from "./canvas.js";
import { CoreEvent } from "./core.js";
import { KeyState } from "./keyboard.js";
import { Vector2 } from "./vector.js";


export class Game {


    private testPos : Vector2;
    private animTimer : number = 0.0;

    private bitmaps : DefaultBitmaps;

    private loaded = false;


    constructor(event : CoreEvent) {

        this.testPos = new Vector2(80, 72);

        generateDefaultBitmaps((bitmaps : DefaultBitmaps) => {

            this.bitmaps = bitmaps;
            this.loaded = true;
        });
    }


    public update(event : CoreEvent) : void {

        const SPEED = 2.0;
        const ANIM_SPEED = 1.0 / 8.0;

        if (!this.loaded) return;

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

        this.animTimer = (this.animTimer + ANIM_SPEED*event.step) % 4.0;
    }


    public redraw(canvas : Canvas) : void {

        const ANIM_SRC = [0, 1, 0, 2];

        if (!this.loaded) {

            canvas.clear(0);
            return;
        }

        canvas.clear(170);

        let animFrame = (this.animTimer | 0);
        let sx = ANIM_SRC[animFrame] * 32;

        canvas.drawBitmapRegion(this.bitmaps.rabbit,
            sx, 0, 32, 32,
            Math.round(this.testPos.x)-16, 
            Math.round(this.testPos.y)-16);
    }

}
