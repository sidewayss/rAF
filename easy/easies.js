import {Easy}   from "./easy.js";
import {create} from "./efactory.js";
import {MEBase} from "./measer.js";

import {E, Ez} from "../raf.js";

export class Easies {
    #active; #byEasy; #byTarget; #easy2ME; #onArrival; #peri; #post;
    #easies; #targets;
//  #easies, #targets are sets. It prevents duplicates and makes removing items
//  easier. Easies implements iteration protocol for #easies and a few other
//  Set.prototype properties and methods, so an Easies instance acts like a Set
//  (except add() doesn't return a value because that value would be a reference
//  to #easies, and I don't want users modifying it directly).
    constructor(easies, onArrival, post) {
        // These will be <10 items, so let toArray() handle the validation
        this.#easies = new Set(Ez.toArray(easies, "new Easies(arg1, ...): arg1",
                                          Easy._validate, ...Ez.okEmptyUndef));
        this.#targets  = new Set; // Set(MEaser)
        this.#byEasy   = new Map; // Map(Easy,   Map(Easer, plays))
        this.#byTarget = new Map; // Map(MEaser, Map(Easy,  plays))
        this.#easy2ME  = new Map; // Map(Easy,   MEaser)
        this.post      = post;
        this.onArrival = onArrival;
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
        return create(o, this.#targets, o.easies, "single", "Easy");
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
    static createFromTargets(targets, onArrival, post) {
        targets = Ez.toArray(targets, "createFromTargets(arg): arg",
                             MEBase._validate);
        let easies, ez, t;
        easies = new Set;
        for (t of targets)           // t  is MEaser
            for (ez of t.easies)     // ez is Easy
                easies.add(ez);

        easies = new Easies(easies, onArrival, post);
        easies.#targets = targets;
        return easies;
    }
//==============================================================================
// Miscellaneous:
// this.peri is an optional callback run once per frame, see _next()
    get peri()    { return this.#peri; }
    set peri(val) { this.#peri = Ez._validFunc(val, "peri"); }

// this.post is an optional callback run after the last Easy has played
    get post()    { return this.#post; }
    set post(val) { this.#post = Ez._validFunc(val, "easies.post"); }

// this.onArrival
    get onArrival()    { return this.#onArrival; }
    set onArrival(sts) { this.#onArrival = Easy._validArrival(sts, "Easies"); }

//  restore() and init()
    restore()     { for (const ez of this.#easies) ez.restore();     }
    init(applyIt) { for (const ez of this.#easies) ez.init(applyIt); }

//!!last() returns the Easy that finishes last.
//  Useful when RAF.post is defined for the session and you need to run
//  another function at the end of full animation. AFrame.post could be
//  an array, as could .peri, but how often do you need this?
    last() {
        return Array.from(this.#easies)
                    .toSorted((a, b) => a.total - b.total)
                    .at(-1);
    }
//==============================================================================
// "Protected" methods, called by AFrame instances:
//  _zero() helps AFrame.prototype.play() zero out before first call to _next()
    _zero(now) {
        let e2M, easies, easy, map, plays, set, t, tplays;
        this.#active = new Set(this.#easies);
        this.#byEasy.clear();
        for (easy of this.#easies) {
            map = new Map;         // map target to plays
            for (t of easy.targets)
                map.set(t, t.plays || easy.plays);
            this.#byEasy.set(easy, map);
        }
        this.#byTarget .clear();
        e2M = this.#easy2ME;
        e2M.clear();
        for (t of this.#targets) {
            easies = t.easies;     // getter returns a shallow copy
            tplays = t.plays;      // ditto
            plays  = new Array(easies.length);
            easies.forEach((ez, i) => {
                plays[i] = tplays[i] || ez.plays;
                set = e2M.get(ez);
                if (set)
                    set.add(t);
                else {
                    set = new Set;
                    set.add(t);
                    e2M.set(ez, set);
                }
            });
            this.#byTarget.set(t, plays);
        }
        for (const ez of this.#easies)
            ez._zero(now);
    }
//  _resume() helps AFrame.prototype.play() reset #zero before resuming playback
    _resume(now) {
        for (const ez of this.#active)
            ez._resume(now);
    }
//  _reset(): helps AFrame.prototype.#cancel() reset this to the requested state
    _reset(sts) {
        for (const ez of this.#easies)
            ez._reset(sts);
    }
//  _runPost() helps AFrame.prototype.#cancel() run .post() for unfinished ACues
    _runPost() {
        for (const ez of this.#active)
            ez.post?.(ez);
        this.#post?.(this);
    }
//  _next() is the animation run-time. The name matches ACues.protytope._next().
//   AFrame.prototype.#animate() runs it once per frame. It runs ez._easeMe() to
//   get eased values, and t._apply() to apply those values to #targets.
//   Returns true upon arrival, else false. No easies means no targets.
    _next(timeStamp) {
        let byElm, e, e2, easers, easy, map, noWait, plays, set, sts, t,
            val, val2;

        // Execute each easy
        for (easy of this.#active)
            easy._easeMe(timeStamp);

        // Process the easies' targets
        for ([easy, map] of this.#byEasy) {
            e   = easy.e;
            sts = e.status;
            if (sts == E.waiting) continue;
            //------------------------------
            easers = Array.from(map.keys());
            if (sts > E.waiting)          // apply it
                for (t of easers)
                    t._apply(e);
            else {                        // arrive, trip, or loop
                e2 = easy.e2;
                noWait = !e.waitNow;
                if (sts == E.tripped) {
                    for (t of easers) {   // delete non-autoTrippers
                        t._apply(t._autoTripping && noWait ? e2 : e);
                        if (!t._autoTripping)
                            map.delete(t);
                    }
                }
                else {                    // sts == E.arrived
                    for (t of easers) {
                        byElm = t.loopByElm;
                        plays = map.get(t);
                        t._apply(!byElm && noWait && plays > 1
                                 ? e2     // loop w/o wait
                                 : e);    // arrive, loop w/wait, loopByElm
                        if (!byElm || !t._nextElm()) {
                            plays--;
                            plays ? map.set(t, plays)
                                  : map.delete(t);
                        }
                        else if (noWait)
                            t._apply(e2); // loopByElm w/o wait
                    }
                }
            }
            if (!map.size)
                this.#byEasy.delete(easy);
        }
        // Process #targets, the MEasers
        for ([t, plays] of this.#byTarget) {
            val  = [];                    // val is sparse like t.#calcs
            if (!t.loopByElm) {
                plays.forEach((p, i) => {
                    easy = t.easies[i];
                    e    = easy.e;
                    sts  = e.status;
                    if (sts != E.waiting) {
                        if (--p && !sts && !e.waitNow)
                            e = easy.e2   //!!e2 for loopNoWait, not tripNoWait??
                        val[i] = t.eVal(e, i);

                        if (!sts || (sts == E.tripped && !t._autoTripping[i])) {
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
                    this.#byTarget.delete(t);
            }
            else if (t.loopEasy.e.status) { // loopByElm, but not looping now
                plays.forEach((_, i) => {
                    e = t.easies[i].e;
                    if (e.status != E.waiting)
                        val[i] = t.eVal(e, i);
                });
                if (val.length)
                    t._apply(val);
            }
            else {                          // looping by element
                val2 = [];
                plays.forEach((_, i) => {
                    easy = t.easies[i];
                    e    = easy.e;
                    sts  = e.status;
                    if (!sts) {
                        val[i] = t.eVal(e, i);
                        if (!e.waitNow)
                            val2[i] = t.eVal(easy.e2, i);
                    }
                    else if (sts > E.waiting)
                        val2[i] = t.eVal(e, i);
                });
                t._apply(val);                   // apply to current elm
                if (!t._nextElm(true)) {         // go to next elm or arrive
                    plays.forEach((p, i) => p > 1 ? --plays[i]
                                                  : delete plays[i]);
                    if (!plays.some(v => v))
                        this.#targets.delete(t);
                }
                else if (val2.length)
                    t._apply(val2);
            }
        }
        // Clean up and return
        for (easy of this.#active) {
            if (!this.#byEasy.has(easy) && !this.#easy2ME.has(easy)) {
                easy.post?.(easy);
                this.#active.delete(easy);
            }
            else {
                e = easy.e;
                if (!e.status) {
                    if (e.waitNow) {
                        e.status  = E.waiting;
                        e.waitNow = false;
                    }
                    else
                        e.status = E.outbound;

                    easy.loop?.(easy);
                }
                else if (e.status == E.tripped)
                    e.status = E.inbound;
            }
        }
        this.#peri?.(this);        // wait until everything is updated
        return !this.#active.size;
    }
}