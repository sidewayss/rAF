//!!rename #targets to #active and #backup to #targets to mimic class Easies!!
import {E, Ez, Is, Easies, ACues} from "./raf.js";

// AFrame: the animation frame manager
export class AFrame {
    #backup; #callback; #callFirst; #fps; #frame; #frameZero; #gpu; #keepPost;
    #initZero; #now; #oneShot; #peri; #post; #promise; #status; #syncZero;
    #targets; #useNow; #wait; #zero;
//==============================================================================
    constructor(arg) {    // arg is int, bool, arrayish, object, or undefined
        this.#status    = E.empty;
        this.#callback  = this.#animate; // overwritten by this.useNow below
        this.#frameZero = true;          // ditto this.frameZero and else if

        if (arg?.isEasies || arg?.isACues)
            this.targets = arg;
        else if (Is.Arrayish(arg))
            this.targets = Ez.toArray(arg, "new AFrame(targets)",
                                      AFrame.#validTarget, false);
        else if (Ez._validObj(arg))
            for (const p of ["peri","post","keepPost","oneShot","useNow",
                             "targets","frameZero","initZero","syncZero"])
                this[p] = arg[p];
        else {
            this.#targets = new Set;
            this.#backup  = new Set;
            if (arg === true || arg === false)
                this.#frameZero = arg;  //!!iffy choice of property, oneShot, initZero instead??
            else if (Is.def(arg))
                Ez._mustBeErr("new AFrame(arg): arg",
                              "a boolean, array-ish, a valid object with "
                            + "properties, or undefined.");
        }
        Object.seal(this);
    }
//==============================================================================
    get zero()    { return this.#zero; }
    get now()     { return this.#now;  }
    get elapsed() { return this.#now - this.#zero; }
//==============================================================================
//  Two types of target: Easies and ACues
    get targets()    { return Array.from(this.#targets); }
    set targets(val) {
        // How often is val.length > 2? It's easier to convert to Array, then
        // to Set, even if it's originally a Set, especially for validation.
        if (val?.isEasies || val?.isACues)
            val = [val];
        else
            val = Ez.toArray(val, "targets", AFrame.#validTarget, false);

        if (!val.length)
            this.clearTargets(); // sets #status = E.empty
        else {
            this.#targets = new Set(val);
            this.#backup  = new Set(this.#targets);
            if (this.isEmpty)
                this.#status = E.original;
        }
    }
//  newEasies() and newCues() create a target instance and add it to #targets
    newEasies(...args) { return this.#newTarget(Easies, ...args); }
    newCues  (...args) { return this.#newTarget(ACues,  ...args); }
    #newTarget(cls, args) {
        const t = new cls(...args);
        this.addTarget(t);
        return t;
    }
    addTarget(val) {
        val = AFrame.#validTarget(val);
        this.#targets.add(val);
        this.#backup .add(val);
        if (this.isEmpty)
            this.#status = E.original;
    }
//  cutTarget() return value emulates Set
    cutTarget(val) {
        if (!this.#backup.has(val))
            return false;
        //-------------------------
        if (this.#backup.size == 1)
            this.clearTargets();
        else {
            this.#targets.delete(val);
            this.#backup .delete(val);
        }
        return true;
    }
    clearTargets() {
        this.#targets.clear();
        this.#backup .clear();
        this.#status = E.empty;
    }
    static #validTarget(t) {
        if (!t?.isEasies && !t?.isACues) //!!should this just warn??toArray() would need change...
            Ez._mustBeErr("targets", "a collection of Easies and/or ACues");
        return t;
    }
//==============================================================================
// this.oneShot causes #stop() to clear targets on arrival
    get oneShot()  { return this.#oneShot; }
    set oneShot(b) { this.#oneShot = Boolean(b); }

    get useNow()  { return this.#useNow; }
    set useNow(b) {
        this.#useNow   = Boolean(b);
        this.#callback = b ? this.#animateNow : this.#animate;
    }

    get frameZero()  { return this.#frameZero }
    set frameZero(b) { this.#frameZero = Boolean(b); }

    get initZero()  { return this.#initZero; }
    set initZero(b) { this.#initZero = Boolean(b); }

// this.syncZero is optional, run by #animateZero(), only if #frameZero == true
    get syncZero()    { return this.#syncZero; }
    set syncZero(val) { this.#syncZero = Ez._validFunc(val, ".syncZero"); }

// this.peri is optional, runs once per frame, helps throttle events
    get peri()    { return this.#peri; }
    set peri(val) { this.#peri = Ez._validFunc(val, ".peri"); }
// this.post is optional, runs just before the animation callback loop exits
    get post()    { return this.#post; }
    set post(val) { this.#post = Ez._validFunc(val, ".post"); }
// this.keepPost indicates whether to keep or delete this.#post after playing it
    get keepPost()    { return this.#keepPost; }
    set keepPost(val) { this.#keepPost = Boolean(val); }

// this.fps
    get fps()    { return this.#fps; }
// this.gpu
    get gpu()    { return this.#gpu; }
//==============================================================================
//  play() initiates the #animate() callback loop
    play(wait) {
        if (!this.isPlaying) {          // if it's already playing, ignore it
            this.#promise = Ez.promise();
            if (!this.#targets.size)    // nothing to animate
                this.#promise.resolve(E.empty);
            else {
                wait = Is.def(wait) ? Number(wait) : 0;
                if (Number.isNaN(wait))
                    Ez._mustBeErr("AFrame.prototype.play(wait): wait argument",
                                  "a number or undefined");
                //-----------------------------
                const isPlaying = !this.isPausing;
                let t,
                now  = performance.now(),
                zero = this.#useNow ? now : document.timeline.currentTime;
                zero += wait;
                if (isPlaying) {           // starting from zero
                    for (t of this.#targets)
                        t.pre?.(t);
                    if (wait || !this.#frameZero)
                        this.#setZero(zero);
                }
                else {                  // resuming from pause
                    this.#zero = this.#zero + zero - this.#now;
                    this.#now  = zero;
                    for (t of this.#targets)
                        t._resume(zero);
                }
                this.#wait      = wait + now;
                this.#status    = E.playing;
                this.#callFirst = isPlaying && this.#frameZero
                                ? this.#animateZero
                                : this.#callback;
                this.#frame = requestAnimationFrame(t =>
                    wait ? this.#delay(t) : this.#callFirst(t)
                );
            }
        }
        return this.#promise;
    }
//  #delay() is the callback for play(wait > 0), delays the start of animation
    #delay(timeStamp) {
        if (performance.now() < this.#wait)
            this.#frame = requestAnimationFrame(t => this.#delay(t));
        else
            this.#callFirst(timeStamp); // #callback() or #animateZero
    }
//  #animate() is the base requestAnimationFrame() #callback
    #animate(timeStamp) {
        this.#now = timeStamp;           // set it first so callbacks can use it
        for (const t of this.#targets) { // execute this frame
            if (!t._next(timeStamp)) {   // 0 = arrived, finished
                t.post?.(t);             // ACues or Easies.proto.post()
                this.#targets.delete(t);
            }
        }
        if (this.#peri?.(this, timeStamp) || this.#targets.size)
            this.#frame = requestAnimationFrame(t => this.#callback(t));
        else
            this.#stop(E.arrived, true);
    }
//  #animateNow() is the animation #callback that uses performance.now()
    #animateNow() { this.#animate(performance.now()); }

//  #animateZero() is the callback for one frame only
    #animateZero(timeStamp) {
        if (this.#useNow)
            timeStamp = performance.now();
        this.#setZero (timeStamp);
        this.#callback(timeStamp);    // timeStamp is always less than now
    }
//  #setZero() helps play() and #animateZero()
    #setZero(now) {
        this.#zero = now;
        this.#now  = now;
        for (const t of this.#targets) {
            t._zero(now);
            if (this.#initZero)
                t.init?.();     // ACues doesn't have init(), Easies does
        }
        this.#syncZero?.(now);
    }
//==============================================================================
//  status-related properties and methods:
    get status()     { return this.#status; }
    get atOrigin()   { return this.#status == E.original; }
    get atInitial()  { return this.#status == E.initial;  }
    get hasArrived() { return this.#status == E.arrived;  }
    get isPausing()  { return this.#status == E.pausing;  }
    get isPlaying()  { return this.#status == E.playing;  }
    get isEmpty()    { return this.#status == E.empty;    }

//  reset methods call #stop() with different statuses
    arrive(isArriving) { return this.#stop(E.arrived,  isArriving, true); }
    init  (isArriving) { return this.#stop(E.initial,  isArriving, true); }
    stop  (isArriving) { return this.#stop(E.original, isArriving, true); }
    pause ()           { return this.#stop(E.pausing); }
    cancel()           { return this.#stop(); }

//  #stop() stops the animation and leaves it in the requested state
//          isArriving does #post() and #oneShot
//          runReset runs #reset(sts, runReset)
    #stop(sts, isArriving, runReset) {
        let ez, t;
        const                     // #targets is (partially) spent
        easieses   = Array.from(this.#backup).filter(v => v.isEasies),
        wasPlaying = this.isPlaying,
        notCancel   = Is.def(sts);
        if (wasPlaying && !isArriving)
            cancelAnimationFrame(this.#frame);

        if (isArriving && !sts && (wasPlaying || this.isPausing)) {
            const post = this.#post;    // this.#post can be set in post()
            if (post) {
                if (!this.#keepPost)    // and it defaults to single-use.
                    this.#post = undefined;
                post(this);             // run it
            }
        }
        if (notCancel) {                // requires targets intact
            this.#status = sts;
            if (runReset)               // _reset() cascades down to [M]Easer
                for (t of easieses)
                    t._reset(sts);
        }
        if (isArriving) {               // evaluate #oneShot
            for (t of easieses) {       // cascade bottom-up, clearing targets
                for (ez of t.easies)
                    if (ez.oneShot)
                        ez.clearTargets();
                if (t.oneShot)
                    t.clearTargets();
            }
        }
        if (isArriving && this.#oneShot)
            this.clearTargets();        // sets #status = E.empty
        else if (notCancel)
            this.#targets = new Set(this.#backup);

        if (wasPlaying)
            this.#promise.resolve(this.#status);
        return this.#status;
    }
//==============================================================================
//  fpsBaseline() runs rAF() with no animation and returns average fps + times
    fpsBaseline(size, max, diff) {
        const
        args = ["sampleSize","maxFrames","maxDiff"],
        name = `fpsBaseline(${args.join(", ")})`;
        if (this.isPlaying)
            Ez._cantErr("You", `run ${name} during animation playback`);
        //----------------------------------------------------------------------
        size = Math.max(1,        Ez.toNumber(size, `${name}: ${args[0]}`,  3));
        max  = Math.max(1 + size, Ez.toNumber(max,  `${name}: ${args[1]}`, 10));
        diff = Math.max(0,        Ez.toNumber(diff, `${name}: ${args[2]}`,  0.1));

        this.#fps = {size, max, diff,
                     times:[], intervals:[], diffs:[],
                     status:this.#status};

        this.#status  = E.playing;
        this.#frame   = requestAnimationFrame(t => this.#fpsAnimate(t));
        this.#promise = Ez.promise();
        return this.#promise;
    }
//  #fpsAnimate() is the rAF callback for fpsBaseline(). It waits until the
//                average rate variance is below the fps.diff threshold, along
//                with sample size and max frames settings.
    #fpsAnimate(timeStamp) {
        let diff, isDone, lt, lv, sample;
        const
        fps   = this.#fps,
        size  = fps.size,
        times = fps.times,
        vals  = fps.intervals,
        diffs = fps.diffs;

        lt = times.length;
        if (lt++) {         // don't run when .length == 0
            lv = vals.push(timeStamp - times.at(-1));
            if (lv >= size) {
                sample = vals.slice(lv - size, lv);
                diff   = Math.max(...sample.slice(1)
                                           .map(v => Math.abs(v - sample[0])));
                isDone = diff <= fps.diff;
                if (!isDone)
                    diffs.push(diff);
            }
        }
        times.push(timeStamp);

        if (isDone || lt >= fps.max) {
            if (!isDone) {
                diff    = Math.min(...diffs);
                const i = diffs.indexOf(diff);
                sample  = vals.slice(i, i + size);
            }
            const avg  = sample.reduce((sum, v) => sum + v, 0) / size;
            const vars = sample.slice(1).map(v => v - sample[0]);
            Ez.readOnly(fps, "diff",   diff);   // overwrite user-supplied value
            Ez.readOnly(fps, "sample", sample);
            Ez.readOnly(fps, "msecs",  avg);
            Ez.readOnly(fps, "value",  1000 / avg);
            Ez.readOnly(fps, "range",  Math.max(...vars) - Math.min(...vars, 0));
            this.#status = fps.status;
            this.#promise.resolve(fps);
        }
        else
            this.#frame = requestAnimationFrame(t => this.#fpsAnimate(t));
    }
//  ============================================================================
//  gpuTest() is an alternative to start(), used to determine local GPU power.
//  It runs the animates the current targets and calculates average fps.
//  #gpu.value is a boolean = pass/fail: fps >= min. The "skip" arg skips frames
//  prior to collecting data, because the time between the first two frames are
//  rarely reprentative of the device's frame rate.
    gpuTest(min, skip, peri) { // they're used via arguments global array
        const
        args = ["min","skip","peri"],
        name = `gpuTest(${args.join(", ")})`;
        if (this.isPlaying)
            Ez._cantErr("You", `run ${name} during animation playback`);
        //------------------
        if (!this.isEmpty) {
            this.clearTargets();
            console.warn(`${name} cleared targets, status: ${this.#status}`);
        }
        min  = Ez.toNumber  (min , `${name}: ${args[0]}`, 0, ...Ez.intNotNeg);
        skip = Ez.toNumber  (skip, `${name}: ${args[1]}`, 3, ...Ez.intNotNeg);
        peri = Ez._validFunc(peri, `${name}: ${args[2]}`);

        this.#gpu = { min, skip, peri, times:[] };
        this.peri = AFrame.#gpuPeri;
        this.post = AFrame.#gpuPost;
        this.#status  = E.playing;
        this.#promise = Ez.promise();
        this.#skipFrames();
        return this.#promise;
    }
//  #skipFrames() skips this.#skip frames prior to playing the test animation.
//                At least the first frame interval must be ignored when
//                calculating frames per second.
    #skipFrames() {
        this.#frame = requestAnimationFrame(t => this.#gpu.skip--
                                               ? this.#skipFrames()
                                               : this.#animateZero(t));
    }
//  static #gpuPeri() caches timestamps and runs #gpu.peri(), #gpu is extensible
    static #gpuPeri(aframe, t) {
        aframe.#gpu.times.push(t);
        aframe.#gpu.peri?.(aframe, aframe.#gpu, t);
    }

//  #gpuPost() sets .fps (frames per second) and .value (pass/fail fps >= min),
    static #gpuPost(aframe) {       // then it cleans up and resolves the promise.
        const gpu = aframe.#gpu;
        Ez.readOnly(gpu, "fps",   gpu.times.length / (aframe.elapsed / 1000));
        Ez.readOnly(gpu, "value", gpu.fps >= gpu.min);
        aframe.clearTargets();
    //!! .then(arg): arg is always the number 9, regardless of setting here
    //!! workaround: use AFrame.prototype.gpu property to get gpu
        aframe.#promise.resolve(gpu);
    }
//  ============================================================================
//  fpsRound() rounds a value to the nearest commonly-used hardware refresh rate
    static fpsRound(val) {
        val = Ez.toNumber(val, "fpsRound", ...Ez.defNotNeg);
        const ranges = [         // [max, fps], above 165fps round to nearest 10
            [ 50, Math.round(val)],          // below  50fps just round
            [ 69,  60], [ 83,  75], [ 87,  85], [ 95,  90],
            [105, 100], [132, 120], [157, 144], [162, 160], [168, 165],
            [Infinity, Math.round(val / 10) * 10]
        ];
        for (let [max, fps] of ranges)
            if (val < max)
                return fps;
    }
}