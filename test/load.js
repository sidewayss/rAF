export {FPS, ezX, raf, msecs,  secs, setTime};
let FPS = 60,    // assumes 60hz, but adjusts to reality at run-time
    ezX, raf,    // Easy, AFrame
    msecs, secs; // alternate versions of time, both integers

import {E, Is, Ez, P, PFactory, Easy, AFrame} from "../raf.js";

import {getNamed, getLocalNamed, setNamed}  from "./local-storage.js";
import {loadUpdate}                         from "./update.js";
import {DEFAULT_NAME, loadNamed, disableSave,
        disablePreset, disableDelete}       from "./named.js";
import {INPUT, MILLI, COUNT, ONE, dlg, elms, g,
        formatNumber, errorAlert, errorLog} from "./common.js";
/*
import(_load.js): loadIt, getEasies, initEasies, updateAll, resizeWindow
*/
let awaitJSON, awaitNamed, loadTemplates, ns, ns_named;

const awaitFonts = [                 // start loading fonts asap
    new FontFace("Roboto Mono",
                 "url(/raf/test/fonts/RobotoMono.ttf)",
                 {weight:"400 500"}),
    new FontFace("Material Symbols Rounded",
                 "url(/raf/test/fonts/MaterialSymbolsRounded.woff2)")
];
awaitFonts.forEach(f => document.fonts.add(f));
//==============================================================================
document.addEventListener("DOMContentLoaded", loadCommon, false);
async function loadCommon() {
    let elm, i;
    PFactory.init();                 // raf.js infrastructure init
                                     // collect the HTMLElements by tag
    const byTag = [INPUT,"select","button","span","div","label","dialog",
                         "state-button","check-box"]
                  .map(v => [...document.body.getElementsByTagName(v)]);

    for (elm of [...byTag[0].splice(-1, 1), ...byTag[2].splice(-2, 2)])
        dlg[elm.id] = elm;           // break out <dialog> sub-elements by id

    for (elm of byTag.flat())        // populate elms by id
        if (elm.id)                  // most <label>, <span>, <div> have no id
            elms[elm.id] = elm;

                                     // elms.x doesn't disable the normal way
    byTag[0].splice(byTag[0].indexOf(elms.x), 1);
    Ez.readOnly(g, "buttons",  byTag[2]);          // <button>
    Ez.readOnly(g, "playback", byTag.at(-2));      // <state-button> #play,#stop
    Ez.readOnly(g, "disables", [...byTag[0],       // <input>
                                ...byTag[1],       // <select>
                                ...byTag.at(-1)]); // <check-box>

    elm = elms.plays ?? elms.plays0; // plays0 is multi
    for (i = 1; i <= COUNT; i++)
        elm.add(new Option(i));

    const id  = document.documentElement.id;
    const pre = `${id}-`;           // prefix by document
    Ez.readOnly(g, "keyName", `${pre}name`);
    Ez.readOnly(g, "restore", `${pre}restore`);
    const restore    = localStorage.getItem(g.restore);
    const hasVisited = Boolean(restore);

    const dir = `./${id}/`;          // directory path relative to this module
    ns = await import(`${dir}_load.js`).catch(errorAlert);
    ns.loadIt(byTag, hasVisited);

    const isMulti = (id[0] == "m");
    const awaitUpdate = loadUpdate(isMulti, dir);

    awaitNamed = Ez.promise();       // resolves in loadJSON()
    awaitJSON  = Ez.promise();       // ditto
    const msg  = "Presets and tooltips are unavailable, "
               + "error fetching common.json";
    fetch("../common.json")
      .then (rsp => loadJSON(rsp, isMulti, dir, pre, ns, hasVisited, msg))
      .catch(err => errorAlert(err, msg));

    Promise.all([...awaitFonts, awaitUpdate, awaitNamed, awaitJSON])
      .then (()  => loadFinally(hasVisited, restore, id))
      .catch(errorAlert);

    window.addEventListener("resize", ns.resizeWindow, false);
}
//==============================================================================
// loadJSON() executes on fetch(common.json).then(), could be inlined & indented
function loadJSON(response, isMulti, dir, pre, ns, hasVisited, msg) {
    if (!response.ok) {
        alert(`${msg}:\nHTTP error, status = ${response.status}`);
        return;
    } //--------------------------
    response.json().then(json => {
        let elm, id, title;
        g.presets = json.presets;  // must precede loadNamed(), loadFinally()
        loadNamed(isMulti, dir, pre, ns)
          .then(namespace => {
            ns_named = namespace;
            awaitNamed.resolve();
        }).catch(err =>
            awaitNamed.reject(err) // let Promise.all() handle it
        );
        getNamed();                // populate elms.named from localStorage
        ns.getEasies(hasVisited);  // populate lists for E.steps || multi
        for ([id, title] of Object.entries(json.titles)) {
            elm = elms[id];        // apply titles to elements
            if (Is.Element(elm)) {
                elm.title = title;
                if (elm.labels?.[0])
                    elm.labels[0].title = elm.title;
            }
        }
        awaitJSON.resolve();
    });
}
//==============================================================================
// loadFinally() executes on Promise.all().then(), could be inlined & indented
function loadFinally(hasVisited, restore, id) {
    let obj;
    ns.resizeWindow();
    elms.x.value = 0;        // re-opening the page might use previous value

    if (hasVisited) {        // user has previously visited this page
        const name = localStorage.getItem(g.keyName);
        const item = getLocalNamed(name);
        disableSave(item == restore);
        disablePreset(name, item);
        disableDelete(name);
        elms.named.value = name;
        obj = ns_named.formFromObj(JSON.parse(restore));
    }
    else {                   // user has never visited this page
        setTime();           // must set msecs prior to ezX = new Easy()
        obj = ns_named.objFromForm(hasVisited);
        setNamed(DEFAULT_NAME, JSON.stringify(obj));
    }

    ezX = new Easy({time:msecs, end:MILLI}); //*05
    raf = new AFrame;
    if (!ns.initEasies(obj)) // sets g.easies, raf.targets = g.easies
        return;
    //--------------------
    const af = new AFrame;
    af.fpsBaseline()         // estimate the device frame rate
      .then(fps => {
        const rounded = AFrame.fpsRound(fps.value);
        if (elms.fps)        // multi only
            elms.fps.textContent = `${rounded}fps`;
        FPS = rounded;
        logBaseline(fps, rounded);
      })
      .catch(err => errorLog(err, "fpsBaseline() failed"))
      .finally(() => {       // .catch(fpsBaseLine() only), the show can go on
        ns.updateAll(true);
        Object.seal(g);
        Object.freeze(elms);
                             // fade document.body into view
        const ez = new Easy({time:800, type:E.expo, io:E.in});
        ez.newTarget({elm:document.body, prop:P.o});
        af.newEasies([ez]);
        af.play()
          .catch(err => {    // don't alert the user, just display the page
            document.body.style.opacity = ONE;
            errorLog(err, "Fade-in animation failed");
          })
          .finally(()  => {  // service worker manages caching
            navigator.serviceWorker.register("../sw.js")
              .then (reg => { // runs in the background after page displayed
                const sw = reg.installing ?? reg.waiting ?? reg.active;
                if (sw)      // message adds document-specific files to the cache
                    if (reg.active)
                        sw.postMessage({id});
                    else     // wait until activated
                        sw.addEventListener("statechange", (evt) => {
                            console.log("state:", evt.target.state);
                            if (evt.target.state == "activated")
                                sw.postMessage({id});
                        });
            }).catch(errorLog);
          });
    });
}
// logBaseline is not strictly necessary, but I think it's still useful
function logBaseline(fps, rounded) {
    const rounding = rounded - fps.value;
    const decimals = 6; // milliseconds to 6 decimal places = nanoseconds
    const digits1  = fps.value >= 100 || rounded >= 100 ? 3 : 2;
    const digits2  = digits1 + 1 + decimals;
    const frames   = fps.times.length;
    console.log(
        "frames:  ", formatNumber(frames,    digits1),
      "\nrounded: ", formatNumber(rounded,   digits1) + "fps",
      "\nvalue:   ", formatNumber(fps.value, digits2, decimals),
      "\nrounding:", formatNumber(rounding,  digits2, decimals),
      "\n-------------------",
      "\nms/frame:", formatNumber(fps.msecs, digits2, decimals),
      "\nmax diff:", formatNumber(fps.diff,  digits2, decimals),
      "\nrange:   ", formatNumber(fps.range, digits2, decimals),
      "\nsample:   ", fps.sample   .map(roundTo6),
      "\ndiffs:    ", fps.diffs    .map(roundTo6),
      "\nintervals:", fps.intervals.map(roundTo6),
      "\ntimes:    ", fps.times    .map(roundTo6)
    );
}
function roundTo6(n) { // helps logBaseline()
    return Number(n.toFixed(6));
}
//==============================================================================
// setTime() sets the msecs and secs variables, gets document-specific msecs
function setTime() {
    msecs = ns.getMsecs();  // milliseconds are primary
    secs  = msecs / MILLI;  // seconds are for display purposes only
}