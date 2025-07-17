type PromiseFn = (data?: any) => Promise<any>;
async function chainPromises(promises: PromiseFn[]) {
  return new Promise(async (resolve, reject) => {
    let lastResult: any;

    for (const promise of promises) {
      let result: any;
      try {
        result = lastResult ? await promise(lastResult) : await promise();
      } catch (reason) {
        reject(reason);
      }
      lastResult = result;
    }

    resolve(lastResult);
  });
}

function asyncFunction1() {
  return Promise.resolve("Result from asyncFunction1");
}

function asyncFunction2(data: any) {
  return Promise.resolve(data + " - Result from asyncFunction2");
}

function asyncFunction3(data: any) {
  return Promise.resolve(data + " - Result from asyncFunction3");
}

function asyncRejectFn(data: any) {
  return Promise.reject("Promise Rejected");
}

const functionsArray = [
  asyncFunction1,
  asyncFunction2,
  asyncFunction3,
  asyncRejectFn,
];

chainPromises(functionsArray)
  .then((result) => {
    console.log("Chained promise result:", result);
    // Expected: "Result from asyncFunction1 - Result from asyncFunction2 - Result from asyncFunction3"
  })
  .catch((error) => {
    console.error("Chained promise error:", error);
  });
