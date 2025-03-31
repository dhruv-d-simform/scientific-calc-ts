"use strict";

const HISTORY_LIMIT = 20;

export class History {

    constructor(key, onHistoryUpdate) {
        this.key = key;
        this.onHistoryUpdate = onHistoryUpdate;

        let storedHistory;
        try {
            storedHistory = JSON.parse(localStorage.getItem(key));
        } catch (err) { }

        if (storedHistory && Array.isArray(storedHistory)) {
            this.history = storedHistory;
            this.onHistoryUpdate (this.history);
            return;
        }

        this.history = [];
        this.saveHistory();
    }

    removeOldHistory() {
        this.history.splice(0, this.history.length - HISTORY_LIMIT);
    }

    saveHistory() {
        localStorage.setItem(this.key, JSON.stringify(this.history));
    }

    addEntry(query, result) {
        if (!query || !isFinite(result)) return;

        this.history.push({ query, result });
        this.removeOldHistory();
        this.saveHistory();
        this.onHistoryUpdate(this.history);
    }

    getAll() {
        return this.history;
    }

    clear() {
        this.history = [];
        this.saveHistory();
        this.onHistoryUpdate(this.history);
    }
}
