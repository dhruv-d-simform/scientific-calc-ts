"use strict";

export class Memory {
    #value;

    constructor(key) {
        this.key = key;

        const storedMemory = Number(localStorage.getItem(key));
        if (storedMemory && !isNaN(storedMemory))
            this.#value = storedMemory;
        else
            this.#value = 0;
    }

    storeCurrentValue() {
        localStorage.setItem(this.key, this.#value);
    }

    assertNumber(x) {
        x = Number(x);
        if (!isFinite(x)) {
            const msg = "Only Numbers are allowed to add inside memory";
            alert(msg);
            throw new TypeError(msg);
        }

        return x;
    }

    clearMemory() {
        this.#value = 0;
        this.storeCurrentValue();
    }

    recallMemory() {
        return this.#value;
    }

    plusMemory(x) {
        x = this.assertNumber(x);

        this.#value += x;
        this.storeCurrentValue();
    }

    minusMemory(x) {
        x = this.assertNumber(x);

        this.#value -= x;
        this.storeCurrentValue();
    }

    storeMemory(x) {
        x = this.assertNumber(x);

        this.#value = x;
        this.storeCurrentValue();
    }

}
