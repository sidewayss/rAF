////////////////////////////////////////////////////////////////////////////////
// AFrame and ACues classes. The outermost layer of the raf.js project.
// Copyright (C) 2018 Sideways S. www.sidewayss.com
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
////////////////////////////////////////////////////////////////////////////////
// Lint settings
/* jshint esversion: 6 */
/* jshint strict: global */
/* jshint elision: true */
/* jshint -W014 */
/* jshint -W069 */
/* jshint -W078 */
/* jshint -W083 */
/* jshint -W117 */
/* jshint -W138 */
"use strict";
//||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
//||||||||||||||||||||||||||||||||||||| RAF classes ||||||||||||||||||||||||||||
//||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
class ACues {                        // ACues: a barebones cues list
    constructor(func, cues, times, zero) {
        this.init(...arguments);
        Object.seal(this);
    }
    init(func, cues = [], times = [], zero = 0) {
        this.func = func;   this.times = times;   this.cues = cues;
        this.zero = zero;   this.index = 0;       this.last = cues.length - 1;
    }
    push(t, attr, elms, v, set, arg3, arg4, arg5, arg6) {
        let obj = Object.create(null);
        this.cues .push(obj);
        this.times.push(t);
        this.last++;
        if (attr) {
            obj.args = [elms, v, arg3, arg4, arg5, arg6];
            switch (set) {
                case E.let: obj.func = attr.let; break;
                case E.net: obj.func = attr.net; break;
                default:    obj.func = attr.set;
            }
        }
        return obj;
    }
    run(now) {
        if (this.zero === 0) {
            this.zero = now;         // adjust the times now: faster, simpler
            this.times.forEach((v, i, a) => {a[i] = v + now;});
        }
        if (now >= this.times[this.index]) {
            let cue = this.cues[this.index];
            if (cue.func)
                cue.func(...cue.args);
            else
                this.func(cue, this);
            this.index++;            // must wait until after this.func()
        }
        return(this.index <= this.last);
    }
}             ///////////////////////// end class ACues ||||||||||||||||||||||||
///////////////////////////////////////|||||||||||||||||||||||||||||||||||||||||
class AFrame {                       // AFrame: the animation frame manager
    constructor() {
        this.frame = undefined;   this.min = undefined;   this.func = undefined;
        this.cues  = undefined;   this.fps = undefined;   this.skip = undefined;
        this.eases = [];          this.gpu = undefined;   this.gpuf = undefined;
        this.last  = Object.create(null);
        Object.seal(this);
    }
    /////////////////////////////////// 2 types of target: Easy and ACues //////
    add(o) {                         // adds an instance of Easy to this.eases
        return this.push(o.zero, o.time, o.type,  o.pow, o.start, o.end, o.wait,
                         o.mid, o.pause, o.type2, o.pow2,         o.end2,
                         o.turns || o.plays || o.repeats + 1 || undefined,
                         o.break,
                         o.byElm || o.byElement,
                         o.pre, o.peri, o.post, o.gpu);
    }                                // raw arguments version of add()
    push(zero, time, type,  pow, start, end, wait,
         mid, pause, type2, pow2,       end2,
         turns, breaK, byElm, pre, peri, post, gpu)
    {
        let ez = new Easy(...arguments);
        this.eases.push(ez);
        if (Is.def(this.gpu))
            this.constructor.zgpu(ez, this);
        return ez;
    }
    cue(func, cues, times, zero) {   // creates and returns this.cues
        this.cues = new ACues(...arguments);
        return this.cues;
    }
    /////////////////////////////////// animation methods //////////////////////
    animate(timeStamp) {             // cues first so they can trigger eases...
        if (this.cues && !this.cues.run(timeStamp))
            this.zend("cues",  null);
        if (this.eases.length && !Easy.easeEm(this.eases, timeStamp).status)
            this.zend("eases", []);

        if ((this.func && this.func(this)) || this.cues || this.eases.length)
            this.frame = requestAnimationFrame((t) => this.animate(t));
        else
            this.frame = undefined;
    }
    cancel(arrive, reset)  {
        if (Is.def(this.frame)) {
            cancelAnimationFrame(this.frame);
            this.frame = undefined;
            if (arrive) {
                if (this.cues) {
                    this.cues.index = this.cues.last;
                    this.cues.run(Infinity);
                }
                if (this.eases)
                    Easy.easeEm(this.eases, Infinity);
            }
            if (reset) {
                if (this.cues)         this.zend("cues",  null);
                if (this.eases.length) this.zend("eases", []);
            }
            return true;
        }
    }
    start()   {
        if (!Is.def(this.frame)) {
            this.frame = requestAnimationFrame((t) => this.animate(t));
            return true;
        }
    }                                // test() is an alternative to start()
    test(timeStamp, ez, min, func, skip = 0) {
        if (!timeStamp) {            // use the default (ez.zero = 0), so that
            ez.aframe = this;        // easeMe() starts counting at 0, not 1.
            ez.frames = 0;                       this.min  = min;
            ez.peri   = this.constructor.zpp;    this.gpuf = func;
            ez.post   = this.constructor.zfps;   this.skip = skip;
        }
        this.frame = requestAnimationFrame(
                     (t) => (this.skip-- > 0 ? this.test(t) : this.animate(t)));
    }
    zend(key, val) {                 // zend() is "private", not for public use
        this.last[key] = this[key];
        this[key]      = val;
    }
    /////////////////////////////////// static helpers /////////////////////////
    static zfps(ez) {                // zfps() computes .fps: frames per second
        let af = ez.aframe;          // sets .gpu to pass/fail: .fps >= minimum
        af.fps = ez.frames / (ez.time / 1000);
        af.gpu = af.fps >= af.min;
        for (let t of af.eases)
            AFrame.zgpu(t, af);
        if (af.gpuf)
            af.gpuf();
        delete ez.aframe;  delete ez.frames;  delete ez.peri;  delete ez.post;
    }
    static zgpu(ez, af) {            // zgpu() uses 0 == false and 1 == true
        if (Is.def(ez.gpu) && ez.gpu != af.gpu) {
            if (ez.gpu === false || ez.gpu === true)
                ez.zero = false;     // tells easeEm() to do nothing
            else
                ez.noop = true;      // tells easeMe() to do almost nothing
        }
    }
    static zpp(ez) { ez.frames++; }  // zpp() counts frames
}                         ///////////// end class AFrame |||||||||||||||||||||||
const RAF = new AFrame();            // one instance is all you need
