"use strict";

import { Display } from "./display.js";
import { Memory } from "./memory.js";
import { History } from "./history.js";

export class Calculator {

    constructor(memoryKey, historyKey, {
        displayId, btnsId, degRanBtnId, fnModeBtnId, resultModeBtnId, sinBtnId, cosBtnId, tanBtnId, historyListId, clearHistoryBtnId
    }) {
        this.display = new Display(displayId);
        this.btns = document.querySelector(`#${btnsId}`);
        this.abortController = new AbortController();

        this.degRadBtn = document.querySelector(`#${degRanBtnId}`);
        this.fnModeBtn = document.querySelector(`#${fnModeBtnId}`);
        this.resultModeBtn = document.querySelector(`#${resultModeBtnId}`);

        this.sinBtn = document.querySelector(`#${sinBtnId}`);
        this.cosBtn = document.querySelector(`#${cosBtnId}`);
        this.tanBtn = document.querySelector(`#${tanBtnId}`);

        this.evaluator = new Worker(new URL('workers/evaluator.js', import.meta.url));

        this.memory = new Memory(memoryKey);

        this.historyList = document.querySelector(`#${historyListId}`);
        this.clearHistoryBtn = document.querySelector(`#${clearHistoryBtnId}`);

        this.history = new History(historyKey, this.handleHistoryUpdate.bind(this));

        this.init();
    }

    // Add event handlers.
    init() {
        this.btns.addEventListener("click", e => this.handleClickEvent(e), { signal: this.abortController.signal });
        document.addEventListener("keydown", e => this.handleKeyEvents(e), { signal: this.abortController.signal });
        this.evaluator.addEventListener("message", e => this.handleResult(e), { signal: this.abortController.signal });
        this.clearHistoryBtn.addEventListener("click", () => this.history.clear(), { signal: this.abortController.signal });
    }

    // Handle click events from buttons using event delegation.
    handleClickEvent(e) {
        const btn = e.target.closest("button.btn");

        if (!btn?.value) return;

        if (btn?.dataset?.type === "memory") {
            this.handleMemoryFunctions(btn.value);
        }
        else {
            this.handleInput(btn.value);
        }
    }

    // Handle Key Events.
    handleKeyEvents(e) {
        this.handleInput(e.key);
    }

    // Actual Logic to handle input from both Keyboard and Button click
    handleInput(input) {
        if (typeof input !== "string")
            throw new TypeError("Input must be string");

        if (!isNaN(input)) {
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

    handleMemoryFunctions(input) {
        switch(input) {
            case "mc":
                this.memory.clearMemory();
                return;
            case "mr":
                this.display.set(this.memory.recallMemory());
                return;
            case "m+":
                this.memory.plusMemory(this.display.get());
                return;
            case "m-":
                this.memory.minusMemory(this.display.get());
                return;
            case "ms":
                this.memory.storeMemory(this.display.get());
                return;
        }
    }

    handleHistoryUpdate(history) {
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


    sendQuery(query) {
        this.evaluator.postMessage({
            query,
            degreeMode: this.degRadBtn.value === "deg",
            exponentialResult: this.resultModeBtn.value === "ex",
        });
    }


    // Handle message events from evaluator worker.
    handleResult(e) {
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

    toggleDegRad() {
        const isDeg = this.degRadBtn.value === "deg";
        this.degRadBtn.value = isDeg ? "rad" : "deg";
        this.degRadBtn.textContent = isDeg ? "RAD" : "DEG";
        this.degRadBtn.ariaLabel = isDeg ? "Radian Mode" : "Degree Mode";
    }

    toggleFnMode() {
        const is2ndMode = this.fnModeBtn.value === "fn2";
        this.fnModeBtn.value = is2ndMode ? "fn1" : "fn2";
        this.fnModeBtn.innerHTML = is2ndMode ? "Primary" : "2<sup>nd</sup>";
        this.fnModeBtn.ariaLabel = is2ndMode ? "Primary Function Mode" : "Second Function Mode";

        this.sinBtn.value = this.sinBtn.ariaLabel = this.sinBtn.textContent = is2ndMode ? "asin" : "sin";
        this.cosBtn.value = this.cosBtn.ariaLabel = this.cosBtn.textContent = is2ndMode ? "acos" : "cos";
        this.tanBtn.value = this.tanBtn.ariaLabel = this.tanBtn.textContent = is2ndMode ? "atan" : "tan";
    }

    toggleResultMode() {
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
