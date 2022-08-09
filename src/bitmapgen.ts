import { Bitmap, Canvas } from "./canvas.js";


const TILE_WIDTH  = 8;
const TILE_HEIGHT = 8;


export type RGB222LookupTable = Array<number>;


export const generateRGB222LookupTable = () : RGB222LookupTable => {

    let out = new Array<number> (64);

    let r : number;
    let g : number;
    let b : number;

    for (let c = 0; c < 64; ++ c) {

        r = c >> 4;
        g = (c & 0b1100) >> 2;
        b = (c & 0b11);

        out[c*3]     = r * 85;
        out[c*3 + 1] = g * 85;
        out[c*3 + 2] = b * 85; 
    }
    return out;
}


const getColorIndex = (pixels : Uint8ClampedArray, start : number) : number => {

    const INDICES = [0, 1, 2, 3];

    let r = (pixels[start]     / 85) | 0;
    let g = (pixels[start + 1] / 85) | 0;
    let b = (pixels[start + 2] / 85) | 0;

    let index = ((r + g + b) / 3) | 0;

    return INDICES[index];
}


const convertChar = (data : ImageData, width : number,
    startx : number, starty : number, endx : number, endy : number,
    lookup : RGB222LookupTable, palette : Array<number>) : void => {

    let k : number;
    let p : number;
    let index : number;

    for (let y = starty; y < endy; ++ y) {

        for (let x = startx; x < endx; ++ x) {

            k = y * width + x;
            index = getColorIndex(data.data, k*4);
            p = palette[index];

            if (p < 0) {

                data.data[k*4 + 3] = 0;
            }
            else {

                data.data[k*4]     = lookup[p*3];
                data.data[k*4 + 1] = lookup[p*3 + 1];
                data.data[k*4 + 2] = lookup[p*3 + 2];
                data.data[k*4 + 3] = 255;
            }
        }
    }
}


export const convert2BitImageToRGB222 = (bmp : Bitmap, 
    lookup : RGB222LookupTable, palette : Array<number[]>) : Bitmap | null => {

    if (bmp == null) 
        return null;

    let copy = document.createElement("canvas");
    copy.width = bmp.width;
    copy.height = bmp.height;

    let ctx = copy.getContext("2d") as CanvasRenderingContext2D;
    ctx.drawImage(bmp, 0, 0);

    let data = ctx.getImageData(0, 0, bmp.width, bmp.height);

    let w = (bmp.width / TILE_WIDTH)   | 0;
    let h = (bmp.height / TILE_HEIGHT) | 0;

    for (let j = 0; j < h; ++ j) {

        for (let i = 0; i < w; ++ i) {

            convertChar(data, bmp.width,
                i*TILE_WIDTH, j*TILE_HEIGHT, 
                (i+1)*TILE_WIDTH, (j+1)*TILE_HEIGHT,
                lookup, palette[j*w + i]);
        }
    }
    ctx.putImageData(data, 0, 0);
    
    return copy;
}


export const loadBitmap = (path : string, callback : (bmp : Bitmap) => void) : Bitmap => {

    let image = new Image();
    image.onload = () => {

        callback(image);
    }
    image.src = path;

    return image;
}


export const generateFreeStyleBitmap = (width : number, height : number,
    renderFunc : (canvas : Canvas) => void) : Bitmap => {

    let canvas = new Canvas(width, height, false);

    renderFunc(canvas);

    return canvas.convertToBitmap();
}
