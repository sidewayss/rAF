// Not exported by raf.js
export {steps, stepsToLegs};
import {Easy} from "./easy.js";
import {E, Ez, Is} from "../raf.js";
//==============================================================================
// steps() consolidates code in #prepLegs()
//         Each step becomes a leg to make processing simpler during animation.
//         leg.steps  is Number or Array-ish. leg.easy eases leg.steps.
//         leg.timing is Array-ish, Easy, or undefined.
//         If leg.timing is Array-ish, leg.steps can be undefined, otherwise
//         the legs.steps or leg.steps.length must match leg.timing.length.
function steps(o, leg) {
    const s = "steps";  // inside this function they aren't "time" & "start"
    const t = "timing";
    let stepsIsN = Is.Number(leg[s]);
    let stepsIsA = Is.def(leg[s]) && !stepsIsN;
    let c, l;
    if (stepsIsA) {                     // validate/convert leg[s]
        const n = Is.A(leg[s]) ? NaN : parseFloat(leg[s]);
        try {
            if (Number.isNaN(n)) {
                leg[s] = toNumberArray(leg[s], s);
                leg.stepsReady = true;  // it's an array of numbers
            }
            else {
                leg[s] = n;             // it was converted to a number
                stepsIsA = false;
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
            leg.time = last;        // avoids spreadToEmpties() and errors
        }
        leg.timingReady = true;
    }
    else {                          // auto-generate linear waits based
        const j    = "jump";        // on steps/ends and jump.
        let   jump = leg[j] ?? o[j] ?? E.end; // enumerated integer
        if (!Easy.jump[jump])   // E.end is the CSS steps() default
            Ez._invalidErr(j, jump, Easy._listE(j));
        //------------------
        jump = Number(jump);        // not necessary, but safe & correct
        if (stepsIsA) {
            l = leg[s].length;      // formula for c/l is the opposite here
            c = l - Number(jump == E.both)
                  + Number(jump == E.none);
            if (!c)
                throw new Error(`${s}.length = 1, ${j}:E.both = zero ${s}.`);
        }
        else {
            c = Ez.toNumber(leg[s], s, 1, ...Ez.intGrThan0);
            l = c + Number(jump == E.both)
                  - Number(jump == E.none);
            if (!l)
                throw new Error(`{${s}:1, ${j}:E.none} = zero ${s}.`);
        } //--------------------------
        const offset = jump & E.start ? 0 : 1;
        leg.waits = Array.from({length:l}, (_, i) => (i + offset) / c);
    }
}
//  stepsToLegs() helps _finishlegs() turn 1 leg into >1 legs for _calc()
function stepsToLegs(o, leg, ez, idx, last) {
    let ends, retval, waits;
    if (leg.timingReady)        // leg.timing is an array of wait times
        waits = leg.timing;
    else if (leg.timing)        // leg.timing is an Easy instance
        waits = easeSteps(leg.timing, leg.waits, 1, 0, leg.time,
                                false, "timing");
    else                        // leg.timing is undefined
        waits = leg.waits.map(v => v * leg.time);

    let l = waits.length;
    if (leg.stepsReady)         // leg.steps is an array of step values
        ends = leg.steps;
    else if (leg.easy)          // auto-generate eased steps
        ends = easeSteps(leg.easy, waits, leg.time, leg.start,
                               leg.dist, leg.down, "easy");
    else {                      // auto-generate linear step values
        const j = leg.dist / l;
        ends    = leg.down
                ? Array.from({length:l}, (_, i) => leg.start - ((i + 1) * j))
                : Array.from({length:l}, (_, i) => (i + 1) * j + leg.start);
    }

    const legs = Array.from({length:l}, () => new Object);
    legs.forEach((obj, i) => {
        obj.type = E.steps;
        obj.io   = E.in;        // must be defined
        obj.end  = ends[i];     // step value is applied as .end
        obj.unit = ez._legUnit(obj, o.start, leg.down);
        obj.prev = legs[i - 1];
        obj.next = legs[i + 1];
        obj.time = 0;           // steps don't have a duration
        obj.wait = waits[i] - (i ? waits[i - 1] : 0);
    });
    if (leg.wait)
        legs[0].wait += leg.wait;

    if (idx == 0)
        retval = {first:true, leg:legs[0]};
    else {
        legs[0].prev  = leg.prev;
        leg.prev.next = legs[0];
    }
    --l;
    const leftover   = leg.time - waits[l];
    legs[l].leftover = leftover;
    if (idx == last) {
        o.end   = legs[l].end;
        o.time -= leftover;
        if (l || ez.lastLeg)
            retval = {leg:legs[l]};
    }
    else {
        legs[l].next   = leg.next;
        leg.next.prev  = legs[l];
        leg.next.wait += leftover;
    }
    return retval;
}
//  static easeSteps() helps stepsToLegs() use an Easy to set the timing or
//         values for E.steps. ez cannot be E.increment here because it has
//         either no end, or no duration; and it cannot be E.steps to avoid
//         infinite easeSteps loops and because not-eased is linear or fixed
//         values, which is pointless.
function easeSteps(ez, nows, time, start, dist, isDown, name) {
    let leg;
    Easy._validate(ez, name);               // phases one of validation
    if (ez.isIncremental)                   // phase two
        Ez._cantBeErr(name, "class Incremental");
    //-----------------------------------
    const ezDown   = ez.end < ez.start;
    const isTiming = (name[0] == "t");
    leg = ez._firstLeg;
    do {
        if (leg.type == E.steps)            // phase three
            Ez._cantBeErr(name, "type:E.steps");
        if (isTiming                        // phase four
         && (leg.down != ezDown
          || (leg.type >= E.back   && leg.type <= E.bounce)
          || (leg.type == E.bezier && Ez.unitOutOfBounds(leg.bezier.array))))
            Ez._cantBeErr(name, "an Easy that changes direction. "
                              + "Time only moves in one direction");
    } while ((leg = leg.next));
    //---------------
    time /= ez.time;                        // validation complete
    ez._zero(0);
    const prop = ezDown ? E.comp : E.unit;  // vals always ascends
    const vals = nows.map(v => {
                    ez._easeMe(v / time);
                    return ez.e[prop] * dist;
                 });
    return isDown ? vals.map(v => start - v)
                  : vals.map(v => start + v);
}