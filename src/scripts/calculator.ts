"use strict";

import { Display } from "./display.ts";
import { Memory } from "./memory.ts";
import { History } from "./history.ts";

interface CalculatorElementIDs {
    displayId: string,
    btnsId: string,
    degRanBtnId: string,
    fnModeBtnId: string,
    resultModeBtnId: string,
    sinBtnId: string,
    cosBtnId: string,
    tanBtnId: string,
    historyListId: string, 
    clearHistoryBtnId: string,
}

export class Calculator {
    private display: Display;
    private btns: HTMLElement;
    private abortController: AbortController;
    private degRadBtn: HTMLButtonElement;
    private fnModeBtn: HTMLButtonElement;
    private resultModeBtn: HTMLButtonElement;
    private sinBtn: HTMLButtonElement;
    private cosBtn: HTMLButtonElement;
    private tanBtn: HTMLButtonElement;
    private evaluator: Worker;
    private memory: Memory;
    private historyList: HTMLElement;
    private clearHistoryBtn: HTMLButtonElement;
    private history: History;

    constructor(memoryKey: string, historyKey: string, elementIDs: CalculatorElementIDs) {
        this.display = new Display(elementIDs.displayId);
        this.btns = document.querySelector(`#${elementIDs.btnsId}`) as HTMLElement;
        this.abortController = new AbortController();

        this.degRadBtn = document.querySelector(`#${elementIDs.degRanBtnId}`) as HTMLButtonElement;
        this.fnModeBtn = document.querySelector(`#${elementIDs.fnModeBtnId}`) as HTMLButtonElement;
        this.resultModeBtn = document.querySelector(`#${elementIDs.resultModeBtnId}`) as HTMLButtonElement;

        this.sinBtn = document.querySelector(`#${elementIDs.sinBtnId}`) as HTMLButtonElement;
        this.cosBtn = document.querySelector(`#${elementIDs.cosBtnId}`) as HTMLButtonElement;
        this.tanBtn = document.querySelector(`#${elementIDs.tanBtnId}`) as HTMLButtonElement;

        this.evaluator = new Worker(new URL('workers/evaluator.ts', import.meta.url));

        this.memory = new Memory(memoryKey);

        this.historyList = document.querySelector(`#${elementIDs.historyListId}`) as HTMLElement;
        this.clearHistoryBtn = document.querySelector(`#${elementIDs.clearHistoryBtnId}`) as HTMLButtonElement;

        this.history = new History(historyKey, this.handleHistoryUpdate.bind(this));

        this.init();
    }

    // Add event handlers.
    private init(): void {
        this.btns.addEventListener("click", e => this.handleClickEvent(e), { signal: this.abortController.signal });
        document.addEventListener("keydown", e => this.handleKeyEvents(e), { signal: this.abortController.signal });
        this.evaluator.addEventListener("message", e => this.handleResult(e as MessageEvent), { signal: this.abortController.signal });
        this.clearHistoryBtn.addEventListener("click", () => this.history.clear(), { signal: this.abortController.signal });
    }

    // Handle click events from buttons using event delegation.
    private handleClickEvent(e: Event): void {
        const btn = (e.target as HTMLElement).closest("button.btn") as HTMLButtonElement | null;

        if (!btn?.value) return;

        if (btn?.dataset?.type === "memory") {
            this.handleMemoryFunctions(btn.value);
        }
        else {
            this.handleInput(btn.value);
        }
    }

    // Handle Key Events.
    private handleKeyEvents(e: KeyboardEvent): void {
        this.handleInput(e.key);
    }

    // Actual Logic to handle input from both Keyboard and Button click
    private handleInput(input: string): void {
        if (!isNaN(Number(input))) {
            this.display.append(input);
            return;
        }

        input = input.toLowerCase();

        switch (input) {
            case "c":
            case "clear":
                this.display.clear();
                return;
            case "backspace":
                this.display.backspace();
                return;
            case "+":
            case "-":
            case "*":
            case "/":
            case ".":
            case "(":
            case ")":
                this.display.append(input);
                return;
            case "=":
            case "enter":
                this.sendQuery(this.display.get());
                return;
            case "e":
                this.display.append(input);
                return;
            case "pi":
                this.display.append("π");
                return;
            case "square":
                this.display.append("^2");
                return;
            case "sqrt":
                this.display.append("√");
                return;
            case "power10":
                this.display.append("10^");
                return;
            case "^":
            case "power":
                this.display.append("^");
                return;
            case "reciprocal":
                this.display.append("1/");
                return;
            case "!":
            case "factorial":
                this.display.append("!");
                return;
            case "log":
                this.display.append("log(");
                return;
            case "ln":
                this.display.append("ln(");
                return;
            case "%":
            case "mod":
                this.display.append("%");
                return;
            case "exp":
                this.display.append("e^");
                return;
            case "abs":
                this.display.append("abs(");
                return;
            case "plusminus":
                this.sendQuery(`(-1) * (${this.display.get()})`);
                return;
            case "sin":
            case "cos":
            case "tan":
            case "asin":
            case "acos":
            case "atan":
            case "floor":
            case "ceil":
            case "round":
            case "cbrt":
                this.display.append(`${input}(`);
                return;
            case "deg":
            case "rad":
                this.toggleDegRad();
                return;
            case "fn1":
            case "fn2":
                this.toggleFnMode();
                return;
            case "f-e":
            case "ex":
                this.toggleResultMode();
                return;
        }
    }

    private handleMemoryFunctions(input: string): void {
        switch(input) {
            case "mc":
                this.memory.clearMemory();
                return;
            case "mr":
                this.display.set(this.memory.recallFromMemory());
                return;
            case "m+":
                this.memory.addToMemory(this.display.get());
                return;
            case "m-":
                this.memory.subtractFromMemory(this.display.get());
                return;
            case "ms":
                this.memory.storeMemory(this.display.get());
                return;
        }
    }

    private handleHistoryUpdate(history: Array<{ query: string; result: string }>) {
        this.historyList.innerHTML = "";

        if (!history.length) {
            this.historyList.innerHTML = `<li>[ No history available ]</li>`;
            return;
        }

        history.forEach((item) => {
            const li = document.createElement("li");
            if (!li || !item?.query || !item?.result) return; 

            li.textContent = `${item.query} =  ${item.result}`;

            this.historyList.prepend(li);
        });

    }


    private sendQuery(query: string): void {
        this.evaluator.postMessage({
            query,
            degreeMode: this.degRadBtn.value === "deg",
            exponentialResult: this.resultModeBtn.value === "ex",
        });
    }


    // Handle message events from evaluator worker.
    private handleResult(e: MessageEvent): void {
        if (e.data.success) {
            this.display.set(e.data.result);
            if (e.data.query.toString() !== e.data.result.toString())
                this.history.addEntry(e.data.query, e.data.result);
        }
        else {
            alert(`Error: ${e.data.error.message}`);
            console.error(e.data.error);
        }
    }

    private toggleDegRad() {
        const isDeg = this.degRadBtn.value === "deg";
        this.degRadBtn.value = isDeg ? "rad" : "deg";
        this.degRadBtn.textContent = isDeg ? "RAD" : "DEG";
        this.degRadBtn.ariaLabel = isDeg ? "Radian Mode" : "Degree Mode";
    }

    private toggleFnMode() {
        const is2ndMode = this.fnModeBtn.value === "fn2";
        this.fnModeBtn.value = is2ndMode ? "fn1" : "fn2";
        this.fnModeBtn.innerHTML = is2ndMode ? "Primary" : "2<sup>nd</sup>";
        this.fnModeBtn.ariaLabel = is2ndMode ? "Primary Function Mode" : "Second Function Mode";

        this.sinBtn.value = this.sinBtn.ariaLabel = this.sinBtn.textContent = is2ndMode ? "asin" : "sin";
        this.cosBtn.value = this.cosBtn.ariaLabel = this.cosBtn.textContent = is2ndMode ? "acos" : "cos";
        this.tanBtn.value = this.tanBtn.ariaLabel = this.tanBtn.textContent = is2ndMode ? "atan" : "tan";
    }

    private toggleResultMode() {
        const isDefaultMode = this.resultModeBtn.value === "f-e";
        this.resultModeBtn.value = isDefaultMode ? "ex" : "f-e";
        this.resultModeBtn.textContent = isDefaultMode ? "E" : "F-E";
        this.resultModeBtn.ariaLabel = isDefaultMode ? "Scientific Notation Mode" : "Default Notation Mode";
    }

    // Remove all event handlers and terminate evaluator worker.
    destroy() {
        this.abortController?.abort();
        this.evaluator?.terminate();
    }
}
