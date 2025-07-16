import assert from "node:assert";
import { mock } from "./task_4.js";

function deepCloneObject(obj: Record<string, any>) {
  // Track seen objects in case they are referenced multiple times.
  let seen = new WeakMap();

  function deepClone(obj: any, seen: WeakMap<any, any>) {
    if (obj == null || typeof obj !== "object") return obj;

    if (seen.has(obj)) return seen.get(obj);

    let cloneObj: Date | Map<any, any> | Array<any> | Record<any, any>;

    if (obj instanceof Date) {
      cloneObj = new Date(obj);
    } else if (Array.isArray(obj)) {
      cloneObj = [];
      seen.set(obj, cloneObj);
      for (const element of obj) {
        cloneObj.push(deepClone(element, seen));
      }
    } else if (obj instanceof Map) {
      cloneObj = new Map() as Map<any, any>;
      seen.set(obj, cloneObj);
      for (const [key, value] of obj) {
        let cloneKey = deepClone(key, seen);
        let cloneValue = deepClone(value, seen);
        (cloneObj as Map<any, any>).set(cloneKey, cloneValue);
      }
    } else if (obj instanceof Set) {
      cloneObj = new Set();
      seen.set(obj, cloneObj);
      for (const element of obj) {
        (cloneObj as Set<any>).add(deepClone(element, seen));
      }
    } else {
      // Create new object that inherits from the same prototype.
      cloneObj = Object.create(Object.getPrototypeOf(obj));
      seen.set(obj, cloneObj);
      for (const key of Object.keys(obj)) {
        (cloneObj as Record<any, any>)[key] = deepClone(
          (obj as Record<any, any>)[key],
          seen
        );
      }
    }
    return cloneObj;
  }
  return deepClone(obj, seen);
}

const arr: any[] = [1, 2, 3, 4, 5];
arr.push(arr);

const circular: Record<any, any> = {
  province: "BsAs",
  country: "Argentina",
  count: arr,
};
circular.self = circular;

const obj: Record<any, any> = {
  name: "Ramon",
  lastName: "Marino",
  age: 23,
  mockData: mock,
  mockData2: circular,
};
obj.self = obj;

const clone = deepCloneObject(obj);

// Check original object and clone are equal(not by references).
assert.deepEqual(clone, obj);

// Check nested objects are copied and not referenced.
assert(clone.mockData !== mock);
assert(clone.mockData2 !== circular);
assert(clone.mockData.count !== arr);

// Check circular references point towards the copied structures.
assert(
  clone.mockData2.self !== circular && clone.mockData2.self === clone.mockData2
);
assert(clone.self !== obj && clone.self === clone);

let circularArrEl = clone.mockData2.count[5];
assert(circularArrEl !== arr && circularArrEl == clone.mockData2.count);
