import { person } from "./task_1.js";
type Callback<T extends Record<string, any>> = <K extends keyof T>(options: {
  property?: K;
  value?: T[K];
  operation?: "set" | "get";
}) => void;
function observeObject<T extends Record<string, any>>(obj: T, fn: Callback<T>) {
  return new Proxy(obj, {
    get(target, property) {
      if (typeof property == "string" && property in target) {
        fn({ property, operation: "get" });
        return target[property];
      }
    },
    set(target, property, newValue, receiver) {
      if (typeof property == "string" && property in target) {
        const key = property as keyof T;
        fn({ property, value: newValue, operation: "set" });

        target[key] = newValue;

        return true;
      }
      return false;
    },
  });
}

Object.defineProperty(person, "lastName", {
  writable: true,
});

const callback = (options: {
  property?: keyof typeof person;
  operation?: "get" | "set";
}) => {
  console.log("Property name:", options.property);
  console.log("Operation:", options.operation);
};

let proxy = observeObject(person, callback);
console.log("Person Lastname:", proxy.lastName);
proxy.lastName = "Polipop";
console.log("Person Lastname:", proxy.lastName);
