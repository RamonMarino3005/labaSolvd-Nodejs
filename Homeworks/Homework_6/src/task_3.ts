function multiline(strings: TemplateStringsArray, ...values: any[]) {
  let str = values.reduce((acc: string, val: any, idx: number) => {
    return acc + val + strings[idx + 1];
  }, strings[0]);

  let lineBreaks = str
    .replace(/^\n|\n$/g, "")
    .split(/\n/)
    .map((str, idx) => `${idx + 1} ${str}\n`);

  return lineBreaks.join("");
}

const code = multiline`
  function add(a, b) {
      return a + b;
  }
  `;

console.log(code);
