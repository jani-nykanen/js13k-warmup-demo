import { convert2BitImageToRGB222, generateFont, generateFreeStyleBitmap, generateRGB222LookupTable, loadBitmap, RGB222LookupTable } from "./bitmapgen.js";
import { Bitmap, Canvas, TextAlign } from "./canvas.js";
import { CoreEvent } from "./core.js";
import { KeyState } from "./keyboard.js";
import { Ramp, Sample } from "./sample.js";
import { Satellite } from "./satellite.js";


const RABBIT_BLOCK1 = [
    0,
    0b111000,
    0b111110,
    -1
];
const RABBIT_BLOCK2 = [
    0,
    0b111000,
    0b100100,
    -1
];
const BIG_ORB_BLOCK1 = [
    0,
    0b111000,
    0b100000,
    -1
];
const BIG_ORB_BLOCK2 = [
    0,
    0b010000,
    0b100000,
    -1
];
const SMALL_ORB_BLOCK1 = [
    0,
    0b101111,
    0b011011,
    -1
];

const SMALL_ORB_BLOCK2 =[
    0,
    0b000110,
    0b011011,
    -1
];

const RABBIT_PALETTE = [
    // Line 1
    RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1, 
    RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1,
    RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1,
    BIG_ORB_BLOCK1, BIG_ORB_BLOCK2,
    // Line 2
    RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1, 
    RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1,
    RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1,
    BIG_ORB_BLOCK2, BIG_ORB_BLOCK2,
    // Line 3
    RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1, 
    RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1,
    RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1,
    SMALL_ORB_BLOCK1, SMALL_ORB_BLOCK2,
    // Line 4
    RABBIT_BLOCK2, RABBIT_BLOCK2, RABBIT_BLOCK2, RABBIT_BLOCK2,
    RABBIT_BLOCK2, RABBIT_BLOCK2, RABBIT_BLOCK2, RABBIT_BLOCK2,
    RABBIT_BLOCK2, RABBIT_BLOCK2, RABBIT_BLOCK2, RABBIT_BLOCK2,
    SMALL_ORB_BLOCK2, SMALL_ORB_BLOCK2,
];


const HINT_TEXT = "Press SPACE to play sounds.  ";


export class Game {


    private animTimer : number = 0.0;
    private backgroundTimer : number = 0.0;
    private bottomTextPos : number = 0.0;
    private hintPos : number = 0.0;
    private hintWidth : number;

    private satellites : Array<Satellite>;

    private soundIndex : number = 0;
    private samples : Array<Sample>;

    private bmpRabbit : Bitmap | null = null;
    private bmpBackground : Bitmap | null = null;
    private bmpFontSmall : Bitmap | null = null;
    private bmpFontBig : Bitmap | null = null;

    private loaded = false;


    constructor(event : CoreEvent) {

        let audio = event.audio;

        this.samples = new Array<Sample> ();
        this.samples.push(
            audio.createSample([[128, 4], [144, 6], [160, 12]], 0.30, "square", Ramp.Exponential, 0.50),
            audio.createSample([[192, 6], [240, 6], [192, 6], [160, 20]], 0.70, "triangle", Ramp.Instant, 0.20),
            audio.createSample([[256, 6], [192, 8], [160, 12]], 0.30, "sawtooth", Ramp.Linear),
            audio.createSample([[256, 6], [320, 8], [224, 20]], 0.70, "sine", Ramp.Exponential, 0.10)
        )

        this.generateBitmaps();

        this.hintWidth = HINT_TEXT.length * 8;

        this.satellites = new Array<Satellite> (2);

        this.satellites[0] = new Satellite(80, 64, 96, 12, Math.PI/8, 1.0/120.0);
        this.satellites[1] = new Satellite(80, 64, 96, 12, -Math.PI/8, 1.0/120.0, 0.5);
    }


    private generateRabbitBitmap(lookup : RGB222LookupTable) : void {

        const RABBIT_PATH = "b.png";

        loadBitmap(RABBIT_PATH, (bmp : Bitmap) => {

            this.bmpRabbit = convert2BitImageToRGB222(bmp, lookup, RABBIT_PALETTE);
            this.loaded = true;
        });
    }


    private generateBackgroundBitmap() : void {

        const COLOR_TABLES = [
            [ [85, 85, 170], [170, 170, 255], [255, 255, 255] ],
            [ [85, 0, 85], [170, 85, 170], [255, 170, 255] ]
        ];

        const WIDTH = 160;
        const HEIGHT = 176;
        const TILE_WIDTH = 16;
        const TILE_HEIGHT = 16;

        this.bmpBackground = generateFreeStyleBitmap(WIDTH, HEIGHT,
            (canvas : Canvas) => {

                let colorIndex : number;
                let dx : number;
                let dy : number;

                for (let y = 0; y < HEIGHT / TILE_HEIGHT; ++ y) {

                    for (let x = 0; x < WIDTH / TILE_WIDTH; ++ x) {

                        colorIndex = Number(x % 2 == y % 2);
                        dx = x*TILE_WIDTH;
                        dy = y*TILE_HEIGHT;

                        canvas.setFillColor(...COLOR_TABLES[colorIndex][0])
                              .fillRect(dx, dy, TILE_WIDTH, TILE_HEIGHT)
                              .setFillColor(...COLOR_TABLES[colorIndex][2])
                              .fillRect(dx, dy, TILE_WIDTH-1, TILE_HEIGHT-1)
                              .setFillColor(...COLOR_TABLES[colorIndex][1])
                              .fillRect(dx+1, dy+1, TILE_WIDTH-2, TILE_HEIGHT-2);
                    }
                }
        });
    }


    private generateBitmaps() : void {

        let lookup = generateRGB222LookupTable();

        this.generateRabbitBitmap(lookup);
        this.generateBackgroundBitmap();

        this.bmpFontBig = generateFont("bold 24px Arial", 32, 32, 2, 8, 127, [255, 170, 0], true);
        this.bmpFontSmall = generateFont("12px Arial", 24, 24, 2, 8, 127);
    }


    private drawBackground(canvas : Canvas) : void {

        let bmp = this.bmpBackground as Bitmap;

        let offy = Math.abs(canvas.height - bmp.height) / 2;

        let amplitude = offy;
        let perioud = Math.PI*2 / bmp.width;

        let dy : number;

        for (let dx = 0; dx < canvas.width; ++ dx) {

            dy = Math.round(Math.sin(this.backgroundTimer + perioud*dx) * amplitude);
            canvas.drawBitmapRegion(bmp, dx, dy + offy, 1, canvas.height, dx, 0);
        }
    }


    private drawRabbit(canvas : Canvas) : void {

        const ANIM_SRC = [0, 1, 0, 2];
        const AMPLITUDE = 16;
        const SCALE_FACTOR = 64;
        const OFFSET = -8;

        let animFrame = (this.animTimer | 0);
        let sx = ANIM_SRC[animFrame] * 32;

        let dx = canvas.width/2;
        let dy = canvas.height/2 + Math.round(Math.sin(this.backgroundTimer)*AMPLITUDE) + OFFSET;

        let shadowy = canvas.height/2 + AMPLITUDE + OFFSET;
        let scale = 1.0 - Math.abs(dy - shadowy) / SCALE_FACTOR;

        canvas.setAlpha(0.33)
              .setFillColor(0)
              .fillEllipse(dx, shadowy+16, 28*scale, 10*scale);

        canvas.setAlpha()
              .drawBitmapRegion(this.bmpRabbit,
                    sx, 0, 32, 32,
                    dx - 16, dy - 16);
    }


    private drawBottomTextBase(canvas : Canvas, shiftx = 0.0) {

        const TEXT = "Have fun!";
        const BOTTOM_OFF = 48;
        const XOFF = -16;

        let cw = 32 + XOFF;
        let dx = canvas.width/2 - TEXT.length * cw / 2 + this.bottomTextPos + shiftx;
        let dy = 0;
        let period = Math.PI*2.0 / TEXT.length;
        let phaseShift = Math.PI*2 * (this.bottomTextPos / canvas.width);

        let k : number;
        for (let i = 1; i >= 0; -- i) {

            k = 0;
            for (let j = 0; j < TEXT.length; ++ j) {

                if (TEXT.charAt(j) == ' ')
                    continue;

                ++ k;
                dy = -Math.round(Math.sin(this.backgroundTimer + period*k + phaseShift) * 16);

                canvas.drawText(this.bmpFontBig, TEXT.charAt(j), 
                    Math.round(dx + j*cw) + i, 
                    canvas.height - BOTTOM_OFF + i + dy, 
                    XOFF, 0, TextAlign.Center);
            }
        }
    }


    private drawTextContent(canvas : Canvas) : void {

        for (let i = 0; i < 2; ++ i) {
            
            this.drawBottomTextBase(canvas, -i * canvas.width);
        }

        canvas.setFillColor(0, 0, 0, 0.33)
              .fillRect(0, 0, canvas.width, 14);

        for (let i = 0; i < 2; ++ i) {

            canvas.drawText(this.bmpFontSmall, HINT_TEXT, 
                canvas.width/2 - this.hintPos + this.hintWidth*i, -6, 
                -16, 0, TextAlign.Center);
        }
    }


    public update(event : CoreEvent) : void {

        const ANIM_SPEED = 1.0 / 8.0;
        const BG_SPEED = 0.05;
        const BOTTOM_TEXT_SPEED = 160.0 / 240.0; // 160 = canvas.width ...
        const HINT_SPEED = 1.0;

        if (!this.loaded) return;

        this.animTimer = (this.animTimer + ANIM_SPEED*event.step) % 4.0;
        this.backgroundTimer = (this.backgroundTimer + BG_SPEED*event.step) % (Math.PI*2);
        this.bottomTextPos = (this.bottomTextPos + BOTTOM_TEXT_SPEED*event.step) % 160;
        this.hintPos = (this.hintPos + HINT_SPEED*event.step) % this.hintWidth;

        if (event.keyboard.getActionState("select") == KeyState.Pressed) {

            event.audio.playSample(this.samples[this.soundIndex]);
            this.soundIndex = (this.soundIndex + 1) % 4;
        }

        for (let s of this.satellites) {

            s.update(event);
        }
    }


    public redraw(canvas : Canvas) : void {

        if (!this.loaded) {

            canvas.clear(0);
            return;
        }

        // canvas.clear(170);
        this.drawBackground(canvas);

        for (let i = 0; i < this.satellites.length; ++ i) {

            this.satellites[i].drawBack(canvas, this.bmpRabbit as Bitmap, i);
        }

        this.drawRabbit(canvas);

        for (let i = 0; i < this.satellites.length; ++ i) {

            this.satellites[i].drawFront(canvas, this.bmpRabbit as Bitmap, i);
        }

        this.drawTextContent(canvas);
    }

}
