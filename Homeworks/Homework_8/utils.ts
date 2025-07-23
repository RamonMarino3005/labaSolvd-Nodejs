// AI Generated. Don't really know how ISBN are generated.
function generateISBN10(): string {
  const digits = Array.from({ length: 9 }, () =>
    Math.floor(Math.random() * 10)
  );
  const sum = digits.reduce((acc, d, i) => acc + d * (10 - i), 0);
  const remainder = sum % 11;
  const check = (11 - remainder) % 11;
  const checkDigit = check === 10 ? "X" : check.toString();
  return digits.join("") + checkDigit;
}

function generateISBN13(): string {
  const prefix = [9, 7, Math.random() < 0.5 ? 8 : 9]; // 978 or 979
  const body = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  const digits = prefix.concat(body);
  const sum = digits.reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 1 : 3), 0);
  const checkDigit = (10 - (sum % 10)) % 10;
  return digits.join("") + checkDigit.toString();
}

export function generateISBN(type: "ISBN10" | "ISBN13" = "ISBN13"): string {
  return type === "ISBN10" ? generateISBN10() : generateISBN13();
}
