// Not exported by raf.js
export {steps, stepsToLegs};

import {legUnit, toNumberArray} from "./easy-construct.js"

import {E, Ez, Is, Easy} from "../raf.js";
const s = "steps";  // inside this module they aren't "time" & "start"
const t = "timing";
//==============================================================================
// steps() consolidates code in #prepLegs()
//         Each step becomes a leg to make processing simpler during animation.
//         leg.steps  is Number, Array-ish, undefined. leg.easy eases leg.steps.
//         leg.timing is Array-ish, Easy, or undefined.
//         If leg.timing is Array-ish, leg.steps can be undefined, otherwise
//         the legs.steps or leg.steps.length must match leg.timing.length.
function steps(o, leg) {
    let c, l, stepsIsA,
    stepsIsN = Is.Number(leg[s]);

    if (!stepsIsN && Is.def(leg[s])) {  // numeric string, array, or invalid
        const n = Is.A(leg[s]) ? NaN : parseFloat(leg[s]);
        try {
            if (Number.isNaN(n)) {      // it's an array of numbers
                leg[s] = toNumberArray(leg[s].slice(), s);
                stepsIsA = true;        // ...slice() preserves user array //!!how do you preserve it and set it at the same time??
                leg.stepsReady = true;
                if (Is.def(leg.start))
                    console.info(leg.start != leg[s][0]); //!!leg.start is ignored anyway
                if (Is.def(leg.end))
                    console.info(leg.end != leg[s].at(-1)); //!!leg.end is ignored anyway
            }
            else {                      // parseFloat() converted it to a number
                leg[s] = n;
                stepsIsN = true;
            }
        } catch {
            Ez._mustBeErr(s, "a Number, an Array [Number], or convertible "
                           + "to Number or Array [Number]")
        }
    }
    else if (!Is.def(leg.easy))
        leg.easy = o.easy;

    if (!Is.def(leg[t]))                // validate/convert leg.timing
        leg[t] = o[t];
    if (Is.def(leg[t]) && !leg[t].isEasy) {
        try {                           // it's an array of numbers or error
            leg[t] = toNumberArray(leg[t], t);
        } catch {
            Ez._mustBeErr(t, "an Easy, an Array [Number], convertible "
                           + "to Array [Number], or undefined")
        }
        Ez._mustAscendErr(leg[t], `${t} array`);
        l = leg[t].length;
        if (stepsIsN && leg[s] != l)
            Ez._mustBeErr(`${s}`,
                          `the same as ${t}.length: ${leg[s]} != ${l}`);
        if (stepsIsA && leg[s].length != l)
            Ez._mustBeErr(`${s} and ${t} arrays`,
                          `the same length: ${leg[s].length} != ${l}`);
        //-------------------------
        const last = leg[t].at(-1);
        if (!Is.def(leg.time) || last > leg.time) {
            if (last > leg.time)
                console.warn("Your timing array extends past the total"
                           + "leg.time, and has overriden leg.time: "
                           + `${last} > ${leg.time}`);
            leg.time = last;        // avoids spreadToEmpties(), errors
        }
        leg.timingReady = true;
    }
    else {                          // auto-generate linear waits based
        const                       // on steps/ends and jump.
        j    = "jump",
        jump = leg.easy             // eased values means start = 0, end = 1
             ? E.end                //  E.end is the CSS steps() default
             : Number(leg[j] ?? o[j] ?? E.end);

        if (!Easy.jump[jump])
            Ez._invalidErr(j, jump, Easy._listE(j));
        //-------------
        if (stepsIsA) {
            l = leg[s].length;      // formula for c/l is the opposite here
            c = l + Number(jump == E.none)
                  - Number(jump == E.both);
            if (!c)
                throw new Error(`${s}.length = 1, ${j}:E.both = zero ${s}.`);
        }
        else {
            c = Ez.toNumber(leg[s], s, 1, ...Ez.intGrThan0);
            l = c + Number(jump == E.both)
                  - Number(jump == E.none);
            if (!l)
                throw new Error(`{${s}:1, ${j}:E.none} = zero ${s}.`);
        } //----------------------------------
        const offset = jump & E.start ? 0 : 1;
        leg.waits = Array.from({length:l}, (_, i) => (i + offset) / c);
        leg.jump  = jump;   // validated/converted, see prepLegs(): lastLeg.jump
    }                       // only matters for #lastLeg...
}
//  stepsToLegs() helps _finishLegs() turn 1 leg into >1 legs for _calc()
function stepsToLegs(o, leg, legDist, dist, idx, last, keys) {
    let ends, waits;
    if (leg.timingReady)        // leg.timing is an array of wait times
        waits = leg[t];
    else if (leg[t])            // leg.timing is an Easy instance
        waits = easeSteps(leg[t], leg.waits, 1, 0, leg.time, t);
    else                        // leg.timing is undefined
        waits = leg.waits.map(v => v * leg.time);
                                // leg.waits is 0-1, portion of time
    let l = waits.length;
    const LENGTH = {length:l};
    if (leg.stepsReady)         // leg.steps is already an array of step values
        ends = leg[s];
    else if (leg.easy)          // generate eased steps
        ends = easeSteps(leg.easy, waits, leg.time, leg.start, legDist, "easy");
    else {
        const d = legDist / l;  // generate linear steps
        ends = Array.from(LENGTH, (_, i) => leg.start + (d * (i + 1)));
    }
                                // transform the steps into legs:
    const
    start = o.start,
    legs  = Array.from(LENGTH, () => new Object);
    legs.forEach((lg, i) => {
        lg.type = E[s];
        lg.io   = E.in;         // must be defined
        lg.end  = ends[i];      // the step value
        legUnit(lg, start, dist, keys);
        lg.prev = legs[i - 1];
        lg.next = legs[i + 1];
        lg.time = 0;            // steps don't have a duration
        lg.wait = waits[i] - (i ? waits[i - 1] : 0);
    });
    if (leg.wait)
        legs[0].wait += leg.wait;

    const obj = {};
    if (idx == 0)               // _firstLeg
        obj.firstLeg = legs[0];
    else {                      // replace leg in the linked list
        legs[0].prev  = leg.prev;
        leg.prev.next = legs[0];
    }
    --l;
    const leftover   = leg.time - waits[l];
    legs[l].leftover = leftover;
    if (idx == last) {          // #lastLeg
        o.end   = legs[l].end;
    //!!o.time -= leftover;
        obj.lastLeg = legs[l];
    }
    else {                      // continue to replace leg in the list
        legs[l].next   = leg.next;
        leg.next.prev  = legs[l];
        leg.next.wait += leftover;
    }
    return obj;
}
//  static easeSteps() helps stepsToLegs() use an Easy to set the timing or
//         values for E.steps. ez cannot be E.increment here because it has
//         either no end, or no duration; and its legs cannot be E.steps, to
//         avoid infinite easeSteps loops and because not-eased is linear or
//         fixed values, which is pointless.
//         For eased values, jump:E.start has no effect because time=0 produces
//         value=0. So E.start is the same as E.none, E.end same as E.both.
function easeSteps(ez, nows, time, start, dist, name) {
    Easy._validate(ez, name);                   // phase 1 validation
    if (ez.isIncremental)                       // phase 2: can't be E.increment
        Ez._cantBeErr(name, "class Incremental");
    //------------------------------------------
    const
    ezDown   = ez.end < ez.start,
    isTiming = (name[0] == "t");
    let  leg = ez._firstLeg;
    do {                                        // for each leg:
        if (leg.type == E[s])                   // phase 3: can't be E.steps
            Ez._cantBeErr(name, `type:E.${s}`);
        if (isTiming && (ezDown != leg.end < leg.start
                      || (leg.type >= E.back && leg.type <= E.bounce)
                      || (leg.type == E.bezier && Ez.unitOutOfBounds(leg.bezier.array))))
            Ez._cantBeErr(                      // phase 4: can't mix directions
                name,
                "an Easy that changes direction. Time only moves in one direction",
                {cause:"reverse time"}          // better *not* as string...
            );
    } while ((leg = leg.next));
    //------------------------------------------// validation complete
    ez._zero(0);                                // prep for pseudo-animation
    const d    = time / ez.time;                // d for divisor
    const prop = ezDown ? E.comp : E.unit;      // nows always ascends
    return nows.map(v => {
       ez._easeMe(v / d);
       return start + (ez.e[prop] * dist);
    });
}