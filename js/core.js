import { Canvas } from "./canvas.js";
import { Keyboard } from "./keyboard.js";
export class CoreEvent {
    constructor(keyboard) {
        this.step = 1.0;
        this.keyboard = keyboard;
    }
}
export class Core {
    constructor(canvasWidth, canvasHeight) {
        this.timeSum = 0.0;
        this.oldTime = 0.0;
        this.updateCallback = (_) => { };
        this.redrawCallback = (_) => { };
        this.canvas = new Canvas(canvasWidth, canvasHeight);
        this.keyboard = new Keyboard();
        this.event = new CoreEvent(this.keyboard);
    }
    loop(ts) {
        const MAX_REFRESH_COUNT = 5;
        const FRAME_WAIT = 16.66667 * this.event.step;
        this.timeSum += ts - this.oldTime;
        this.timeSum = Math.min(MAX_REFRESH_COUNT * FRAME_WAIT, this.timeSum);
        this.oldTime = ts;
        let refreshCount = (this.timeSum / FRAME_WAIT) | 0;
        while ((refreshCount--) > 0) {
            this.updateCallback(this.event);
            this.keyboard.update();
            this.timeSum -= FRAME_WAIT;
        }
        this.redrawCallback(this.canvas);
        window.requestAnimationFrame(ts => this.loop(ts));
    }
    run(onstart = () => { }, updateCb = () => { }, redrawCb = () => { }) {
        this.updateCallback = updateCb;
        this.redrawCallback = redrawCb;
        onstart(this.event);
        this.loop(0);
    }
}
