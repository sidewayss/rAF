import {Is} from "./globals.js";
import {Ez} from "./ez.js";

import {PBase} from "./prop/pbase.js";

// ACues: a barebones cue list
export class ACues {
    #cues; #elms; #i; #last; #now; #peri; #post; #pre; #prop; #validate; #zero;
//  ============================================================================
    constructor(callback, obj, validate = true) {
        this.peri     = callback;  // use the setters to validate (or not)
        this.validate = validate;  // for set cues() and set elms()
        if (Is.Arrayish(obj))
            this.cues = Ez.toArray(obj, "cues", this.#validate, ...Ez.okEmptyUndef);
        else if (Is.def(obj)) {
            this.cues = obj.cues;     this.pre  = obj.pre;
            this.prop = obj.prop;     this.post = obj.post;
            this.elms = obj.elms ?? obj.elm;
        }
        else
            this.#cues = [];

        Ez.is(this);
    //%%Object.seal(this);
    }
//==============================================================================
    get validate()  { return Is.def(this.#validate); }
    set validate(b) { this.#validate = b ? this.#validCue : undefined; }

    get prop()    { return this.#prop; }
    set prop(val) { this.#prop = PBase._validate(val, "prop"); }

    get elms()    { return this.elms.slice(); }
    set elms(val) {
        if (Is.def(val) && this.#validate)
            val = Ez.toElements(val);
        this.#elms = val;
    }

// this.cues is an array of cue objects
    get cues()    { return this.#cues; } // returns the source, not a copy
    set cues(val) {
        val = Ez.toArray(val, "cues", this.#validate, ...Ez.okEmptyUndef);
        if (Ez._mustAscendErr(val, "cues", false)) {
            cues.sort((a, b) => a.wait - b.wait);
            console.log("Your cues had to be sorted.");
        }
        this.#cues = val;
        this.#last = val.length - 1;
    }
    #validCue(cue) {
        Ez._validObj(cue, "cue");
        cue.wait = Ez.toNumber(cue.wait ?? cue.time, "cue.wait|time",
                               ...Ez.defNotNeg);
        if (this.#peri === this.default) {
            const so = "defined for default callback";
            if (!Is.def(value))
                Ez._mustBeErr("cue.value", so);

            const elms = cue.elms ?? cue.elm;
            if (Is.def(elms))
                cue.elms = Ez.toElements(elms); //!!not the best error msg here!!
            else if (!this.#elms)
                Ez._mustBeErr("cue.elms|elm or this.elms", so)
            cue.prop = PBase._validate(cue.prop, "cue.prop", !this.#prop);
        }
        return cue;
    }
    newCue(wait, value, elms, prop) {
        return this.#insertCue({wait, value, elms, prop});
    }
    addCue(cue) {
        return this.#insertCue(cue);
    }
    #insertCue(cue) {
        if (this.#validate)
            cue = this.#validate(cue);

        const w = cue.wait;
        const a = this.#cues[0].wait;
        const z = this.#cues.at(-1).wait;
        if (w > z)
            this.#cues.push(cue);
        if (w < a)
            this.#cues.unshift(cue);
        else {
            const findNext = (c) => { return w <= c.wait; };
            const i = w > ((z - a) / 2)
                    ? this.#cues.findLastIndex(findNext)
                    : this.#cues.findIndex    (findNext);
            if (w == this.#cues[i].wait)
                Ez._mustBeErr("cue.wait|time", "a unique value. No duplicates.");
            this.#cues.splice(i - 1, 0, cue);
        }
    }
//  splice(), push(), unshift(), insert() if you want to manage array sorting
    splice(start, deleteCount) {
        let cues = Array.prototype.slice.call(arguments, 2);
        if (this.#validate)
            cues = cues.map(cue =>this.#validate(cue));

        return this.#cues.splice(start, deleteCount, ...cues);
    }
    push   (cue)        { return this.#pushift( 0, cue); }
    unshift(cue)        { return this.#pushift(-1, cue); }
    insert (start, cue) { return this.splice(start, 0, cue); }

//  #pushift() helps push() and unshift()
    #pushift(start, cue) {
        if (this.#validate)
            cue = this.#validate(cue);
        switch (start) {
            case  0: this.#cues.push   (cue); break;
            case -1: this.#cues.unshift(cue); break;
            default: this.#cues.splice (start, 0, cue);
        }
        return cue;
    }
//==============================================================================
// this.pre  is optional, it runs prior to first call to requestAnimationFrame()
// this.post is optional, it runs after the last cue has played
// this.peri is required, it runs once per cue, it defaults to ACues.default
    get pre () { return this.#pre;  }
    get post() { return this.#post; }
    get peri() { return this.#peri; }
    set pre (val) { this.#pre  = Ez._validFunc(val, "cue.pre"); }
    set post(val) { this.#post = Ez._validFunc(val, "cue.post"); }
    set peri(val) { this.#peri = Is.def(val)
                               ? Ez._validFunc(val, "cue.peri|callback", true)
                               : this.default; }

// this.callback is an alias for this.peri
    get callback()    { return this.peri; }
    set callback(val) { this.peri = val;  }

//  default() is the default peri (aka callback) function
    default(cue) {
        try {  //++adding let/net: better to preset plugs, as with Easer
            for (const elm of cue.elms ?? this.#elms)
                (cue.prop ?? this.#prop).setIt(elm, cue.value);
        } catch (err) {
            throw new Error(`default(cue): cue = ${cue}, `
                           + `this.elms = ${this.#elms}, `
                           + `this.prop = ${this.#prop}\n${err}`);
        }
    }
//==============================================================================
// "Protected" helpers for AFrame. They all match methods in Easies and/or Easy.
//  _next(): AFrame.prototype.#animate() calls it every frame. Why adjust "now"
    _next(now) { // here? Tt's simplest, drawbacks everywhere are equally bad.
        const cues = this.#cues;    // assign to consts and -= for readability
        const i    = this.#i;
        now -= this.#zero;
        while (now >= cues[i].wait)
           this.#peri(cues[i++]);

        this.#now = now;
        this.#i   = i;
        return (i == this.#last);   // return true = finished
    }
//  _zeroOut() helps AFrame.proto.play() zero out before first call to _next()
    _zeroOut(now) {
        this.#zero = now;
        this.#now  = 0;
        this.#i    = 0;
    }
//  _resume() helps AFrame.prototype.play() reset #zero before resuming playback
    _resume(now) { // #now stays the same, that's the whole idea of pausing
        this.#zero = now - this.#now;
    }
//  _runPost() helps AFrame.prototype.#stop() run .post() for unfinished ACues
    _runPost() {
        if (!sts && this.#i < this.#last) // E.arrived only
            this._next(Infinity);         //!!include more statuses?? E.empty always excluded
        this.#post?.(this);
    }
}