String.prototype.plus = function (str) {
  validateInputString(str);

  let leftAddend = trimLeadingZeros(this);
  let rightAddend = trimLeadingZeros(str);

  let maxLength =
    leftAddend.length > rightAddend.length
      ? leftAddend.length
      : rightAddend.length;

  leftAddend = leftAddend.padStart(maxLength, "0");
  rightAddend = rightAddend.padStart(maxLength, "0");

  let carry = 0;
  let endResult = new Array(maxLength + 1); // (Length of biggest addend) + 1 is the max length of sum result.

  for (let i = maxLength - 1; i >= 0; i--) {
    let result = carry + getInt(leftAddend[i]) + getInt(rightAddend[i]);
    endResult[i + 1] = result % 10;
    carry = (result / 10) | 0; // Forces (result / 10) into a 32-bit Int, truncating the decimals.
  }
  endResult[0] = carry;

  let resultString = trimLeadingZeros(endResult.join(""));
  return resultString;
};

String.prototype.minus = function (str) {
  validateInputString(str);

  let leftStr = trimLeadingZeros(this);
  let rightStr = trimLeadingZeros(str);

  // Check if result will be positive/zero or negative
  let isNegative = strcmp(leftStr, rightStr) == -1;

  // If result will be negative, invert minuaend and substrahend.
  let [minuaend, substrahend, maxLength] = isNegative
    ? [rightStr, leftStr, rightStr.length]
    : [leftStr, rightStr, leftStr.length];

  minuaend = minuaend.padStart(maxLength, "0");
  substrahend = substrahend.padStart(maxLength, "0");

  let borrowed = 0;
  let resultArray = new Array(maxLength);

  for (let i = maxLength - 1; i >= 0; i--) {
    let result =
      minuaend[i].charCodeAt(0) - substrahend[i].charCodeAt(0) - borrowed;
    borrowed = result < 0 ? 1 : 0;
    result = result < 0 ? result + 10 : result;
    resultArray[i] = result;
  }

  let resultString = resultArray.join("").replace(/^0+/, "") || "0";
  let resultStringSigned = `${isNegative ? "-" : ""}${resultString}`;

  return resultStringSigned;
};

String.prototype.divide = function (divisor) {
  if (divisor == 0) throw new Error("Division by zero is not allowed.");
  validateInputString(divisor);

  let dividend = trimLeadingZeros(this);
  divisor = trimLeadingZeros(divisor);

  const longDivision = (dividend, divisor) => {
    let reminder = "";
    let quotient = "";

    for (let i = 0; i < dividend.length; i++) {
      let currDividend = trimLeadingZeros(reminder + dividend[i]);
      let count = 0;
      while (strcmp(currDividend, divisor) >= 0) {
        currDividend = currDividend.minus(divisor);
        count++;
      }
      quotient += count;
      reminder = currDividend;
    }

    return [trimLeadingZeros(quotient), reminder || "0"];
  };

  let [quotient, reminder] = longDivision(dividend, divisor);

  const DECMIAL_LIMIT = 15; // Arbitrary, task doesn't specify
  let decimals = "";
  let decimalCount = 0;
  while (reminder !== "0" && decimalCount < DECMIAL_LIMIT) {
    reminder = `${reminder}0`;
    [q, r] = longDivision(reminder, divisor);
    reminder = r;
    decimals += q;
    decimalCount++;
  }

  let result = `${quotient}.${decimals || "0"}`;
  return result;
};

String.prototype.multiply = function (multiply) {
  validateInputString(multiply);

  let multiplicand = trimLeadingZeros(this.toString());
  let multiplier = trimLeadingZeros(multiply);

  let results = "";

  for (
    let i = multiplier.length - 1, placeValue = 0;
    i >= 0;
    i--, placeValue++
  ) {
    let resultLength = multiplicand.length + 1; // Max length of 1 x n multiplication result is 1 + n
    let currProduct = new Array(resultLength);
    let carry = 0;

    for (let j = multiplicand.length - 1; j >= 0; j--) {
      let currResult = getInt(multiplier[i]) * getInt(multiplicand[j]) + carry; // Will never exceed 90, safe integers.
      carry = (currResult / 10) | 0;
      currProduct[j] = j !== 0 ? currResult % 10 : currResult;
    }
    let result = currProduct.join("") + "0".repeat(placeValue);
    results = results.plus(result);
  }

  return results;
};

function validateInputString(str) {
  let isString = typeof str == "string" || str instanceof String;
  if (!isString) throw new Error(`Invalid string: ${str} is not a string`);

  let isNumeric = /^\d*$/.test(str);
  if (!isNumeric) {
    throw new Error(
      `${str} is not a valid string: string must contain digits only`
    );
  }
}

function trimLeadingZeros(str) {
  return str.replace(/^0+/, "") || "0";
}

function collapseZeroes(str) {
  return /^[0]+$/.test(str) ? "0" : str;
}

function strcmp(a, b) {
  if (a.length !== b.length) {
    return a.length > b.length ? 1 : -1;
  } else {
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
    }
    return 0;
  }
}

function getInt(str) {
  return str.charCodeAt(0) - "0".charCodeAt(0);
}
