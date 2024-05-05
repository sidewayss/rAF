export {loadPlay, changeStop};

import {E, P} from "../raf.js";

import {ezX, raf} from "./load.js";
import {updateCounters, updateTime, updateDuration, setFrames}
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
// changePlay() is the change event handler for #play
function changePlay() {
    if (elms.play.value == PAUSE)        // PAUSE
        raf.pause();
    else {                               // PLAY or RESUME
        if (elms.play.value == PLAY) {
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
          .then(sts => {                 // ...some time later:
            if (!resetPlay(sts == E.pausing)) {
                if (ezX.e.status > E.tripped)
                    return;              // user clicked #stop
                //---------------------- // else animation ends:
                setFrames(g.frameIndex); // don't call timeFrames(), updateTime()
                updateDuration(raf.elapsed / MILLI);
                ns.flipZero?.();         // !multi //!!what about multi??
                elms.x   .value = g.frameIndex;
                elms.stop.value = RESET;
                if (!ezX.e.status)       // only enabled for status == E.tripped
                    elms.play.disabled = true;
            } // else sts == E.pausing
        }).catch(errorAlert);
    }
}
// changeStop() handles the click event for #stop and is called w/o evt arg by
//              pseudoAnimate(), and: easings change.trip.plays.wait.loopByElm()
//              and color click.roundT() to handle cases where sts == E.arrived
//              and pseudoAnimate() is not called.
function changeStop(evt) {
    if (elms.stop.disabled) return; // nothing to do that hasn't been done
    //----------------------------- // only occurs if (!evt)
    elms.x.value = 0;
    elms.stop.value = STOP;
    elms.stop.disabled = true;      // must precede ns.refresh() below!!
    elms.play.disabled = false;
    const val = elms.play.value;
    if (val == PAUSE)               // stop = STOP
        raf.stop();                 // - cancels animation, resolves promise
    else {                          // the promise is already resolved:
        if (val == RESUME)          // stop = STOP
            resetPlay();
        else { // (val == PLAY)     // stop = RESET, play.disabled = true
            setFrames();            // - revert to pseudo-frames
            updateTime();           //         and pseudo-time
            updateDuration();
        }
        if (evt)                    // user clicked stop
            ns.refresh();           // calls pseudoAnimate()=>changeStop()!!
    }
    updateCounters();
    ns.formatPlayback?.(false, Boolean(evt));
}
//==============================================================================
// resetPlay() helps changePlay(), changeStop()
function resetPlay(isPausing) {
    formatPlay(false);
    disablePlay(false, isPausing);
    elms.play.value = isPausing ? RESUME : PLAY;
    if (elms.mid)
        toggleClass(elms.mid, LITE[0], false); // easings only
    return isPausing;
}
// formatPlay() helps changePlay(), resetPlay()
function formatPlay(isPlaying) { // isPlaying is true or false, never undefined
    const lite = LITE[1];        // "hi"
    for (var elm of g.playback)  // [#play, #stop]
        toggleClass(elm, lite, isPlaying);
}
// disablePlay() helps changePlay(), changeStop() via resetPlay()
function disablePlay(isPlaying, isPausing) {
    let elm
    for (elm of [...g.disables,
                 ...g.buttons.filter(btn => btn.dataset.enabled)])
        setAttrBool(elm, "disabled", isPlaying);

    elm = elms.x
    if (isPlaying) {
        P.enable(elm, false);
        elm.style.accentColor = "var(--dark-gray)";
    }
    else if (!isPausing) {  // elms.x stays pseudo-disabled while paused
        P.enable(elm, true);
        P.accentColor.cut(elm);
    }
}
// setAttrBool() helps with disabled, checked, and other boolean attributes
function setAttrBool(elm, attr, b) { // only used by disablePlay()
    b ? elm.setAttribute(attr, "")
      : elm.removeAttribute(attr);
}