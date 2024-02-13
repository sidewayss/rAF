export {ezCopy, loadCopy};
let ezCopy;

import {E, P, Easy, Easies, AFrame} from "../raf.js";

import {points} from "./update.js";
import {COUNT, CLICK, EASY_, elms, g, addEventsByElm, errorAlert, errorLog}
                from "./common.js";

import {TYPE, IO}              from "./easings/tio-pow.js"; // instead of
import {TIMING, EASY, isSteps} from "./easings/steps.js";   // import(_copy.js)
import {meFromForm}            from "./multi/index.js";      //

let isMulti, ns, rafCopy; // ns imports objFromForm via _named.js
//==============================================================================
function loadCopy(b, _named) {
    isMulti = b;
    ns = _named;        // clickCode, clickData
    addEventsByElm(CLICK, [elms.code, elms.data], handlers);
    ezCopy = new Easy({ // "Copied!" notification fades in/out
                time:1000,      type:E.sine,   io:E.out,
                roundTrip:true, autoTrip:true, tripWait:250
            });
    ezCopy.newTarget({elm:elms.copied, prop:P.o});
    rafCopy = new AFrame(new Easies([ezCopy]));
}
//==============================================================================
// handlers includes both the easings and multi code because that code shares
// variables and helper functions which reside here. Not a bad thing to have all
// this code in one place, and it's not much code in total.
const handlers = {
    clickCode() {   // copies JavaScript code that creates the current animation
        let i, p, txt;
        const obj = ns.objFromForm();
        if (isMulti) {
            const set  = new Set;
            const vars = obj.names.map(nm => {
                if (!nm)        // DEFAULT_NAME = ""
                    nm =  EASY; // it must have a variable name
                i   = 2;
                txt = nm;       // user can select the same name in every <select>
                while (set.has(nm))
                    nm = txt + i++;
                set.add(nm);
                return nm;
            });
            txt = "";           // insert Easy x COUNT, one Easies, one MEaserByElm
            obj.names.forEach((nm, i) => txt += easyToText(nm, vars[i]));
            txt += `const easies = new Easies([${vars.join()}]);\n`
                    + "const measer = easies.newTarget("
                    + jsonToText(JSON.stringify(meFromForm(vars)))
                    + ");\nconst raf = new AFrame(easies);\n";
        }
        else {
            const rex = ":(.*?),";
            txt = jsonToText(JSON.stringify(obj));
            for (p of [TYPE, IO, "jump"])           // replace numbers with "E."
                txt = txt.replace(                  // e.g. "0" = "E.linear"
                        new RegExp(`${p}${rex}`),
                        (_, v) => `${p}:${E.prefix}${Easy[p][v]},`
                    );

            txt = `const ez = new Easy(${txt});\n`; // insert Easy declaration(s)
            if (isSteps())
                for (p of [TIMING, EASY])
                    if (txt.includes(p))
                        txt = easyToText(txt.match(new RegExp(`${p}${rex}`))[1])
                            + txt;
        }
        copyText(txt);
    },
    clickData() {   // copies points data for tabular validation elsewhere
        let i, p, txt;
        const keys = Easy.eKey;
        txt = "time (ms)";
        if (isMulti) {
            for (i = 0; i < COUNT; i++)
                txt += copyByKey(keys, i);
            for (p of points.slice(0, g.frames + 1)) {
                txt += copyTime(p);
                for (i = 0; i < COUNT; i++)
                    txt += copyPointByKey(keys, p.x[i]);
            }
        }
        else {
            txt += "\ty";
            txt += copyByKey(keys);
            for (p of points.slice(0, g.frames + 1)) {
                txt += copyTime (p, true);
                txt += copyPointByKey(keys, p);
            }
        }
        copyText(txt);
    }
};
//==============================================================================
// clickData(), clickCode() helpers:
function copyText(txt) {
    navigator.clipboard.writeText(txt)
      .then (() => rafCopy.play().catch(errorLog))
      .catch(errorAlert);
}
//====================
// clickData() helpers
function copyTime(p, hasY) {
    return `\n${p.t}` + (hasY ? `\t${p.y}` : "");
}
function copyByKey(keys, i = "") {
    let key, txt = "";
    for (key of keys)
        txt += `\t${key}${i}`;
    return txt;
}
function copyPointByKey(keys, p) {
    let key, txt = "";
    for (key of keys)
        txt += `\t${p[key]}`;
    return txt;
}
//====================
// clickCode() helpers
function jsonToText(json) { // I wanted to prettify more, but not worth it
    return json.replaceAll('"', '')
               .replaceAll(',', ', ');
}
function easyToText(name, varName = name) { // has trailing newline built-in
    const txt = jsonToText(localStorage.getItem(EASY_ + name));
    return `const ${varName} = new Easy(${txt});\n`;
}