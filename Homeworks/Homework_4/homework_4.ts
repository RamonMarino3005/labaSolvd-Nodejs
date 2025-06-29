const assert = require("node:assert");

// TASK 1 => Advanced Array Filtering
type MapMethod<T> = (value: T, index?: number, array?: T[]) => any;
function customFilterUnique<T>(arr: T[], uniquenesMethod: MapMethod<T>): T[] {
  let transformed = arr.map(uniquenesMethod);

  let seen = new Set();
  const isUnique = (el: any) => {
    if (seen.has(el)) {
      return false;
    } else {
      seen.add(el);
      return true;
    }
  };

  let uniques = transformed.map(isUnique);
  return arr.filter((_, idx) => uniques[idx]);
}

let objArr = [
  { name: "Ramon", id: "1" },
  { name: "Tomas", id: "3" },
  { name: "Juan", id: "12" },
  { name: "Juan", id: "2" },
  { name: "Agustina", id: "3" },
  { name: "Justo", id: "4" },
  { name: "Ramon", id: "5" },
  { name: "Agustina", id: "7" },
  { name: "Ezequiel", id: "12" },
  { name: "Justina", id: "2" },
  { name: "Ramon", id: "3" },
  { name: "Justina", id: "9" },
  { name: "Ramon", id: "8" },
  { name: "Homero", id: "4" },
  { name: "Luz", id: "6" },
  { name: "Lucia", id: "5" },
  { name: "Homero", id: "1" },
];

let call = (
  el: { name: string; id: string },
  idx?: number,
  arr?: { name: string; id: string }[]
) => el.name;

assert.deepStrictEqual(customFilterUnique(objArr, call), [
  { name: "Ramon", id: "1" },
  { name: "Tomas", id: "3" },
  { name: "Juan", id: "12" },
  { name: "Agustina", id: "3" },
  { name: "Justo", id: "4" },
  { name: "Ezequiel", id: "12" },
  { name: "Justina", id: "2" },
  { name: "Homero", id: "4" },
  { name: "Luz", id: "6" },
  { name: "Lucia", id: "5" },
]);

// TASK 2 => Array Chunking
function chunkArray<T>(arr: T[], chunkSize: number): T[][] {
  if (chunkSize < 1)
    throw new Error(`"${chunkSize}" is not a valid chunk size`);

  let chunks = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize));
  }
  return chunks;
}

function optimizedChunkArray<T>(arr: T[], chunkSize: number): T[][] {
  if (chunkSize < 1)
    throw new Error(`"${chunkSize}" is not a valid chunk size`);

  let chunks = [];
  while (arr.length !== 0) {
    chunks.push(arr.splice(0, chunkSize));
    // Doesn't copy, more memory efficient. But weird behaviour to mutate og array.
    // Also, it has higher runtime complexity.
  }
  return chunks;
}

// TASK 3 => Array Shuffling
function customShuffle<T>(arr: T[]): T[] {
  let copy = structuredClone(arr);
  for (let i = 0; i < copy.length; i++) {
    let randIdx = Math.floor(Math.random() * copy.length); // Random idx generator
    [copy[i], copy[randIdx]] = [copy[randIdx], copy[i]];
  }
  return copy;
}

function optimizedCustomShuffle<T>(arr: T[]): T[] {
  let copy = structuredClone(arr);

  // Fisher-Yates algorithm: found online it is the best proven way to uniformly shuffle.
  for (let i = copy.length - 1; i > 0; i--) {
    let randIdx = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[randIdx]] = [copy[randIdx], copy[i]];
  }

  return copy;
}

// TASK 4 => Array Intersection and Union
function getArrayIntersection(arr1: any[], arr2: any[]) {
  return arr1.filter((el) => arr2.includes(el));
}

function getArrayUnion(arr1: any[], arr2: any[]) {
  let uniqueArr1 = arr1.filter((el) => !arr2.includes(el));
  let uniqueArr2 = arr2.filter((el) => !arr1.includes(el));
  return [...uniqueArr1, ...uniqueArr2];
}

// TASK 5 => Array Performance Analysis
const perf = require("node:perf_hooks");

const double = (el: number) => el * 2;
const isEven = (el: number) => el % 2 == 0;

const measureArrayPerformance =
  <T>(arr: T[]) =>
  (fn: (arr: T[]) => any[]) => {
    let start = perf.performance.now();
    fn(arr);
    let end = perf.performance.now();
    return end - start;
  };

function meassureMap(arr: number[]): number[] {
  return arr.map(double);
}

function meassureFilter(arr: number[]): number[] {
  return arr.filter(isEven);
}

// Basic mapping function.
let customMap =
  <T>(mapping: MapMethod<T>) =>
  (arr: any[]) => {
    let newArr = [];
    for (let i = 0; i < arr.length; i++) {
      newArr.push(mapping(arr[i]));
    }
    return newArr;
  };
let doubleElement = customMap(double);

// Basic filtering function
type FilterMethod = (value: any, index?: number, array?: any[]) => unknown;
let customFilter = (filter: FilterMethod) => (arr: any[]) => {
  let newArr = [];
  for (let i = 0; i < arr.length; i++) {
    if (filter(arr[i])) newArr.push(arr[i]);
  }
  return newArr;
};
let getEven = customFilter(isEven);

// Create big enough array for meaningfull time meassurements.
let arrNum: number[] = [];
for (let i = 0; i < 100000000; i++) {
  arrNum.push(i);
}

const meassureArrNum = measureArrayPerformance(arrNum);

console.log("Custom Map:", meassureArrNum(doubleElement));
console.log("OG Map:", meassureArrNum(meassureMap));

console.log("Custom Filter:", meassureArrNum(getEven));
console.log("OG filter:", meassureArrNum(meassureFilter));
