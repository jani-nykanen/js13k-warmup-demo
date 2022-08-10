import { CoreEvent } from "./core.js";
import { clamp } from "./math.js";



export class Sample {


    private readonly ctx : AudioContext;
    private readonly gain : GainNode;

    private oscillator : OscillatorNode | null = null;
    private baseSequence : number[][];
    private type : OscillatorType = "square";

    private timer : number = 0.0;
    private sequenceCopy : number[][] | null = null;
    private volume : number = 1.0;


    constructor(ctx : AudioContext, gain : GainNode, 
        sequence : number[][], type : OscillatorType = "square") {

        this.ctx = ctx;
        this.gain = gain;

        this.baseSequence = sequence.map(s => Array.from(s));
        this.type = type;
    }

    
    // TODO: Do not create new oscillator for each "note", but reuse
    // the old one?
    private playBlock(freq : number, volume : number, length : number) : void {

        if (this.timer > 0)
            this.stop();

        this.oscillator = this.ctx.createOscillator();
        this.oscillator.type = this.type;

        this.timer = length;

        this.gain.gain.setValueAtTime(clamp(volume, 0.01, 1.0), 0.0);
        this.gain.gain.exponentialRampToValueAtTime(volume/2, 1.0/60.0 * length);

        this.oscillator.connect(this.gain).connect(this.ctx.destination);
        this.oscillator.frequency.setValueAtTime(freq, 0);
        this.oscillator.start(0);
    }


    public stop() : void {

        if (this.oscillator == null) return;

        this.oscillator.disconnect();
        this.oscillator.stop(0);
        this.oscillator = null;
    }

    
    public play(volume : number) : void {

        this.stop();
        this.timer = 0;

        // This line makes Closure give a warning, but remove
        // it and vscode will give some red line!
        if (this.sequenceCopy != null)
            this.sequenceCopy.length = 0;

        this.sequenceCopy = this.baseSequence.map(s => Array.from(s));
        this.volume = volume;

        this.playBlock(this.sequenceCopy[0][0], this.volume, this.sequenceCopy[0][1]);
        this.sequenceCopy.shift();
    }


    public update(event : CoreEvent) : void {

        if (this.timer <= 0)
            return; 

        if ((this.timer -= event.step) <= 0) {

            this.stop();
            if (this.sequenceCopy != null && this.sequenceCopy.length > 0) {

                this.playBlock(
                    this.sequenceCopy[0][0], 
                    this.volume, 
                    this.sequenceCopy[0][1]);

                this.sequenceCopy.shift();
            }
        }
    }


    public isPlaying = () : boolean => this.timer > 0;
}
