import assert from "node:assert";

type AllSettledResult =
  | { status: "fulfilled"; value: any }
  | { status: "rejected"; reason: any };

function promiseAllSettled(
  promises: Promise<any>[]
): Promise<AllSettledResult[]> {
  const results: any[] = Array(promises.length);
  let count: number = 0;
  const checkAllResolved = () => count === promises.length;

  return new Promise((resolve, reject) => {
    for (let i = 0; i < promises.length; i++) {
      promises[i]
        .then((value) => {
          results[i] = { status: "fulfilled", value };
          count++;
          if (checkAllResolved()) resolve(results);
        })
        .catch((reason) => {
          results[i] = { status: "rejected", reason };
          count++;
          if (checkAllResolved()) resolve(results);
        });
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
    }, 1200);
  });

const p3 = () =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(3);
    }, 2000);
  });

const p1_reject = () =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      reject("Not found");
    }, 1800);
  });

const p2_reject = () =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      reject("Fetch unsuccessful");
    }, 2200);
  });

console.log("Executing");

const resolution = (value: any) => {
  return { status: "fulfilled", value };
};
const rejection = (reason: string) => {
  return { status: "rejected", reason };
};

const p1_expected = resolution(1);
const p2_expected = resolution(2);
const p3_expected = resolution(3);
const p1_reject_expected = rejection("Not found");
const p2_reject_expected = rejection("Fetch unsuccessful");

let result = promiseAllSettled([p1(), p2(), p3()]);

result
  .then((value) => {
    assert.deepEqual(value, [p1_expected, p2_expected, p3_expected]);
  })
  .catch(() => {
    throw new Error("Test 1: promise should not reject");
  });

result = promiseAllSettled([p3(), p2(), p1()]);
result
  .then((value) => {
    assert.deepEqual(value, [p3_expected, p2_expected, p1_expected]);
  })
  .catch(() => {
    throw new Error("Test 2: promise should not reject");
  });

result = promiseAllSettled([p2(), p1(), p2_reject(), p3(), p1_reject()]);
result
  .then((value) => {
    assert.deepEqual(value, [
      p2_expected,
      p1_expected,
      p2_reject_expected,
      p3_expected,
      p1_reject_expected,
    ]);
  })
  .catch(() => {
    throw new Error("Test 3: promise should not reject");
  });
