import assert from "node:assert";
import { person } from "./task_1.js";

function createImmutableObject(obj: any) {
  const isArray = Array.isArray(obj);
  const immutableObj = isArray ? [] : {};

  for (const [key, value] of Object.entries(obj)) {
    let isObject = typeof value == "object" && value !== null;
    let immutableValue = isObject ? createImmutableObject(value) : value;

    Object.defineProperty(immutableObj, key, {
      value: immutableValue,
      writable: false,
      configurable: false,
      enumerable: true,
    });
  }

  return immutableObj;
}

export const mock = {
  id: 1,
  name: "Test User",
  isActive: true,
  address: {
    street: "123 Main St",
    city: "Somewhere",
    coordinates: {
      lat: 40.7128,
      lng: -74.006,
    },
  },
  tags: ["developer", "tester", { role: "admin" }],
  projects: [
    {
      name: "Project A",
      completed: false,
      tasks: [
        { title: "Task 1", done: true },
        { title: "Task 2", done: false },
      ],
    },
    {
      name: "Project B",
      completed: true,
      tasks: [],
    },
  ],
  metadata: null,
  createdAt: new Date("2023-01-01T10:00:00Z"),
};

function assertNonWritable(obj: Record<any, any>) {
  for (const [key, value] of Object.entries(obj)) {
    assert(!Object.getOwnPropertyDescriptor(obj, key)?.writable);

    if (typeof value == "object" && value !== null) {
      assertNonWritable(value);
    }
  }
}

let immutableObj = createImmutableObject(mock);
let immutablePerson = createImmutableObject(person);

assertNonWritable(immutableObj);
assertNonWritable(immutablePerson);
