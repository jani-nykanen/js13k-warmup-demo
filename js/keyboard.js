;
export class Keyboard {
    constructor() {
        this.states = new Map();
        this.prevent = new Array();
        this.actions = new Map();
        window.addEventListener("keydown", (e) => {
            this.keyEvent(true, e.code);
            if (this.prevent.includes(e.code))
                e.preventDefault();
        });
        window.addEventListener("keyup", (e) => {
            this.keyEvent(false, e.code);
            if (this.prevent.includes(e.code))
                e.preventDefault();
        });
        window.addEventListener("contextmenu", (e) => e.preventDefault());
        window.addEventListener("mousemove", (_) => window.focus());
        window.addEventListener("mousedown", (_) => window.focus());
    }
    keyEvent(down, key) {
        if (down) {
            if (this.states.get(key) === 1 /* Down */)
                return;
            this.states.set(key, 3 /* Pressed */);
            return;
        }
        if (this.states.get(key) === 0 /* Up */)
            return;
        this.states.set(key, 2 /* Released */);
    }
    update() {
        for (let k of this.states.keys()) {
            if (this.states.get(k) === 3 /* Pressed */)
                this.states.set(k, 1 /* Down */);
            else if (this.states.get(k) === 2 /* Released */)
                this.states.set(k, 0 /* Up */);
        }
    }
    addAction(name, key1, key2 = undefined) {
        this.actions.set(name, [key1, key2]);
        this.prevent.push(key1);
        if (key2 !== undefined)
            this.prevent.push(key2);
        return this;
    }
    getState(name) {
        let state = this.states.get(name);
        if (state == undefined)
            return 0 /* Up */;
        return state;
    }
    getActionState(name) {
        let a = this.actions.get(name);
        if (a === undefined)
            return 0 /* Up */;
        let state = this.getState(a[0]);
        if (state == 0 /* Up */ && a[1] !== undefined) {
            return this.getState(a[1]);
        }
        return state;
    }
}
