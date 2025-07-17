import assert from "node:assert";

function promiseAll(promises: Promise<any>[]) {
  const resolved: any[] = Array(promises.length);
  let count: number = 0;
  const checkAllResolved = () => count === promises.length;

  return new Promise((resolve, reject) => {
    for (let i = 0; i < promises.length; i++) {
      promises[i]
        .then((val) => {
          resolved[i] = val;
          count++;
          if (checkAllResolved()) resolve(resolved);
        })
        .catch((reason) => reject(reason));
    }
  });
}

const p1 = () =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(1);
    }, 1500);
  });

const p2 = () =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(2);
    }, 2000);
  });

const p3 = () =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(3);
    }, 2000);
  });

const p_reject = () =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      reject("Not found");
    }, 2000);
  });

console.log("Executing");

let result = promiseAll([p2(), p1(), p3()]);

result
  .then((value) => {
    assert.deepEqual(value, [2, 1, 3]);
  })
  .catch((reason) => {
    throw new Error("This test promise should not reject");
  });

result = promiseAll([p3(), p2(), p1()]);
result
  .then((value) => {
    assert.deepEqual(value, [3, 2, 1]);
  })
  .catch((reason) => {
    throw new Error("This test promise should not reject");
  });

result = promiseAll([p2(), p1(), p3(), p_reject()]);
result
  .then(() => {
    throw new Error("This test promise should not resolve");
  })
  .catch((reason) => {
    assert(reason === "Not found");
  });
