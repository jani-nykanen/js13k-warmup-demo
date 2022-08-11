import { CoreEvent } from "./core.js";
import { clamp } from "./math.js";



export class Sample {


    private readonly ctx : AudioContext;
    private readonly gain : GainNode;

    private oscillator : OscillatorNode | null = null;
    private baseSequence : number[][];
    private type : OscillatorType = "square";


    constructor(ctx : AudioContext, gain : GainNode, 
        sequence : number[][], type : OscillatorType = "square") {

        this.ctx = ctx;
        this.gain = gain;

        this.baseSequence = sequence.map(s => Array.from(s));
        this.type = type;
    }


    public stop() : void {

        if (this.oscillator == null) return;

        this.oscillator.stop(0);
        this.oscillator.disconnect();
        this.oscillator = null;
    }


    public play(volume : number) : void {

        this.stop();

        let time = this.ctx.currentTime;
        let timer = 0.0;

        this.oscillator = this.ctx.createOscillator();
        this.oscillator.type = this.type;

        this.oscillator.frequency.setValueAtTime(this.baseSequence[0][0], time);
        this.gain.gain.setValueAtTime(clamp(volume, 0.01, 1.0), time);

        timer = 0;
        for (let s of this.baseSequence) {

            this.oscillator.frequency.setValueAtTime(s[0], time + timer);
            timer += 1.0/60.0 * s[1];
        }
        this.gain.gain.exponentialRampToValueAtTime(volume/2, timer);

        this.oscillator.connect(this.gain).connect(this.ctx.destination);
        this.oscillator.start(time);
        this.oscillator.stop(time + timer);
    }
}
