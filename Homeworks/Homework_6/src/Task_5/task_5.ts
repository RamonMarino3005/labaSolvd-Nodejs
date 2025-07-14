export {};
function throttle<Fn extends (...args: any[]) => any>(fn: Fn, delay: number) {
  let isReady: boolean = true;
  return function (...args: Parameters<Fn>) {
    if (isReady) {
      fn(...args);
      isReady = false;
      setTimeout(() => {
        isReady = true;
      }, delay);
    }
  };
}
function onScroll(event: Event) {
  // Handle scroll event
  console.log("Scroll event:", event);
}

const throttledScrollHandler = throttle(onScroll, 300);

window.addEventListener("scroll", throttledScrollHandler);
