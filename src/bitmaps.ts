import { convert2BitImageToRGB222, generateRGB222LookupTable, loadBitmap } from "./bitmapgen.js";
import { Bitmap } from "./canvas.js";


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


// Temporary
export class DefaultBitmaps {

    public rabbit : Bitmap = null;
}


export const generateDefaultBitmaps = (callback : (out : DefaultBitmaps) => void) : void => {

    const RABBIT_PATH = "assets/rabbit.png";

    let bitmaps = new DefaultBitmaps();
    let lookup = generateRGB222LookupTable();

    loadBitmap(RABBIT_PATH, (bmp : Bitmap) => {

        bitmaps.rabbit = convert2BitImageToRGB222(bmp, lookup, RABBIT_PALETTE);

        callback(bitmaps);
    });
}
