import { clamp } from "./math.js";
const createCanvas = (width, height) => {
    let div = document.createElement("div");
    div.setAttribute("style", "position: absolute; top: 0; left: 0; z-index: -1;");
    let canvas = document.createElement("canvas");
    canvas.setAttribute("style", "position: absolute; top: 0; left: 0; z-index: -1;" +
        "image-rendering: optimizeSpeed;" +
        "image-rendering: pixelated;" +
        "image-rendering: -moz-crisp-edges;");
    canvas.width = width;
    canvas.height = height;
    div.appendChild(canvas);
    document.body.appendChild(div);
    let ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    return [canvas, ctx];
};
const getColorString = (r, g, b, a = 1.0) => "rgba(" +
    String(r | 0) + "," +
    String(g | 0) + "," +
    String(b | 0) + "," +
    String(clamp(a, 0.0, 1.0)) +
    ")";
export class Canvas {
    constructor(width, height) {
        this.clear = (r = 255, g = r, b = g) => this.setFillColor(r, g, b).fillRect();
        [this.canvas, this.ctx] = createCanvas(width, height);
        window.addEventListener("resize", () => this.resizeEvent(window.innerWidth, window.innerHeight));
        this.resizeEvent(window.innerWidth, window.innerHeight);
    }
    get width() {
        return this.canvas.width;
    }
    get height() {
        return this.canvas.height;
    }
    resizeEvent(width, height) {
        let m = Math.min(width / this.width, height / this.height);
        if (m >= 1.0) {
            m = Math.floor(m);
        }
        let style = this.canvas.style;
        style.width = String((m * this.width) | 0) + "px";
        style.height = String((m * this.height) | 0) + "px";
        style.left = String((width / 2 - m * this.width / 2) | 0) + "px";
        style.top = String((height / 2 - m * this.height / 2) | 0) + "px";
    }
    setFillColor(r = 255, g = r, b = g) {
        this.ctx.fillStyle = getColorString(r, g, b);
        return this;
    }
    fillRect(x = 0, y = 0, w = this.width, h = this.height) {
        this.ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
        return this;
    }
}
