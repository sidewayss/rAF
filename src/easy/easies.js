import {create} from "../efactory/efactory.js";
import {MEBase} from "../easer/measer.js";

import {E, Ez, Easy} from "../raf.js";

export class Easies {
    #active; #easy2ME; #easy2Plays; #easy2Trips; #me2Plays; #noTargets;
    #oneShot; #peri; #post;
    #easies; #targets;
//  #easies, #targets are sets. It prevents duplicates and makes removing items
//  easier. Easies implements iteration protocol for #easies and a few other
//  Set.prototype properties and methods, so an Easies instance acts like a Set
//  (except add() doesn't return a value because that value would be a reference
//  to #easies, and I don't want users modifying it directly).
    constructor(easies) {
        const arr = Ez.toArray(easies, "new Easies(arg1, ...): arg1",
                               Easy._validate,
                            ...Ez.okEmptyUndef);
        this.#easies     = new Set(arr);
        this.#targets    = new Set; // Set(MEaser)
        this.#easy2Plays = new Map; // Map(Easy,   Map(Easer, playings))
        this.#easy2Trips = new Map; // Map(Easy,   Map(Easer, autoTripping))
        this.#easy2ME    = new Map; // Map(Easy,   Set(MEaser))
        this.#me2Plays   = new Map; // Map(MEaser, Map(Easy,  playings))
        Ez.is(this);
        Object.seal(this);
    }
    get easies() { return Array.from(this.#easies); } // shallow copy as Array
//==============================================================================
// Set emulation:
    get size() { return this.#easies.size; }

//  [Symbol.iterator]() allows clients to iterate this.#easies
    [Symbol.iterator]() { return this.#easies.values(); }

//  values() can be used by Ez.toArray()
    values() { return this.#easies.values(); }

    has(ez) { return this.#easies.has(ez); }
    add(ez) { this.#easies.add(Easy._validate(ez, "add(arg): arg")); }

//  delete(ez) deletes ez from this.#easies.
//  Then it deletes all the targets that use ez. A MEaser's easies are paired to
//  a property argument, and every masked argument requires an Easy in order to
//  generate a value to apply. A MEaser with a missing Easy is not operational.
    delete(ez) {
        if (this.#easies.delete(ez)) {
            for (const t of this.#targets) {
                if (t.easies.includes(ez))
                    this.#targets.delete(t);
            }
            return true;
        }
        return false;
    }
//  clear() clears both collections, if #easies is empty, so is #targets
    clear() {
        this.#easies .clear();
        this.#targets.clear();
    }
//==============================================================================
// Target-related public properties:
//  get targets() returns a shallow copy of this.#targets.
//      Easy exposes #targets via a shallow copy. Might as well imitate it here.
//      But there's no reason for a setter. Create a new Easies instead, using
//      createFromTargets(). get targets() returns an array, which is what
//      users will probably pass into createFromTargets(). I could return
//      new Set(this.#targets), but Array is more flexible for users.
    get targets() { return Array.from(this.#targets); }

//  newTarget() creates a MEaser or MEaserByElm instance and adds it to #targets
    newTarget(o) {
        return create(o, this.#targets, true);
    }
//  addTarget() validates a MEaser instance, adds it to #targets. returns it
    addTarget(t) {
        this.#targets.add(MEBase._validate(t, "addTarget(arg): arg"));
    }
//  cutTarget() deletes a MEaser from #targets, but it does not modify #easies.
    cutTarget(t) { return this.#targets.delete(t); }

//  clearTargets() does what it says
    clearTargets() { this.#targets.clear(); }

//  static createFromTargets() uses targets.easies to create a new Easies
    static createFromTargets(targets, post) {
        targets = Ez.toArray(targets, "createFromTargets(arg): arg",
                             MEBase._validate);
        let easies, ez, t;
        easies = new Set;
        for (t of targets)           // t  is MEaser
            for (ez of t.easies)     // ez is Easy
                easies.add(ez);

        easies = new Easies(easies, post);
        easies.#targets = targets;
        return easies;
    }
//==============================================================================
// Miscellaneous:
// this.peri is an optional callback run once per frame, see _next()
    get peri()    { return this.#peri; }
    set peri(val) { this.#peri = Ez._validFunc(val, "peri"); }

// this.post is a callback that runs on arrival, after the last Easy has played
    get post()    { return this.#post; }
    set post(val) { this.#post = Ez._validFunc(val, "easies.post"); }

// this.oneShot runs clearTargets() on AFrame arrival
    get oneShot()    { return this.#oneShot; }
    set oneShot(val) { this.#oneShot = Boolean(val); }

// this.status returns the highest easy.e.status number
    get status() { return Math.max(...this.easies.map(ez => ez.e.status)); }

//  restore() and init() are pass-throughs to Easy=>Easer and MEaser
    restore() {
        let obj;
        for (obj of this.#easies)
            obj.restore();
        for (obj of this.#targets)
            obj.restore();
    }
    init() {
        let obj;
        for (obj of this.#easies)
            obj.init();
        for (obj of this.#targets)
            obj.init();
    }
//!!last() returns the Easy that finishes last.
//!!Useful when RAF.post is defined for the session and you need to run
//!!another function at the end of full animation. AFrame.post could be
//!!an array, as could .peri, but how often do you need this??
//!!last() {
//!!    return Array.from(this.#easies)
//!!                .toSorted((a, b) => a.total - b.total) //!!total time not simple to calculate!!
//!!                .at(-1);
//!!}
//==============================================================================
// "Protected" methods, called by AFrame instances:
//  _zero() helps AFrame.prototype.play() zero out before first call to _next()
    _zero(now = 0, noTargets = false) {
        let easy;
        this.#easy2Plays.clear();             // Easies
        this.#easy2Trips.clear();             // Easies
        this.#me2Plays  .clear();             // MEasers
        this.#noTargets = noTargets;          // pseudo-animation
        this.#active = new Set(this.#easies); // the "live" set
        for (easy of this.#active)
            easy._zero(now);                  // cascade the zeroing-out down

        if (noTargets) return;                // pseudo-animation = no targets
        //-------------------------------------- but there is target-pseudo too
        let e2M, plays, t, trips,
        i = 0;
        for (easy of this.#active) {          // easy.targets: class Easer
            trips = new Map;                  // map target to autoTripping
            plays = new Map;                  // map target to playings
            for (t of easy.targets) {         // playings are run-time plays
                trips.set(t, t._autoTripping(easy, t.autoTrip));
                plays.set(t, t._playings    (easy, t.plays));
            }
            this.#easy2Trips.set(easy, trips);
            this.#easy2Plays.set(easy, plays);
        }

        e2M = this.#easy2ME;                  // Map(Easy, Set(MEaser))
        e2M.clear();
        for (t of this.#targets) {            // this.targets: class MEaser
            t._zero();                        // cascade it down
            t.easies.forEach(ez =>            // fall back to ez.plays
                e2M.has(ez) ? e2M.get(ez).add(t)
                            : e2M.set(ez, new Set([t]))
            );
            this.#me2Plays.set(t, t.playings);
        }
    }
//  _resume() helps AFrame.prototype.play() reset #zero before resuming playback
    _resume(now) {
        for (const ez of this.#active)
            ez._resume(now);
    }
//  _runPost() helps AFrame.prototype.#stop() by conforming to ACues
    _runPost() {
        this.#post?.(this);
    }
//  _reset() helps AFrame.prototype.#stop() reset this to the requested state.
    _reset(sts) {
        for (const ez of this.#easies)  // easys must go first because measers
            ez._reset(sts);             // use their values.

        let t;                          // #targets is Set(MEaser)
        if (sts == E.original)
            for (t of this.#targets)
                t.restore();
        else
            for (t of this.#targets)    // apply each easy's value
                t._apply(t.easies.map(ez => ez.e));
    }
//==============================================================================
//  _next() is the animation run-time. The name matches ACues.protytope._next().
//   AFrame.prototype.#animate() runs it once per frame. It runs easy._easeMe()
//   to get eased values, and t._apply() to calc/apply those values to #targets.
//   #noTargets does not apply values: #easy2Plays, #me2Plays are empty, see
//   _zero(). Returns true upon arrival, else false. No easies means no targets.
    _next(timeStamp) {
        let byElm, e, e2, easers, easy, map, nextElm, noWait, plays, set, sts,
            t, trips, tripping, val, val2;

        // Execute every active easy
        for (easy of this.#active)
            easy._easeMe(timeStamp);
        //=============================
        // Process the easies' targets
        for ([easy, map] of this.#easy2Plays) {
            e   = easy.e;                  // map is Easer to integer plays
            sts = e.status;
            if (sts == E.waiting) continue;
            //------------------------------
            easers = Array.from(map.keys());
            if (sts > E.waiting)           // apply it
                for (t of easers)
                    t._apply(e);
            else {                         // arrive, trip, loop
                e2     = easy.e2;
                noWait = !e.waitNow;       // !tripWait, !loopWait
                if (sts == E.tripped) {
                    trips = this.#easy2Trips.get(easy);
                    for (t of easers) {
                        tripping = trips.get(t);
                        t._apply(tripping && noWait ? e2 : e);
                        if (!tripping)
                            map.delete(t); // !autoTrip means plays = 1,
                    }                      // and loopByElm = false.
                    if (map.size)
                        easy.onAutoTrip?.(easy, map);
                }
                else {                     // sts == E.arrived
                    for (t of easers) {
                        plays = map.get(t);
                        byElm = t.loopByElm;
                        if (!byElm && noWait && plays > 1)
                            t._apply(e2);  // loop w/o wait
                        else
                            t._apply(e);   // arrive, loop w/wait, loopByElm
                                           //_nextElm() increments/returns #iElm
                        nextElm = byElm && t._nextElm();
                        if (!nextElm) {    // loop byPlay or arrive
                            --plays ? map.set(t, plays)
                                    : map.delete(t);
                            if (byElm && plays)    // init the rest of the elms:
                                if (noWait)        // do it now
                                    t._initByElm();
                                else               // post-wait, next apply()
                                    t._isLooping = true;
                        }
                        else if (noWait)   // loopByElm w/o wait, next elm
                            t._apply(e2);

                        if (plays)         // run loop callbacks
                            if (nextElm)
                                t.onLoopByElm?.(easy, t);
                            else
                                t.onLoop?.(easy, t);
                    }
                }
            }
            if (!map.size)
                this.#easy2Plays.delete(easy);
        }
        //===============================
        // Process #targets, the MEasers
        for ([t, plays] of this.#me2Plays) {
            val   = [];                     // val is sparse like t.#calcs
            trips = t.autoTripping;
            if (!t.loopByElm) {
                plays.forEach((p, i) => {
                    easy = t.easies[i];
                    e    = easy.e;
                    sts  = e.status;
                    if (sts != E.waiting) {
                        if (--p && !sts && !e.waitNow)
                            e = easy.e2     //!!e2 for loopNoWait, not tripNoWait??
                        val[i] = e;
                                            // arrived || tripped and done
                        if (!sts || (sts == E.tripped && !trips[i])) {
                            if (!p) {            // no more plays, arriving
                                delete plays[i]; // delete preserves order/indexes
                                set = this.#easy2ME.get(easy);
                                set.delete(t);
                                if (!set.size)
                                    this.#easy2ME.delete(easy);
                            }
                            else if (!sts)       // looping
                                plays[i] = p;    // decrement the play count
                        }
                    }
                });
                if (val.length)
                    t._apply(val);
                if (!plays.some(v => v))
                    this.#me2Plays.delete(t);
            }
            else if (t.loopEasy.e.status) { // loopByElm, but not looping now
                plays.forEach((_, i) => {
                    e = t.easies[i].e;
                    if (e.status != E.waiting)
                        val[i] = e;         // val is sparse
                });
                if (val.length)
                    t._apply(val);
            }
            else {                          // looping by elm, maybe by plays
                val2 = [];                  //!!_initByElm and _isLooping!!
                plays.forEach((_, i) => {
                    easy = t.easies[i];
                    e    = easy.e;
                    sts  = e.status;
                    if (!sts) {
                        val[i] = e;
                        if (!e.waitNow)
                            val2[i] = easy.e2;
                    }
                    else if (sts > E.waiting)
                        val2[i] = e;
                });
                t._apply(val);              // apply to current elm
                if (!t._nextElm(true)) {    // go to next elm or arrive
                    plays.forEach((p, i) => p > 1 ? --plays[i]
                                                  : delete plays[i]);
                    if (!plays.some(v => v))
                        this.#targets.delete(t);
                }
                else if (val2.length)
                    t._apply(val2);
            }
        }
        //=====================
        // Clean up and return
        for (easy of this.#active) {
            e = easy.e;
            const b = this.#noTargets
                    ? !e.status || (e.status == E.tripped && !easy.autoTrip)
                    : !this.#easy2Plays.has(easy) && !this.#easy2ME.has(easy);
            if (b) {
                easy.post?.(easy);
                this.#active.delete(easy);
            }
            else {
                sts = e.status;
                if (e.waitNow) {            // similar to Easy.proto._zero():
                    e.status  = E.waiting;  //$$
                    e.waitNow = false;
                }
                else if (!sts)              // E.arrived
                    e.status = E.outbound;  //$$
                else if (sts == E.tripped)
                    e.status = E.inbound;   //$$
                                            // else no change
                if (!sts)
                    easy.onLoop?.(easy);    // plays > 1 loop for Easy
            }
        }
        this.#peri?.(this, timeStamp);      // wait until everything is updated
        return this.#active.size;           // 0 active Easys = falsy = finished
    }
}