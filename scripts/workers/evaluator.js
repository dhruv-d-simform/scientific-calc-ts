"use strict";

// Initialize some global variable to use directly inside eval()
const abs = Math.abs;
const floor = Math.floor;
const ceil = Math.ceil;
const round = Math.round;
const cbrt = Math.cbrt;

const log = Math.log10;
const ln = Math.log;

const π = Math.PI;
const e = Math.E;

const sqrt = Math.sqrt;

function factorial(n) {
    return n <= 1 ? 1 : n * factorial(n - 1);
}

// Handle message events from main script.
globalThis.addEventListener("message", function(event) {
    try {
        let query = event.data.query
            .replace(/\^/, "**")
            .replace(/√(\d+)/g, "sqrt($1)")
            .replace(/(\d+)!/g, 'factorial($1)');

        let sin = Math.sin;
        let cos = Math.cos;
        let tan = Math.tan;

        let asin = Math.asin;
        let acos = Math.acos;
        let atan = Math.atan;

        if (event.data.degreeMode) {
            sin = (x) => Math.sin(x * (Math.PI / 180));
            cos = (x) => Math.cos(x * (Math.PI / 180));
            tan = (x) => Math.tan(x * (Math.PI / 180));

            asin = (x) => (180 / Math.PI) * Math.asin(x);
            acos = (x) => (180 / Math.PI) * Math.acos(x);
            atan = (x) => (180 / Math.PI) * Math.atan(x);
        }

        let result = eval(query);

        // Handle divide by 0
        if (!isFinite(result)) {
            throw new Error("This operation is not allowed");
        }

        if (event.data.exponentialResult) {
            result = result.toExponential();
        }

        globalThis.postMessage({
            success: true,
            query: event.data.query,
            result
        });
    } catch (error) {
        globalThis.postMessage({
            success: false,
            query: event.data.query,
            error
        })
    }
});
