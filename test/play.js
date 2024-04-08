export {loadPlay, changeStop};

import {E} from "../raf.js";

import {ezX, raf} from "./load.js";
import {updateCounters, updateTime, setDuration, setFrames}
                  from "./update.js";
import {MILLI, ZERO, ONE, TWO, LITE, CHANGE, elms, g, toggleClass, errorAlert}
                  from "./common.js";

let ns; // _update.js namespace: refresh, formatPlay, flipZero (easings)
//==============================================================================
// -- Button States --
// initial: PLAY   STOP  = stop disabled
// playing: PAUSE  STOP  = hiLite, disable everything else
// pausing: RESUME STOP  = hiLite, re-enable everything else
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
    if (elms.play.value == PAUSE)       // PAUSE: pause it
        raf.pause();
    else {                              // PLAY or RESUME: play it or resume it
        if (elms.play.value == PLAY) {  // play it
            g.frameIndex = 0;
            ns.newTargets();
            ns.formatPlayback?.(true);
            elms.stop.disabled = false;
        }
        formatPlay(true);
        disablePlay(true);
        elms.play.value = PAUSE;
        elms.stop.value = STOP;
        raf.play()
          .then(sts => {                // ...some time later:
            if (!resetPlay(sts == E.pausing)) {
                if (ezX.e.status > E.tripped)
                    return;             // user clicked #stop, called raf.stop()
                //----------------------// else animation ends:
                setFrames(g.frameIndex);
                setDuration(raf.elapsed / MILLI);
                ns.flipZero?.();        // !multi //!!what about multi??
                elms.x   .value = g.frameIndex;
                elms.stop.value = RESET;
                if (!ezX.e.status)      // only enabled for status == E.tripped
                    elms.play.disabled = true;
            } // else sts == E.pausing, resuming from pause
        }).catch(errorAlert);
    }
}
// changeStop() handles the click event for #stop and is called w/o evt arg by
//              pseudoAnimate(), openNamed(), changeCheck(), changeLoopByElm(),
//              multi updateAll().
function changeStop(evt) {
    if (elms.stop.disabled) return; // nothing to do that hasn't been done
    //-----------------------------
    elms.x.value = 0;
    elms.stop.value = STOP;
    elms.stop.disabled = true;      // must precede ns.refresh()
    elms.play.disabled = false;
    if (elms.play.value == PLAY) {  // play = disabled, stop = RESET
        setDuration();
        if (evt) {
            updateTime();
            raf.stop();             // resolves promise => raf.play.then() above
            ns.refresh();           // calls pseudoAnimate()=>changeStop()
        }
    }
    else {                          // play = PAUSE|RESUME, stop = STOP
        if (raf.isPausing)          // play = RESUME
            resetPlay()             // pause resolved the promise already
        raf.stop();                 // cancels animation, resolves promise
    }
    updateCounters();
    ns.formatPlayback?.(false, Boolean(evt));
}
function reset() {

}
//==============================================================================
// resetPlay() helps changePlay(), changeStop()
function resetPlay(isPausing) {
    elms.play.value = isPausing ? RESUME : PLAY;
    formatPlay(false);
    disablePlay(false);
    if (elms.mid)           // easings only
        toggleClass(elms.mid, LITE[0], false);

    return isPausing;
}
// formatPlay() helps changePlay(), changeStop() via resetPlay()
function formatPlay(isPlaying) { // isPlaying is true or false, never undefined
    const lite = LITE[1];        // "hi"
    for (var elm of g.playback)  // [#play, #stop]
        toggleClass(elm, lite, isPlaying);
}
// disablePlay() helps changePlay(), changeStop() via resetPlay()
function disablePlay(b) {
    for (var elm of [...g.disables, ...g.buttons.filter(btn => btn.dataset.enabled)])
        setAttrBool(elm, "disabled", b);
    elms.x.style.pointerEvents = b ? "none" : "";
    elms.x.tabIndex = b ? -1 : 0;
}
// setAttrBool() helps with disabled, checked, and other boolean attributes
function setAttrBool(elm, attr, b) { // only used by disablePlay()
    b ? elm.setAttribute(attr, "")
      : elm.removeAttribute(attr);
}