export let
FPS = 60,    // assumes 60hz, but adjusts to reality at run-time
ezX, raf,    // Easy, AFrame
preDoc;      // prefix for this document, see local-storage.js

import {U, E, Ez, P, PFactory, Easy, Easies, AFrame} from "../raf.js";

import {getNamed, getNamedBoth, setNamed}            from "./local-storage.js";
import {msecs, loadUpdate, timeFrames, formatNumber} from "./update.js";
import {DEFAULT_NAME, loadNamed, disableSave, disablePreset, disableDelete}
                                                     from "./named.js";

import {MILLI, COUNT, ONE, INPUT, SELECT, BUTTON, DIV, LABEL, dlg, elms, g,
        dummyEvent, errorAlert, errorLog} from "./common.js";
/*
import(_load.js): loadIt, getEasies, initEasies, updateAll, resizeWindow;
                  and showControls for color page.
*/
let awaitNamed, awaitUpdate, ns, ns_named;
const RESIZE = "resize";

const awaitFonts = [            // start loading fonts asap
    new FontFace("Roboto",
                 "url(/fonts/Roboto-Regular.ttf)",
                 {weight:"400"}),
    new FontFace("Roboto",
                 "url(/fonts/Roboto-Medium.ttf)",
                 {weight:"500"}),
    new FontFace("Roboto Mono",
                 "url(/fonts/RobotoMono.ttf)",
                 {weight:"400 500"}),
    new FontFace("Material Symbols Rounded",
                 "url(/fonts/MaterialSymbolsRounded.woff2)")
];
awaitFonts.forEach(f => document.fonts.add(f));
//==============================================================================
document.addEventListener("DOMContentLoaded", loadCommon, false);
async function loadCommon() {
    let elm, i;                      // collect HTMLElements by tag, then by id
    PFactory.init();                 // raf.js infrastructure init

    const tags = [INPUT, SELECT, BUTTON, "dialog", DIV, LABEL,"span",
                  "state-button","check-box"];

    const byTag = tags.map(tag => [...document.body.getElementsByTagName(tag)]);

    if (byTag[3].length)             // break out <dialog> sub-elements by id:
        for (elm of [...byTag[0].splice(-1, 1),         // last <input>
                     ...byTag[2].splice(-3, 3),         // last 3 <button>s
                     document.getElementById("icon"),   // <img>
                     document.getElementById("title"),  // <p>
                     document.getElementById("msg")])   // <p>
            dlg[elm.id] = elm;

    for (elm of byTag.flat())        // populate elms by id
        if (elm.id)                  // most <div>, <label>, <span>s have no id
            elms[elm.id] = elm;
                                     // elms.x doesn't disable the normal way
    byTag[0].splice(byTag[0].indexOf(elms.x), 1);
    Ez.readOnly(g, "buttons",  byTag[2]);          // <button>, see disablePlay()
    Ez.readOnly(g, "playback", byTag.at(-2));      // <state-button> #play,#stop
    Ez.readOnly(g, "disables", [...byTag[0],       // <input>
                                ...byTag[1],       // <select>
                                ...byTag.at(-1)]); // <check-box>
    Ez.readOnly(g, "invalids", new Set);           // <input>s w/invalid values

    elm = elms.plays ?? elms.plays0; // plays0 is multi
    if (elm)
        for (i = 1; i <= COUNT; i++)
            elm.add(new Option(i));

    const msg = "Error fetching common.json: presets & tooltips are unavailable";
    const id  = document.documentElement.id;
    const dir = `./${id}/`;         // directory path relative to this module
    preDoc    = `${id}-`;           // prefix by document, see local-storage.js

    Ez.readOnly(g, "keyName", `${preDoc}name`);
    let name = localStorage.getItem(g.keyName);
    const hasVisited = (name !== null);

    ns = await import(`${dir}_load.js`).catch(errorAlert);
    const is = ns.loadIt(byTag, hasVisited);

    awaitNamed  = Ez.promise();      // resolves in loadJSON()
    awaitUpdate = Ez.promise();      // ditto
    fetch("../common.json")
      .then (rsp => loadJSON(rsp, is.multi, dir, ns, hasVisited, msg))
      .catch(err => errorAlert(err, msg));

    Promise.all([document.fonts.ready, awaitNamed, awaitUpdate])
      .then (()  => loadFinally(is, name, hasVisited, id))
      .catch(err => errorAlert(err));

    window.addEventListener(RESIZE, ns.resizeWindow, false);
}
//==============================================================================
// loadJSON() executes on fetch(common.json).then(), could be inlined & indented
function loadJSON(response, isMulti, dir, ns, hasVisited, msg) {
    if (response.ok)
        response.json().then(json => {
            g.presets = json.presets;  // must precede loadNamed()
            loadNamed(isMulti, dir, ns)
              .then(namespace => {
                ns_named = namespace;
                awaitNamed.resolve();
            }).catch(
                awaitNamed.reject      // let Promise.all() handle it
            );
            loadUpdate(isMulti, dir)
              .then (() => {
                ns.getEasies(hasVisited, json);
                awaitUpdate.resolve();
            }).catch(
                awaitUpdate.reject
            );

            getNamed();                // populate elms.named from localStorage
            let elm, id, title;        // apply titles to elements and labels
            for ([id, title] of Object.entries(json.titles)) {
                elm = elms[id];
                if (elm) {
                    elm.title = title;
                    if (elm.labels?.[0])
                        elm.labels[0].title = title;
                }
            }
        }).catch(err => alert(`${msg}\n${err.stack ?? err}`));
    else
        alert(`${msg}\nHTTP error ${response.status} ${response.statusText}`);
}
//==============================================================================
// loadFinally() executes on Promise.all().then(), could be inlined & indented:)
function loadFinally(is, name, hasVisited, id) {
    let obj;
    if (elms.save)
        Ez.readOnly(g, "restore", `${preDoc}restore`);

    if (hasVisited) {        // user has previously visited this page
        let item;
        [item, obj] = getNamedBoth(name);
        if (elms.save){      // exclude color page
            const
            restore = localStorage.getItem(g.restore),
            isSame  = (item == restore);
            disableSave(isSame);
            disablePreset(name, item);
            disableDelete(name);
            if (!isSame)
                obj = JSON.parse(restore);
        }
        ns_named.formFromObj(obj);
        elms.x.value = 0;    // re-opening the page might use previous value
        elms.named.value = name;
    }
    else {                   // user has never visited this page
        elms.time?.dispatchEvent(dummyEvent(INPUT, "isLoading")) ?? timeFrames();
        obj = ns_named.objFromForm(hasVisited);
        setNamed(DEFAULT_NAME, JSON.stringify(obj));
    }
    if (is.multi)
        window.dispatchEvent(new Event(RESIZE));

    // msecs and secs are now set, by formFromObj() or time.dispatchEvent().
    // ezX animates elms.x in all pages, and the x-axis of the chart in the
    // easings page. end:MILLI is for easings only; it allows easings chart.x to
    // have no factor at all, while testing Easy end values and burdening elms.x
    // with a divisor in its factor calculation - see updateTime().
    ezX = new Easy({time:msecs, end:MILLI}); //*05
    raf = new AFrame;
    if (!ns.initEasies(obj, hasVisited))
        return;
    //----------------
    ns.updateAll(obj);
    if (!is.multi)
        window.dispatchEvent(new Event(RESIZE));

    Object.seal(g);
    Object.seal(elms);       // can't freeze: color page elms.named is variable

    const af = new AFrame;
    af.fpsBaseline()         // discover the device's screen refresh rate
      .then(fps => {
        const rounded = AFrame.fpsRound(fps.value);
        FPS = rounded;
        logBaseline(fps, rounded);
        if (elms.fps)        // multi and color
            elms.fps.textContent = `${rounded}fps`;
        else                 // easings
            elms.frames.title = `@${rounded}fps - for more detail see the Developer Tools console`;
    }).catch(err =>          // .catch = fpsBaseLine() only, the show can go on
        errorLog(err, "fpsBaseline() failed")
     ).finally(() => {       // fade document.body into view
        let
        time = 750,
        ez   = new Easy({time, type:E.expo}),
        ezs  = af.newEasies([ez]),
        elm  = ns.easeFinally?.(af, ezs, ez, time, is) // color page only
            ?? document.body;
        ez.newTarget({elm, prop:P.o});  // opacity
        af.oneShot = true;   // needs testing, see if (showDialog) below

        const showDialog = !hasVisited && is.easings;
        if (showDialog) {
            dlg.icon.src = "/icons/info.svg";
            dlg.title.textContent = "Welcome to the rAF easings page."
            dlg.msg.innerHTML =
                "I suggest you begin by exploring the presets in the "
                + "<span>Name</span> drop-down at the bottom, left."
            ;                           // just for this one message:
            elms.msgBox.style.transitionDelay = "750ms";
            elms.msgBox.showModal();
        }
        af.play()
          .catch(err => {    // don't alert the user, just display the page
            errorLog(err, "Fade-in animation failed");
            P.opacity.setIt(elm, ONE);
            P.filter .setIt(elm, "none"); // not all pages require this
          })
          .finally(() => {
            if (showDialog) {
                elms.msgBox.style.transitionDelay = "";
                elm = elms.named;
                obj = {time:750, roundTrip:true};
                const
                props = [P.color, P.borderColor, P.borderRadius, P.boxShadow],
                boxSh = {elm, mask:[2], cV:"0 0 0rem red"},
                cbCbR = {elm, start:E.cV},

                ez2 = new Easy({wait:3750, ...obj});
                ez  = new Easy({wait:3000, ...obj, tripWait:1500,
                                type:E.pow, pow:2, io:E.out});

                ez .newTarget({prop:props[0], ...cbCbR, end:"red"});
                ez .newTarget({prop:props[1], ...cbCbR, end:"red"});
                ez2.newTarget({prop:props[2], ...cbCbR, distance:E.cV});
                ez .newTarget({prop:props[3], ...boxSh, distance:1});
                ez2.newTarget({prop:props[3], ...boxSh, start:1, end:0.25});

                af.addTarget(new Easies([ez, ez2])); // af.oneShot == true
                af.play().catch(err => {             // must precede showModal()
                    errorLog(err, "elms.named animation failed");
                    for (const p of props)
                        p.cut(elm);
                });
            }
      //++})
      //++.finally(()  => {  // service worker manages caching
      //++  navigator.serviceWorker.register("../sw.js")
      //++    .then (reg => { // runs in the background after page displayed
      //++      const sw = reg.installing ?? reg.waiting ?? reg.active;
      //++      if (sw)      // message adds document-specific files to the cache
      //++          if (reg.active)
      //++              sw.postMessage({id});
      //++          else     // wait until activated
      //++              sw.addEventListener("statechange", evt => {
      //++                  if (evt.target.state == "activated")
      //++                      sw.postMessage({id});
      //++              });
      //++  }).catch(errorLog);
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