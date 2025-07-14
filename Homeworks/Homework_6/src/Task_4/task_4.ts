function debounce<Fn extends (...args: any[]) => any>(fn: Fn, delay: number) {
  let timeout: NodeJS.Timeout;
  return function (...args: Parameters<Fn>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

const text = document.getElementById("result");

function debouncedSearch(query: string) {
  // Perform search operation with the query
  if (text) {
    text.innerHTML = query;
  }
}
const debouncedSearchHandler = debounce(debouncedSearch, 1000);

const inputElement = document.getElementById("name");
inputElement!.addEventListener("input", (event) => {
  debouncedSearchHandler((event!.target! as HTMLInputElement).value);
});
