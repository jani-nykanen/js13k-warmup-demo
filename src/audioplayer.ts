import { CoreEvent } from "./core.js";
import { Sample } from "./sample.js";


export class AudioPlayer {


    private ctx : AudioContext;
    private gain : GainNode;

    private globalVolume : number;
    private enabled : boolean;


    constructor(globalVolume = 1.0) {

        this.ctx = new AudioContext();
        this.gain = new GainNode(this.ctx);

        this.enabled = true;

        this.globalVolume = globalVolume;
    }


    public createSample = (sequence : number[][], type : OscillatorType = "square") : Sample => (new Sample(this.ctx, this.gain, sequence, type));


    public playSample(s : Sample, volume = 1.0) : void {

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
