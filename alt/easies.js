class Easies {
// _returnTrip is a hypothetical way to do MEaser roundTrip && !autoTrip.
//             It is not currently used nor is it functional. Too funky to be
//             worth it at this time, if ever. Requires modifying the MEaser's
//             #mask and #calc, the latter being inside the bottom-level class.
    _returnTrip() {
        let easy, mask, t;
        const easies  = this.easies;    // as Array
        if (this.status == E.tripped) {
            const tripped = easies.filter(ez => ez.e.status == E.tripped);
            if (tripped.length) {
                this.#active = new Set(tripped);
                for (easy of tripped)   // filter out targets with autoTripping
                    for (t of easy.targets)
                        if (t.autoTripping)
                            easy.cutTarget(t);
                for (t of this.#targets)
                    for ([easy, mask] of t.easies)
                        if (!tripped.includes(easy)) {
                            //++remove from #mask and #calc...
                        }
            }
            return true;
        }
        this.#active = new Set(this.#easies);
        return false;
    }
}