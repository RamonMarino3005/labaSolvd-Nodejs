"use strict";
function debounce(fn, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}
const text = document.getElementById("result");
function debouncedSearch(query) {
  // Perform search operation with the query
  if (text) {
    text.innerHTML = query;
  }
}
const debouncedSearchHandler = debounce(debouncedSearch, 1000);
const inputElement = document.getElementById("name");
inputElement.addEventListener("input", (event) => {
  debouncedSearchHandler(event.target.value);
});
