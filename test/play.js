export {loadPlay, changeStop};

import {E} from "../raf.js";

import {ezX, raf} from "./load.js";
import {updateSidebar, updateTime, setDuration, setFrames}
                  from "./update.js";
import {MILLI, ZERO, ONE, TWO, LITE, CHANGE, elms, g, toggleClass, errorAlert}
                  from "./common.js";

let ns; // _update.js namespace: redraw, formatPlay, flipZero (easings)
//==============================================================================
// -- Button States --
// initial: PLAY   STOP  = stop disabled
// playing: PAUSE  STOP  = hilite, disable everything else
// pausing: RESUME STOP  = hilite, re-enable everything else
// arrived: PLAY   RESET = play disabled

// <state-button>.value
const PLAY   = ZERO; // #play
const PAUSE  = ONE;
const RESUME = TWO;
const STOP   = ZERO; // #stop
const RESET  = ONE;
//==============================================================================
function loadPlay(_update) {
    ns = _update;
    elms.play.addEventListener(CHANGE, changePlay, false);
    elms.stop.addEventListener(CHANGE, changeStop, false);
}
function changePlay() {
    if (elms.play.value == PAUSE)   // pause it
        raf.pause();
    else {                          // play it, resume it
        formatPlay(true);
        disablePlay(true);
        if (elms.play.value == PLAY) {
            g.frame = 0;            // play it
            ns.formatPlayback(true);
        }
        raf.play().then(sts => {    // ...some time later:
            resetPlay();
            if (sts == E.pausing)   // user pressed pause
                elms.play.value = RESUME;
            else {                  // stopped by user or animation ends
                if (ezX.e.status > E.tripped)
                    return;         // user clicked #stop, called raf.stop()
                //-----------------
                setFrames(g.frame); // arrived at end of animation
                setDuration(raf.elapsed / MILLI);
                ns.flipZero?.();    // !multi //!!what about multi??
                elms.x.value = g.frame;
                elms.stop.value = RESET;
                if (!ezX.e.status)  // !non-autoTrip outbound finished
                    elms.play.disabled = true;
            }
        }).catch(errorAlert);

        elms.stop.disabled = false;
        elms.stop.value = STOP;
        elms.play.value = PAUSE;
    }
}
function changeStop(evt) {  // <= pseudoAnimate(), openNamed(), changeCheck(),
    if (raf.isInit) return; //    changeLoopByElm(), multi updateAll()
    //----------------------------
    if (elms.play.value == PLAY) {  // PLAY: if (reset) evt might be defined
        setDuration();              //       else       evt is undefined
        if (evt && elms.stop.value == RESET) {
            updateTime();
            raf.init();
            ns.redraw();
        }
    }
    else {                          // PAUSE || RESUME: pause defines evt
        if (raf.isPausing)          //                  resume might define it
            resetPlay()             // pause resolved the promise already
        raf.init();                 // if (!loading) runs raf.play().then()
    }
    elms.x.value = 0;               // reset everything to zero
    elms.stop.value = STOP;
    elms.stop.disabled = true;
    elms.play.disabled = false;
    ns.formatPlayback(false, Boolean(evt));
    if (!raf.atOrigin)              //!!loading page yes, but loading named too??
        updateSidebar(0);
}
//==============================================================================
// resetPlay() helps changePlay(), changeStop()
function resetPlay() {
    formatPlay(false);
    disablePlay(false);
    elms.play.value = PLAY;
    if (elms.mid)           // easings only
        toggleClass(elms.mid, LITE[0], false);
}
// formatPlay() helps changePlay(), changeStop() via resetPlay()
function formatPlay(isPlaying) { // isPlaying is true or false, never undefined
    const lite = LITE[1];        // "hi"
    for (var elm of g.playback)  // [#play, #stop]
        toggleClass(elm, lite, isPlaying);
}
// disablePlay() helps changePlay(), changeStop() via resetPlay()
//               .enabled is an unauthorized extension of HTMLButtonElement
function disablePlay(b) {
    for (var elm of [...g.disables, ...g.buttons.filter(btn => btn.enabled)])
        setAttrBool(elm, "disabled", b);
    elms.x.style.pointerEvents = b ? "none" : "";
    elms.x.tabIndex = b ? -1 : 0;
}
// setAttrBool() helps disabled, checked, and other boolean attributes
function setAttrBool(elm, attr, b) { // only used by disablePlay()
    b ? elm.setAttribute(attr, "")
      : elm.removeAttribute(attr);
}