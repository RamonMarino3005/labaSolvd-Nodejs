function throttle(fn, delay) {
    let isReady = true;
    return function (...args) {
        if (isReady) {
            fn(...args);
            isReady = false;
            setTimeout(() => {
                isReady = true;
            }, delay);
        }
    };
}
function onScroll(event) {
    // Handle scroll event
    console.log("Scroll event:", event);
}
const throttledScrollHandler = throttle(onScroll, 300);
window.addEventListener("scroll", throttledScrollHandler);
export {};
