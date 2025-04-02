"use strict";

export class Memory {
    private key: string;
    private value: number;

    constructor(key: string) {
        this.key = key;

        const storedMemory = Number(localStorage.getItem(key));
        if (storedMemory && !isNaN(storedMemory))
            this.value = storedMemory;
        else
            this.value = 0;
    }

    storeCurrentValue(): void {
        localStorage.setItem(this.key, this.value.toString());
    }

    assertNumber(x: unknown): number {
        const num = Number(x);
        if (!isFinite(num)) {
            const msg = "Only Numbers are allowed to add inside memory";
            alert(msg);
            throw new TypeError(msg);
        }

        return num;
    }

    clearMemory(): void {
        this.value = 0;
        this.storeCurrentValue();
    }

    recallFromMemory(): number {
        return this.value;
    }

    addToMemory(x: unknown): void {
        this.value += this.assertNumber(x);
        this.storeCurrentValue();
    }

    subtractFromMemory(x: unknown): void {
        this.value -= this.assertNumber(x);
        this.storeCurrentValue();
    }

    storeMemory(x: unknown): void {
        this.value = this.assertNumber(x);
        this.storeCurrentValue();
    }

}
