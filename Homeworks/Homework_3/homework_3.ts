// TASK 1 => IMMUTABILITY AND PURE FUNCTIONS
//1)
type Products = {
  id: string;
  name: string;
  price: number;
};
function calculateDiscountedPrice(
  products: Products[],
  discount: number
): Products[] {
  let newPricePercentage = 1 - discount / 100;
  return products.map((product) => {
    return { ...product, price: product.price * newPricePercentage };
  });
}

//2)
function calculateTotalPrice(products: Products[]) {
  return products.reduce((acc, product) => acc + product.price, 0);
}

// TASK 2 => FUNCTION COMPOSITION AND POINT-FREE STYLE
// 1)
type Person = {
  name: string;
  lastName: string;
};
function getFullName(person: Person) {
  return person.name + " " + person.lastName;
}

// 2)
const sortFn =
  (compareFn: (a: string, b: string) => number) => (array: string[]) =>
    array.sort(compareFn);

const localeComposite =
  (locale: Intl.LocalesArgument) =>
  (options: Intl.CollatorOptions) =>
  (a: string, b: string) =>
    a.localeCompare(b, locale, options);

const caseInsensitiveLocaleCompare = localeComposite(undefined)({
  sensitivity: "base",
});

const sortByLocalCompare = sortFn(caseInsensitiveLocaleCompare);

const replace = (regEx: RegExp) => (replacement: string) => (str: string) =>
  str.replace(regEx, replacement);
const replacePunctuation = replace(/[^\w\s]|_/g)("");

const split = (separator: string) => (str: string) => str.split(separator);
const splitWords = split(" ");

const makeUnique = (arr: string[]) => [...new Set(arr)];

const findUniqueWords = (str: string) =>
  makeUnique(splitWords(replacePunctuation(str)));

function filterUniqueWords(str: string) {
  return sortByLocalCompare(findUniqueWords(str));
}

//3)
const sumElements = (a: number, b: number) => a + b;
const reduceToNumber = (arr: number[]) => arr.reduce(sumElements);

// Reduce method that joins objects property in array.
const reduceByProperty =
  (key: string) => (a: number[], b: Record<string, any>) =>
    a.concat(b[key]);

// Reduce Record<string, any>[] to number[] by provided method.
const reduceObjectsToNumberArray =
  (
    reduceMethod: (
      previousValue: any[],
      currentValue: Record<string, any>,
      currentIndex: number,
      array: Record<string, any>[]
    ) => number[]
  ) =>
  (arr: Record<string, any>[]) =>
    arr.reduce(reduceMethod, []);

// Reduce Recor<string, any> to number[] by joining "grades" property of objects.
const reduceObjectsByGradeProperty = reduceObjectsToNumberArray(
  reduceByProperty("grades")
);

type Students = {
  name: string;
  grades: number[];
};
type GradeMap = { gradeSum: number; len: number };

// Will asume different students might have different amount of grades. Not specified in task description
function getAverageGrade(students: any[]) {
  let grades = reduceObjectsByGradeProperty(students);
  let gradesCount = grades.length;
  let gradeSum = reduceToNumber(grades);

  return gradeSum / gradesCount;
}

// TASK 3 => CLOSURES AND HIGHER-ORDER FUNCTIONS.
// 1)
function createCounter() {
  let counter = 0;
  return function () {
    return ++counter;
  };
}

// 2)
/**
 * It is unclear to me what "runs indefinitely until stopped" means on task description.
 * I will implement the repeatFunction to return a controller that can run the given function asynchronously or stop it.
 *
 * Returns An object with:
 *   - run: a function that starts the loop.
 *   - stop: a function that stops the loop.
 *
 * usage:
 *
 * const printHello = () => console.log("Hello World");
 *
 * // Run 1000 times
 * const controller = repeatFunction(printHello, 1000);
 * controller.run(); // Executes `printHello` 1000 times asynchronously
 *
 * // Run indefinitely until stopped
 * const infiniteController = repeatFunction(printHello, -1);
 * infiniteController.run();
 *
 * // Stop the infinite loop after 500ms
 * setTimeout(() => infiniteController.stop(), 500);
 */
function repeatFunction<Fn extends (...args: any[]) => void>(
  fn: Fn,
  n: number
): { run: (...args: Parameters<Fn>) => void; stop: () => void } {
  let stopped = false;
  let count = 0;
  let limit = n > 0 ? n : Infinity; // If n is negative, then no limit. n(number) >= Infinity is never true.

  function runNTimes(...args: Parameters<Fn>): void {
    const loopNTimes = () => {
      if (count >= limit || stopped) return;
      fn(...args);
      count++;
      setTimeout(() => runNTimes(...args), 0);
    };

    setTimeout(loopNTimes, 0);
  }

  return {
    run: runNTimes,
    stop: () => (stopped = true),
  };
}

// TASK 4 => RECURSION AND TAIL CALL OPTIMIZATION
//1)
function calculateFactorial(n: number | bigint) {
  let number = BigInt(n);

  function factorial(n: bigint, count: bigint) {
    if (n <= 2) return n * count;
    else return factorial(n - 1n, n * count);
  }

  return factorial(number, 1n);
}

//2)
function power(base: number, exp: number) {
  if (exp == 0) return 1;
  if (base == 0) return 0; // Avoids division by 0 in edge case: 0^-n

  let isNegative = exp < 0;
  exp = isNegative ? -exp : exp; // No libraries like Math allowed I assume, not specified in task.

  function multiply(count: number, accumulator: number) {
    if (count == exp) return accumulator;
    accumulator = base * accumulator;
    return multiply(count + 1, accumulator);
  }

  let result = multiply(0, 1);
  return !isNegative ? result : 1 / result;
}

// TASK 5 => LAZY EVALUATION AND GENERATORS
//1)
type MappingFunction<Input, Output> = (
  value: Input,
  index: number,
  array: Input[]
) => Output;

function lazyMap<T, U>(arr: T[], method: MappingFunction<T, U>) {
  let index = 0;

  // Return object following iterator protocol, allows for...of loop (only once!)
  return {
    next() {
      if (index < arr.length) {
        let value = method(arr[index], index, arr);
        index++;

        return {
          value,
          done: false,
        };
      } else {
        return { value: undefined, done: true };
      }
    },
    [Symbol.iterator]() {
      return this;
    },
  };
}

//2)
function fibonacciGenerator() {
  let base = [0, 1];
  let initialBase = 0;

  const getNext = () => {
    let next = base[0] + base[1];
    base = [base[1], next];
    return next;
  };

  return {
    next() {
      return {
        value: initialBase >= 2 ? getNext() : base[initialBase++],
        done: false, // done is never true on a fibonacci sequenece
      };
    },
    [Symbol.iterator]() {
      return this;
    },
  };
}
