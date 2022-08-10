import { CoreEvent } from "./core.js";
import { Sample } from "./sample.js";


// TODO: This is from last year's project.  Might
// be good idea to rewrite some (more) parts of it,
// or at least check they work


export class AudioPlayer {


    private ctx : AudioContext;
    private gain : GainNode;

    private samplePipe : Array<Sample>;

    private globalVolume : number;
    private enabled : boolean;


    constructor(globalVolume = 1.0) {

        this.ctx = new AudioContext();
        this.gain = new GainNode(this.ctx);
        this.samplePipe = new Array<Sample> ();

        this.enabled = true;

        this.globalVolume = globalVolume;
    }


    public update(event : CoreEvent) : void {

        let s : Sample;
        for (let i = 0; i < this.samplePipe.length; ++ i) {

            s = this.samplePipe[i];
            s.update(event);
            if (!s.isPlaying()) {

                this.samplePipe.splice(i, 1);
            }
        }
    }


    public createSample = (sequence : number[][], type : OscillatorType = "square") : Sample => (new Sample(this.ctx, this.gain, sequence, type));


    public playSample(s : Sample, volume = 1.0) : void {

        this.samplePipe.push(s);
        s.play(volume * this.globalVolume);
    }


    public toggle(state : boolean) : void {

        this.enabled = state;
    }


    public setGlobalVolume(vol : number) : void {

        this.globalVolume = vol;
    }


    public isEnabled = () : boolean => this.enabled;
}
