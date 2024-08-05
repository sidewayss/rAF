export {loadPlay, changeStop};

import {E, P} from "../raf.js";

import {ezX, raf} from "./load.js";
import {frameIndex, updateCounters, updateTime, setDuration, prePlay}
                  from "./update.js";
import {MILLI, ZERO, ONE, TWO, LITE, CHANGE, elms, g, toggleClass, errorAlert}
                  from "./common.js";

let ns; // _update.js namespace: refresh, formatPlay, postPlay (easings)
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
            prePlay();
            ns.newTargets();
            ns.formatPlayback?.(true);   // multi only
            elms.stop.disabled = false;
        }
        formatPlay(true);
        disablePlay(true);
        elms.play.value = PAUSE;
        elms.stop.value = STOP;
        raf.play()
          .then(sts => {                // if (!pausing and !#stop.onclick)
            if (!resetPlay(sts == E.pausing) || ezX.e.status <= E.tripped) {
                if (!ezX.e.status)      // E.arrived, not E.tripped
                    elms.play.disabled = true;
                elms.stop.value = RESET;
                setDuration(raf.elapsed / MILLI, frameIndex, true);
                elms.x.value = frameIndex;
                ns.postPlay?.();        // color doesn't need it //!!multi does
            }
        }).catch(errorAlert);
    }
}
// changeStop() handles the click event for #stop and is called w/o evt arg by
//              pseudoAnimate(), and: easings change.trip.plays.wait.loopByElm()
//              and color click.roundT() to handle cases where sts == E.arrived
//              and pseudoAnimate() is not called.
function changeStop(evt) {
    if (elms.stop.disabled) return; // nothing to do that hasn't been done
    //-----------------------------
    elms.x.value = 0;
    elms.stop.value = STOP;
    elms.stop.disabled = true;      // must precede ns.refresh() below!!
    switch (elms.play.value) {
    case RESUME:                    // stop = STOP,  e.status == E.pausing
        resetPlay();                // was pausing, promise resolved previously
    case PAUSE:                     // stop = STOP,  e.status >  E.tripped
        raf.stop(true);             // was playing, resolves promise, cancelAF()
        break;                      // sets e.everything to E.original
    case PLAY:                      // stop = RESET, e.status <= E.tripped
        elms.play.disabled = false; // play.disabled = true, except
        setDuration();              // when E.tripped && !autoTrip.
        updateTime();
    }                               // only easings refresh() uses target arg:
    if (evt !== null)               // null = called by pseudoAnimate()
        ns.refresh(evt?.target);    // calls pseudoAnimate()=>changeStop(null)!!
    updateCounters();
    ns.formatPlayback?.(false);
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