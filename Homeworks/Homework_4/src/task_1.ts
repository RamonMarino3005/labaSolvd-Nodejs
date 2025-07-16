import assert from "node:assert";

type Person = {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  address?: string;
  updateInfo?: (obj: Partial<Person>) => void;
};

let person: Person = {
  firstName: "John",
  lastName: "Doe",
  age: 30,
  email: "john.doe@example.com",
};

// Loop through person properties, set descriptors to non-writtable
Object.keys(person).forEach((key) => {
  Object.defineProperty(person, key, {
    writable: false,
  });
});

// Check person obj properties are not writtable.
assert.throws(() => {
  person.lastName = "Marino";
}, TypeError);

Object.defineProperty(person, "updateInfo", {
  value: function (newInfo: Partial<Omit<Person, "updateInfo">>) {
    Object.entries(newInfo).forEach(([key, value]) => {
      Object.defineProperty(this, key, {
        value,
      });
    });
  },
  writable: false,
  configurable: false,
  enumerable: false,
});

// Update `firstName` and `lastName`.
person.updateInfo!({ firstName: "Ramon", lastName: "Marino" });
// check object has been updated.
const expectedResult = {
  firstName: "Ramon",
  lastName: "Marino",
  age: 30,
  email: "john.doe@example.com",
};
assert.deepEqual(person, expectedResult);

// Define new non-enumerable non-configurable property `address`.
Object.defineProperty(person, "address", {
  value: {},
  enumerable: false,
  configurable: false,
  writable: true,
});

person.address = "Buenos Aires, Argentina";

// Assert `address` property can not be configured.
assert.throws(() => {
  delete person.address;
}, TypeError);

// Check `address` is not enumerable
assert(!Object.keys(person).includes("address"));

export { person };
