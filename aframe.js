import {E, Ez, Is, Easy, Easies, ACues} from "./raf.js";

// AFrame: the animation frame manager
export class AFrame {
    #backup; #callback; #fps; #frame; #gpu; #keepPost; #now; #onArrival; #peri;
    #post; #promise; #syncZero; #targets; #useNow; #zero;
    #status    = E.empty;
    #frameZero = true;   // Unfortunately, this is the best default (for now...)
//==============================================================================
    constructor(arg) {   // arg is int, bool, arrayish, object, or undefined
        this.#callback = this.#animate; // overwritten by this.useNow setter
        if (arg?.isEasies || arg?.isACues)
            this.targets = arg;
        else if (Is.Arrayish(arg))
            this.targets = Ez.toArray(arg, "new AFrame(targets)", AFrame.#validTarget, false);
        else if (Ez._validObj(arg)) {
            this.peri    = arg.peri;       this.onArrival = arg.onArrival;
            this.post    = arg.post;       this.keepPost  = arg.keepPost;
            this.useNow  = arg.useNow;     this.frameZero = arg.frameZero;
            this.targets = arg.targets;    this.syncZero  = arg.syncZero;
        }
        else {
            this.#targets = new Set;
            this.#backup  = new Set;
            if (Easy._validArrival(arg, undefined, true) !== false)
                this.#onArrival = arg;  // legit int status or undefined
            else if (arg === true || arg === false)
                this.#frameZero = arg;
            else
                Ez._mustBeErr("new AFrame(arg): arg",
                              "a valid onArrival status, a boolean, array-ish, "
                            + "a valid object with properties, or undefined.");
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
            val = new Set(val);
            this.#targets = val;
            this.#backup  = new Set(val);
            if (this.isEmpty)
                this.#status = E.original;
        }
    }
//  newEasies() and newCues() create a target instance and add it to #targets
    newEasies() { return this.#newTarget(Easies, arguments); }
    newCues()   { return this.#newTarget(ACues,  arguments); }
    #newTarget(cls, args) {
        const t = new cls(...args);
        this.#targets.add(t);
        this.#backup .add(t);
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
        if (this.isRunning)
            this.#cancel(E.empty);
        else
            this.#status = E.empty;
    }
    static #validTarget(t) {
        if (!t?.isEasies && !t?.isACues) //!!should this just warn??toArray() would need change...
            Ez._mustBeErr("targets", "a collection of Easies and/or ACues");
        return t;
    }
//==============================================================================
    get useNow()  { return this.#useNow; }
    set useNow(b) {
        this.#useNow   = Boolean(b);
        this.#callback = b ? this.#animateNow : this.#animate;
    }

    get frameZero()  { return this.#frameZero}
    set frameZero(b) { this.#frameZero = Boolean(b); }

// this.onArrival
    get onArrival()    { return this.#onArrival; }
    set onArrival(sts) { this.#onArrival = Easy._validArrival(sts, "AFrame"); }

// this.oneShot
    get oneShot()  { return this.#onArrival == E.empty; }
    set oneShot(b) { // if (!b && this.#onArrival != E.empty)
        if (b)       //     it's already "off", leave #onArrival alone;
            this.#onArrival = E.empty;
        else if (this.#onArrival == E.empty)
            this.#onArrival = undefined;
    }
// this.syncZero is optional, run by #animateZero(), only if #frameZero == true
    get syncZero()    { return this.#syncZero; }
    set syncZero(val) { this.#syncZero = Ez._validFunc(val, ".syncZero"); }
// this.peri is optional, runs once per frame, helps throttle events
    get peri()    { return this.#peri; }
    set peri(val) { this.#peri = Ez._validFunc(val, ".peri"); }
// this.post is optional, runs just before the animation callback loop exits
    get post()    { return this.#post; }
    set post(val) { this.#post = Ez._validFunc(val, ".post"); }
// this.keepPost indicates whether to keep or delete this.#post after running it
    get keepPost()    { return this.#keepPost; }
    set keepPost(val) { this.#keepPost = Boolean(val); }
// this.fps
    get fps()    { return this.#fps; }
// this.gpu
    get gpu()    { return this.#gpu; }

//  status-related properties and methods are read-only:
    get status()    { return this.#status; }
    get atOrigin()  { return this.#status == E.original; }
    get atStart()   { return this.#status == E.initial;  }
    get atEnd()     { return this.#status == E.arrived;  }
    get isPausing() { return this.#status == E.pausing;  }
    get isRunning() { return this.#status == E.running;  }
    get isEmpty()   { return this.#status == E.empty;    }
    get isInit()    { return this.#status == E.initial;  }
    get isInitialized() { return this.#status == E.initial;  }
    get hasArrived()    { return this.#status == E.arrived;  }
//==============================================================================
//  play() initiates the #animate() callback loop
    play() {
        if (!this.isRunning) {          // if it's already running, ignore it
            this.#promise = Ez.promise();
            if (!this.#targets.size)    // nothing to animate
                this.#promise.resolve(E.empty);
            else {
                let t;
                const now = this.#useNow ? performance.now()
                                         : document.timeline.currentTime;
                const isResuming = this.isPausing;
                if (isResuming)
                    for (t of this.#targets)
                        t._resume(now);
                else if (this.#frameZero)
                    for (t of this.#targets)
                        t.pre?.(t);
                else {
                    for (t of this.#targets) {
                        t._zero(now);
                        t.pre?.(t);
                    }
                }
                this.#status = E.running;
                if (this.#frameZero && !isResuming)
                    this.#frame = requestAnimationFrame(t => this.#animateZero(t));
                else {
                    this.#zero  = isResuming ? this.#zero + now - this.#now : now;
                    this.#now   = now;
                    this.#frame = requestAnimationFrame(t => this.#callback(t));
                }
            }
        }
        return this.#promise;
    }
//  #animate() is the requestAnimationFrame() callback
    #animate(timeStamp) {
        this.#now = timeStamp;           // set it first so callbacks can use it
        for (const t of this.#targets) { // execute this frame
            if (t._next(timeStamp)) {    // true = arrived, finished
                t.post?.(t);
                this.#targets.delete(t);
            }
        }
        if (this.#peri?.(this, timeStamp) || this.#targets.size)
            this.#frame = requestAnimationFrame(t => this.#callback(t));
        else
            this.#cancel(this.#onArrival, true, true);
    }
//  #animateNow() is the animation callback that uses performance.now()
    #animateNow() { this.#animate(performance.now()); }

//  #animateZero() is for one frame only
    #animateZero(timeStamp) {
        this.#zero = timeStamp;
        this.#now  = timeStamp;
        if (this.#useNow)
            timeStamp = performance.now();
        for (const t of this.#targets)
            t._zero(timeStamp);
        this.#syncZero?.(timeStamp);  // not an exact sync unless #useNow
        this.#callback(timeStamp);    // timeStamp is always less than now
    }
//  pause() arrive() init() stop() all cancel, then set different states
//  clearTargets() is the way to set E.empty and call #cancel() if running
    pause (forceIt) { return this.#cancel(E.pausing,  forceIt); }
    arrive(forceIt) { return this.#cancel(E.arrived,  forceIt); }
    init  (forceIt) { return this.#cancel(E.initial,  forceIt); }
    stop  (forceIt) { return this.#cancel(E.original, forceIt); }

//  #cancel helps pause(), stop(), arrive(), init(), clearTargets(), #animate()
    #cancel(sts, forceIt, hasArrived) {
        const wasRunning = hasArrived ?? this.isRunning;

        if (wasRunning && !hasArrived)
            cancelAnimationFrame(this.#frame);
        else if (!forceIt && sts == this.#status)
            return this.#status;
        //---------------------
        if (sts != E.pausing) {
            let t;
            const wasPausing = this.isPausing;
            const isArriving = hasArrived ?? !sts;

            if (wasRunning || wasPausing) {
                if (isArriving && !hasArrived)
                    for (t of this.#targets)  // remaining targets, not #backup
                        t._runPost();
                if (isArriving && this.#post) {
                    const post = this.#post;  // this.#post can be set in post()
                    if (!this.#keepPost)      // and it defaults to single-use.
                        this.#post = undefined;
                    post(this);
                }
            }
            if (Is.def(sts)) {
                for (t of this.#backup)
                    t._reset(sts);
            }
            if (sts != E.empty)
                this.#targets = new Set(this.#backup);
        }
        this.#status = sts ?? E.arrived;
        if (wasRunning)                       // .then() won't execute otherwise
            this.#promise.resolve(this.#status);
        return this.#status;
    }
//==============================================================================
//  fpsBaseline() runs rAF() with no animation and returns average fps + times
    fpsBaseline(size, max, diff) {
        const args = ["sampleSize","maxFrames","maxDiff"];
        const name = `fpsBaseline(${args.join(", ")})`;
        if (this.isRunning)
            Ez._cantErr("You", `run ${name} during animation playback`);
        //----------------------------------------------------------------------
        size = Math.max(1,        Ez.toNumber(size, `${name}: ${args[0]}`,  3));
        max  = Math.max(1 + size, Ez.toNumber(max,  `${name}: ${args[1]}`, 10));
        diff = Math.max(0,        Ez.toNumber(diff, `${name}: ${args[2]}`,  0.1));

        this.#fps = {size, max, diff, times:[], intervals:[], diffs:[],
                     status:this.#status};
        this.#status  = E.running;
        this.#frame   = requestAnimationFrame(t => this.#fpsAnimate(t));
        this.#promise = Ez.promise();
        return this.#promise;
    }
//  #fpsAnimate() is the rAF callback for fpsBaseline()
    #fpsAnimate(timeStamp) {
        let diff, isDone, lt, lv, sample;
        const fps   = this.#fps;
        const size  = fps.size;
        const times = fps.times;
        const vals  = fps.intervals;
        const diffs = fps.diffs;

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
        const args = ["min","skip","peri"];
        const name = `gpuTest(${args.join(", ")})`;
        if (this.isRunning)
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
        this.#status  = E.running;
        this.#promise = Ez.promise();
        this.#skipFrames();
        return this.#promise;
    }
//  #skipFrames() skips this.#skip frames prior to running the test animation.
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