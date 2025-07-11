function multiply(a, b, c, d, e) {
  return a * b * c * d * e;
}

function curry(fn, arity) {
  function curried(argsSoFar) {
    return (arg) => {
      let updatedArgs = [...argsSoFar, arg];

      if (updatedArgs.length < arity) {
        return curried(updatedArgs);
      } else return fn(...updatedArgs);
    };
  }

  return curried([]);
}

const curriedMultiply = curry(multiply, 5);

const step1 = curriedMultiply(6); // Returns a curried function
const step2 = step1(3); // Returns a curried function
const result = step2(1); // Returns the final result: 2 * 3 * 4 = 24
const result1 = result(2); // Returns the final result: 2 * 3 * 4 = 24
const result2 = result1(4); // Returns the final result: 2 * 3 * 4 = 24

console.log("Result:", result2); // Expected: 24

function partialCurry(fn, arity) {
  let arr = Array(arity).fill(partialCurry.placeholder);

  function curried(argsSoFar) {
    return (...args) => {
      let updatedArgs = argsSoFar.map((el) => {
        if (args.length == 0) {
          return el;
        }

        if (partialCurry.isPlaceholder(el)) {
          if (!partialCurry.isPlaceholder(args[0])) {
            return args.shift();
          }
          args.shift();
        }

        return el;
      });
      console.log("List:", updatedArgs);
      if (
        updatedArgs.filter((el) => partialCurry.isPlaceholder(el)).length == 0
      ) {
        return fn(...updatedArgs);
      } else return curried(updatedArgs);
    };
  }

  return curried(arr);
}
partialCurry.placeholder = Symbol("placeholder");
partialCurry.isPlaceholder = (element) => element === partialCurry.placeholder;

const _ = partialCurry.placeholder;
const partialCurryFn = partialCurry(multiply, 5);
const step_1 = partialCurryFn(5);
let step_2 = step_1(_, _, _, 3, 4);
console.log("1:", step_2);
console.log("2:", step_2(1, 1, 1));
