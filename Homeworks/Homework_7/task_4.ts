import assert from "node:assert";

type NodeCallback<Result> = (err: Error | null, result: Result) => void;
type CallbackStyleFn<Args extends any[], Result> = (
  ...args: [...Args, NodeCallback<Result>]
) => void;

function promisify<Args extends any[], Result>(
  fn: CallbackStyleFn<Args, Result>
): (...args: Args) => Promise<Result> {
  return function (...args: Args) {
    return new Promise((resolve, reject) => {
      fn(...args, (err: Error | null, res: Result) => {
        if (err) reject(err);
        else resolve(res);
      });
    });
  };
}

function callbackStyleFunction(
  value: number,
  callback: NodeCallback<number | null>
) {
  setTimeout(() => {
    if (value > 0) {
      callback(null, value * 2);
    } else {
      callback(new Error("Invalid value"), null);
    }
  }, 1000);
}

const promisedFunction = promisify(callbackStyleFunction);

promisedFunction(3)
  .then((result) => {
    console.log("Promised function result:", result); // Expected: 6
  })
  .catch((error) => {
    console.error("Promised function error:", error);
  });
