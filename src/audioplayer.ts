import { CoreEvent } from "./core.js";
import { clamp } from "./math.js";


// TODO: This is from last year's project.  Might
// be good idea to rewrite some (more) parts of it,
// or at least check they work


export class AudioPlayer {


    private ctx : AudioContext;
    private oscillator : OscillatorNode | null = null;
    private gain : GainNode;

    private timer : number = 0.0;
    private soundSeq : number[][] | null = null;
    private seqVolume : number = 1.0;
    private seqType : OscillatorType = "square";
    private globalVolume : number;

    private enabled : boolean;


    constructor(globalVolume = 1.0) {

        this.ctx = new AudioContext();
        this.oscillator = null;
        this.gain = new GainNode(this.ctx);

        this.enabled = true;

        this.globalVolume = globalVolume;
    }


    public update(event : CoreEvent) : void {

        if (this.timer <= 0)
            return; 

        if ((this.timer -= event.step) <= 0) {

            this.stop();
            if (this.soundSeq != null && this.soundSeq.length > 0) {

                this.play(
                    this.soundSeq[0][0], 
                    this.seqVolume, 
                    this.soundSeq[0][1], 
                    this.seqType);

                this.soundSeq.shift();
            }
        }
        
    }


    public stop() : void {

        if (this.oscillator == null) return;

        this.oscillator.disconnect();
        this.oscillator.stop(0);
        this.oscillator = null;
    }


    public play(freq : number, vol : number, length : number, type = <OscillatorType> "square") : void {

        if (!this.enabled) return;

        if (this.timer > 0)
            this.stop();

        this.oscillator = this.ctx.createOscillator();
        this.oscillator.type = type;

        this.timer = length;

        vol *= this.globalVolume;
        this.gain.gain.setValueAtTime(clamp(vol, 0.01, 1.0), 0.0);
        this.gain.gain.exponentialRampToValueAtTime(vol/2, 1.0/60.0 * length);

        this.oscillator.connect(this.gain).connect(this.ctx.destination);
        this.oscillator.frequency.setValueAtTime(freq, 0);
        this.oscillator.start(0);
    }


    public playSequence(sequence : number[][], vol : number, 
        type = <OscillatorType>"square") : void {

        this.stop();

        this.soundSeq = sequence.map(s => Array.from(s));
        this.seqVolume = vol;

        this.play(this.soundSeq[0][0], this.seqVolume, this.soundSeq[0][1], type);
        this.soundSeq.shift();
    }


    public toggle(state : boolean) : void {

        this.enabled = state;
    }


    public setGlobalVolume(vol : number) : void {

        this.globalVolume = vol;
    }


    public isEnabled = () : boolean => this.enabled;
}
