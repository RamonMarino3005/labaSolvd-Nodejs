import assert from "node:assert";

type Validator = (value: any) => null | string;
type Schema = Record<any, Validator>;

let STRICT: boolean = false;
function validateObject(obj: any, schema: Schema) {
  let errors: Record<any, any> = {};

  if (STRICT) {
    let objKeys = Object.keys(obj);
    let schemaKeys = Object.keys(schema);
    if (objKeys.length > schemaKeys.length) {
      errors["strict"] = {};
      let additionalKeys = objKeys.filter((key) => !schemaKeys.includes(key));
      additionalKeys.forEach(
        (key) =>
          (errors["strict"][key] = `Additional property '${key}' not in schema`)
      );
    }
  }

  for (const key of Object.keys(schema)) {
    let objValue = obj[key];
    let validator = schema[key];
    if (objValue === undefined) errors[key] = `missing property '${key}'`;
    else {
      const error = validator(objValue);
      if (error) errors[key] = error;
    }
  }
  return Object.keys(errors).length === 0
    ? { success: true, obj }
    : { success: false, errors };
}

const userSchema: Schema = {
  name: (value: any) =>
    typeof value === "string" && value.trim() !== ""
      ? null
      : "Name must be a non-empty string",
  age: (value) =>
    typeof value === "number" && Number.isInteger(value) && value >= 0
      ? null
      : "Age must be a non-negative integer",
  email: (value) =>
    typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ? null
      : "Email is not valid",
};

const user: Record<any, any> = {
  name: "Ramon",
  age: 20,
  email: "mariopolino@hotmail.com",
};

const validateUser = () => validateObject(user, userSchema);

let result = validateUser();
assert(result.success, "error: 1");

user.name = "";
result = validateUser();
assert(
  !result.success &&
    result.errors &&
    result.errors.name &&
    result.errors.name === "Name must be a non-empty string",
  "error: 2"
);

user.name = "Ramon";
user.age = -5;
result = validateUser();
assert(
  !result.success &&
    result.errors &&
    result.errors.age &&
    result.errors.age === "Age must be a non-negative integer",
  "error: 3"
);

STRICT = true;

user.age = 30;
user.address = "Bs As";
result = validateUser();
assert(
  !result.success &&
    result.errors &&
    result.errors.strict &&
    result.errors.strict.address &&
    result.errors.strict.address ===
      "Additional property 'address' not in schema",
  "error: 4"
);
