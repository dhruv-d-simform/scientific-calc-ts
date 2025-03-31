"use strict";

import { Calculator } from "./calculator.ts";

// Initialize the calculator.
let calculator = new Calculator("memoryKey", "historyKey", {
    displayId: "display-text",
    btnsId: "control",
    degRanBtnId: "deg-rad",
    fnModeBtnId: "fn-mode",
    resultModeBtnId: "result-mode",
    sinBtnId: "sin-btn",
    cosBtnId: "cos-btn",
    tanBtnId: "tan-btn",
    historyListId: "history-list", 
    clearHistoryBtnId: "clear-history",
});
