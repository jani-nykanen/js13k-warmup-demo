import { convert2BitImageToRGB222, generateFont, generateFreeStyleBitmap, generateRGB222LookupTable, loadBitmap, RGB222LookupTable } from "./bitmapgen.js";
import { Bitmap, Canvas, TextAlign } from "./canvas.js";
import { CoreEvent } from "./core.js";


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


const RABBIT_PALETTE = [
    // Line 1
    RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1, 
    RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1,
    RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1,
    // Line 2
    RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1, 
    RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1,
    RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1,
    // Line 3
    RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1, 
    RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1,
    RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1, RABBIT_BLOCK1,
    // Line 4
    RABBIT_BLOCK2, RABBIT_BLOCK2, RABBIT_BLOCK2, RABBIT_BLOCK2,
    RABBIT_BLOCK2, RABBIT_BLOCK2, RABBIT_BLOCK2, RABBIT_BLOCK2,
    RABBIT_BLOCK2, RABBIT_BLOCK2, RABBIT_BLOCK2, RABBIT_BLOCK2,
];


const HINT_TEXT = "Press SPACE to play sounds.  ";


export class Game {


    private animTimer : number = 0.0;
    private backgroundTimer : number = 0.0;
    private hintPos : number = 0.0;
    private hintWidth : number;

    private bmpRabbit : Bitmap | null = null;
    private bmpBackground : Bitmap | null = null;
    private bmpFontSmall : Bitmap | null = null;
    private bmpFontBig : Bitmap | null = null;

    private loaded = false;


    constructor(event : CoreEvent) {

        this.generateBitmaps();

        this.hintWidth = HINT_TEXT.length * 8;
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


    private drawTextContent(canvas : Canvas) : void {

        const BOTTOM_TEXT = "Have fun!";
        const BOTTOM_TEXT_XOFF = -16;

        let cw = 32 + BOTTOM_TEXT_XOFF;
        let dx = canvas.width/2 - BOTTOM_TEXT.length * cw / 2;
        let dy = 0;
        let period = Math.PI*2.0 / BOTTOM_TEXT.length;

        let k : number;
        for (let i = 1; i >= 0; -- i) {

            k = 0;
            for (let j = 0; j < BOTTOM_TEXT.length; ++ j) {

                if (BOTTOM_TEXT.charAt(j) == ' ')
                    continue;

                ++ k;
                dy = Math.round(Math.sin(this.backgroundTimer + period*k) * 8);

                canvas.drawText(this.bmpFontBig, BOTTOM_TEXT.charAt(j), 
                    dx + (j + 0.5)*cw + i, 
                    canvas.height-36 + i + dy, 
                    BOTTOM_TEXT_XOFF, 0, TextAlign.Center);
            }
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
        const HINT_SPEED = 1.0;

        if (!this.loaded) return;

        this.animTimer = (this.animTimer + ANIM_SPEED*event.step) % 4.0;
        this.backgroundTimer = (this.backgroundTimer + BG_SPEED*event.step) % (Math.PI*2);
        this.hintPos = (this.hintPos + HINT_SPEED*event.step) % this.hintWidth;
    }


    public redraw(canvas : Canvas) : void {

        if (!this.loaded) {

            canvas.clear(0);
            return;
        }

        canvas.clear(170);

        this.drawBackground(canvas);
        this.drawRabbit(canvas);
        this.drawTextContent(canvas);
    }

}
