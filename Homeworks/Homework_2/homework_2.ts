import {
  AllCommonTypes,
  AllCommonTypeLiterals,
  CommonObjectTypes,
  Primitives,
  PrimitiveTypes,
  PRIMITIVES,
  TypeMap,
  ValidTypeLiterals,
  ValidTypes,
  VALID_TYPES,
  COMMON_OBJECT_TYPES,
  AnyTypedObject,
  TypedObject,
  ConvertToNumberType,
} from "./types";

export function addValues(x: AllCommonTypes, y: AllCommonTypes): ValidTypes {
  let leftOp = _toTypedObject(x);
  let rightOp = _toTypedObject(y);

  const typeError: () => never = _throwTypeError(
    `Invalid Type: Cannot add types ${leftOp.type} and ${rightOp.type}`
  );

  if (leftOp.type == "date" || rightOp.type == "date") {
    const error = _throwTypeError(
      "Invalid Type: Not valid format for date addition"
    );
    return _handleDateAddition(leftOp, rightOp, error);
  }

  let result = _checkDefaultPrimitives(leftOp, rightOp);
  if (result) return result;

  if (leftOp.type == "array" || rightOp.type == "array") {
    return _handleArrayAddition(leftOp, rightOp, typeError);
  }

  if (leftOp.type == "set" || rightOp.type == "set") {
    return _handleSetAddition(leftOp, rightOp, typeError);
  }

  if (leftOp.type == "map" || rightOp.type == "map") {
    return _handleMapAddition(leftOp, rightOp, typeError);
  }

  if (leftOp.type == "object" || rightOp.type == "object") {
    return _handleObjectAddition(leftOp, rightOp, typeError);
  }

  if (_isPrimitive(leftOp.type) && _isPrimitive(rightOp.type)) {
    return (leftOp.value as any) + (rightOp.value as any);
  }

  typeError();
}

export function stringifyValue(value: AllCommonTypes): string {
  if (value === null || value === undefined) return String(value);

  let valueObject = _toTypedObject(value);

  if (valueObject.type == "string") return valueObject.value;

  switch (valueObject.type) {
    case "set":
    case "map":
      return JSON.stringify([...valueObject.value]);
    case "date":
      if (isNaN(valueObject.value.getTime())) {
        return "Invalid Date";
      }
      return valueObject.value.toISOString();
    case "object":
    case "array":
      return JSON.stringify(valueObject.value);
    default:
      return String(valueObject.value);
  }
}

export function invertBoolean(value: boolean): boolean {
  if (typeof value !== "boolean")
    throw new TypeError("Argument must be a boolean");
  return !value;
}

export function convertToNumber(value: AllCommonTypes): ConvertToNumberType {
  if (value === null || value === undefined || "") return 0;

  let addend = _toTypedObject(value);

  if (addend.type === "number") {
    return addend.value;
  }

  if (addend.type == "string") {
    if (addend.value.trim() === "") return 0;

    const typeError = _throwTypeError(
      `Invalid Type: Cannot convert string value "${addend.value}" to Number`
    );
    let number = _handleStringConversion(addend.value);
    return number !== null ? number : typeError();
  }

  // Check default object primitives.
  const primitive = addend.value.valueOf();

  if (typeof primitive === "number" && !isNaN(primitive)) {
    return primitive;
  }

  if (typeof primitive === "string") {
    const parsed = _handleStringConversion(primitive);
    if (parsed !== null) return parsed;
  }

  // Handle common object types
  if (addend.type == "array") {
    return _convertArrayToNumber(addend.value);
  }

  if (addend.type == "object") {
    return _convertObjectToNumber(addend.value);
  }

  if (addend.type == "map") {
    return _convertMapToNumber(addend.value);
  }

  if (addend.type == "set") {
    return _convertSetToNumber(addend.value);
  }

  try {
    return Number(addend.value);
  } catch (e) {
    throw new Error(
      `not possible to convert value of type ${addend.type} to Number`
    );
  }
}

export function coerceToType<T extends ValidTypeLiterals>(
  value: any,
  targetType: T
): TypeMap[T] {
  let operand: AnyTypedObject = _toTypedObject(value);

  if (!_isValidType(targetType)) {
    _throwTypeError(`Invalid Type: ${targetType} is not a valid type`)();
  }

  // If types match, return value as is.
  if (operand.type == targetType) return operand.value as TypeMap[T];

  if (_isPrimitive(operand.type) && _isPrimitive(targetType)) {
    if (targetType == "boolean") return _coerceToBoolean(operand) as TypeMap[T];

    let evalType = targetType.charAt(0).toUpperCase() + targetType.slice(1);
    return eval(evalType)(operand.value); // Bad Practice?
  }

  if (targetType == "date") {
    return _coerceToDate(operand) as TypeMap[T];
  }

  if (targetType == "array") {
    return _coerceToArray(operand) as TypeMap[T];
  }

  if (targetType == "map") {
    return _coerceToMap(operand) as TypeMap[T];
  }

  if (targetType == "set") {
    return _coerceToSet(operand) as TypeMap[T];
  }

  if (targetType == "object") {
    return _coerceToObject(operand) as TypeMap[T];
  }

  if (targetType == "number") {
    return convertToNumber(operand.value) as TypeMap[T];
  }

  if (targetType == "string") {
    return stringifyValue(operand.value) as TypeMap[T];
  }

  if (targetType == "boolean") {
    return _coerceToBoolean(operand) as TypeMap[T];
  }

  throw new TypeError(
    `not possible to convert value of type ${operand.type} to ${targetType}`
  );
}

//Helper functions
function _checkDefaultPrimitives(
  leftOp: AnyTypedObject,
  rightOp: AnyTypedObject
): PrimitiveTypes | null {
  if (leftOp.type == "date" || rightOp.type == "date") {
    return null;
  }
  let leftPrimitive = leftOp.value.valueOf();
  let rightPrimitive = rightOp.value.valueOf();
  if (typeof leftPrimitive !== "object" && typeof rightPrimitive !== "object") {
    return ((leftPrimitive as any) + rightPrimitive) as any;
  }
  return null;
}

function _findObject<T extends CommonObjectTypes>(
  param1: AnyTypedObject,
  param2: AnyTypedObject,
  type: T
): [TypedObject<T>, AnyTypedObject] {
  if (param1.type == type) {
    return [param1 as TypedObject<T>, param2];
  } else {
    return [param2 as TypedObject<T>, param1];
  }
}

function _handleDateAddition(
  leftOp: AnyTypedObject,
  rightOp: AnyTypedObject,
  typeError: () => never
): ValidTypes {
  const [dateAddend, other] = _findObject(leftOp, rightOp, "date");

  if (other.type == "number") {
    return new Date(dateAddend.value.getTime() + other.value);
  }

  typeError();
}

function _handleArrayAddition(
  leftOp: AnyTypedObject,
  rightOp: AnyTypedObject,
  typeError: () => never
): ValidTypes {
  const [arrayAddend, other] = _findObject(leftOp, rightOp, "array");

  if (other.type == "array") {
    return arrayAddend.value.concat(other.value);
  }
  if (other.type == "set") {
    return new Set([...arrayAddend.value, ...other.value]);
  }
  if (other.type == "map") {
    return new Map([...arrayAddend.value, ...other.value]);
  }
  if (_isPrimitive(other.type)) {
    return [...arrayAddend.value, other.value as PrimitiveTypes];
  }
  typeError();
}

function _handleSetAddition(
  leftOp: AnyTypedObject,
  rightOp: AnyTypedObject,
  typeError: () => never
): ValidTypes {
  const [setAddend, other] = _findObject(leftOp, rightOp, "set");

  if (other.type == "set") {
    return new Set([...setAddend.value, ...other.value]);
  }
  if (other.type == "map") {
    return new Set([...setAddend.value, ...other.value]);
  }
  if (_isPrimitive(other.type)) {
    return new Set([...setAddend.value, other.value as PrimitiveTypes]);
  }
  typeError();
}

function _handleMapAddition(
  leftOp: AnyTypedObject,
  rightOp: AnyTypedObject,
  typeError: () => never
): ValidTypes {
  const [mapAddend, other] = _findObject(leftOp, rightOp, "map");

  if (other.type == "map") {
    return new Map([...mapAddend.value, ...other.value]);
  }
  if (_isPrimitive(other.type)) {
    return [...mapAddend.value, [other.type, other.value as PrimitiveTypes]];
  }
  typeError();
}

function _handleObjectAddition(
  leftOp: AnyTypedObject,
  rightOp: AnyTypedObject,
  typeError: () => never
): ValidTypes {
  const [objectAddend, other] = _findObject(leftOp, rightOp, "object");

  if (other.type == "object") {
    return _mergeObjects(objectAddend.value, other.value);
  }
  if (_isPrimitive(other.type)) {
    return {
      ...objectAddend.value,
      [other.type]: other.value as PrimitiveTypes,
    };
  }
  typeError();
}

function _toTypedObject(param: unknown): AnyTypedObject {
  const type = _getType(param);

  if (_isValidType(type)) {
    return {
      type: type,
      value: param as TypeMap[typeof type],
    } as AnyTypedObject;
  }

  throw new TypeError(`Invalid Type: ${type} is not a valid type`);
}

function _getType(x: unknown): AllCommonTypeLiterals {
  const typeError = (wrongType: string) =>
    _throwTypeError(`Invalid type: function not defined for ${wrongType}`);

  if (x == null || x == undefined) return x === null ? "null" : "undefined";

  let prmitiveType = typeof x;

  if (_isPrimitive(prmitiveType)) {
    return prmitiveType;
  }

  if (prmitiveType !== "object") {
    typeError(prmitiveType)();
  }

  const constructorName = (x as object).constructor?.name?.toLowerCase();

  if (!constructorName || !_isCommonObject(constructorName))
    typeError(constructorName)();

  return constructorName as CommonObjectTypes;
}

type AnyObject = {
  [key: string]: any;
};
function _mergeObjects(obj1: AnyObject, obj2: AnyObject): AnyObject {
  let mergedObj: AnyObject = { ...obj1 };

  for (const [key, value] of Object.entries(obj2)) {
    let t1 = _getType(obj1[key]);
    let t2 = _getType(obj2[key]);

    if (obj1[key] && t1 == "object" && t2 == "object") {
      mergedObj[key] = _mergeObjects(obj1[key], obj2[key]);
    } else {
      mergedObj[key] = value;
    }
  }
  return mergedObj;
}

function _isValidType(type: string): type is ValidTypeLiterals {
  return VALID_TYPES.includes(type as ValidTypeLiterals);
}

function _isCommonObject(value: string): boolean {
  return COMMON_OBJECT_TYPES.includes(value as CommonObjectTypes);
}
function _isPrimitive(value: string): value is Primitives {
  return PRIMITIVES.includes(value as Primitives);
}

function _throwTypeError(message: string): () => never {
  return function () {
    throw new TypeError(message);
  };
}

function _handleStringConversion(value: string): number | null {
  // Check if the string is a valid number format
  if (/^0b[01]+$/i.test(value)) {
    return parseInt(value.slice(2), 2);
  }

  if (/^0[xX][0-9a-fA-F]+$/.test(value)) {
    return parseInt(value.slice(2), 16);
  }

  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return /\./.test(value) ? parseFloat(value) : parseInt(value, 10);
  }

  let defaultCase = Number(value);
  if (!isNaN(defaultCase)) {
    return defaultCase;
  }

  return null;
}

function _convertRecursively(value: ValidTypes): ValidTypes {
  let valueType = _getType(value);
  return _isCommonObject(valueType)
    ? convertToNumber(value)
    : !isNaN(Number(value))
    ? Number(value)
    : value;
}

function _convertArrayToNumber(arr: unknown[]): number[] | number | any[] {
  // Try to sum the elements of the array.
  // If it fails, convert each possible element to Number recursively.
  let flatArr = arr.flat(Infinity);
  if (_canBeReducedToNumber(flatArr)) {
    return _reduceToNumber(flatArr);
  }
  return arr.map((el: any) => {
    return _convertRecursively(el);
  });
}

function _convertObjectToNumber(
  obj: Record<string, any>
): Record<string, any> | number {
  // If the object has no numeric value, convert each possible property recursively.
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    result[key] = _convertRecursively(val);
  }

  return result;
}

function _convertMapToNumber(
  map: Map<string, ValidTypes>
): Map<string, ValidTypes> | number {
  const result: Map<string, ValidTypes> = new Map();

  for (const [key, val] of map.entries()) {
    result.set(key, _convertRecursively(val));
  }

  return result;
}

function _convertSetToNumber(set: Set<ValidTypes>): Set<ValidTypes> | number {
  let arr = [...set];
  if (_canBeReducedToNumber(arr)) return _reduceToNumber(arr);

  return new Set(
    arr.map((el: any) => {
      return _convertRecursively(el);
    })
  );
}

function _canBeReducedToNumber(arr: unknown[]): arr is (number | string)[] {
  return arr.every(
    (el) =>
      typeof el === "number" ||
      (typeof el === "string" && _handleStringConversion(el) !== null)
  );
}

function _reduceToNumber(arr: (number | string)[]): number {
  return arr.reduce((acc: number, el: number | string) => {
    if (typeof el === "number") return acc + el;

    if (typeof el === "string") {
      const parsed = _handleStringConversion(el);
      if (parsed !== null) return acc + parsed;
    }

    throw new TypeError(
      `Cannot convert element to number: ${JSON.stringify(el)}`
    );
  }, 0);
}

function _parseString(string: string, type: string): any {
  if (typeof string !== "string") return null;

  try {
    let obj = JSON.parse(string);

    let objType = _getType(obj);

    return objType == type ? obj : null;
  } catch {
    return null;
  }
}

function _coerceToDate(operand: AnyTypedObject): Date {
  // Try to parse JSON. If failure, return date with single value.
  if (operand.type == "string") {
    let date = _makeDateFromString(operand.value);
    if (date) return date;
    throw new TypeError(
      `not possible to convert value of type ${operand.type} to Date`
    );
  }

  if (operand.type == "number") {
    // Pass number as milliseconds.
    return new Date(operand.value);
  }

  throw new TypeError(
    `not possible to convert value of type ${operand.type} to Date`
  );
}

function _coerceToArray(operand: AnyTypedObject): any[] {
  if (_isPrimitive(operand.type) || operand.type == "date") {
    return [operand.value];
  }

  if (operand.type == "map") {
    return Array.from(operand.value.entries());
  }

  if (operand.type == "set") {
    return Array.from(operand.value);
  }

  if (operand.type == "object") {
    return Object.entries(operand.value);
  }

  throw new TypeError(
    `not possible to convert value of type ${operand.type} to Array`
  );
}

function _coerceToMap(operand: AnyTypedObject): Map<string, any> {
  // Try to parse JSON. If failure, return map with single key-value pair.
  if (operand.type == "string") {
    let mapArray = _parseString(operand.value, "array") || [
      [operand.type, operand.value],
    ];

    return new Map(mapArray);
  }

  if (_isPrimitive(operand.type) || operand.type == "date") {
    return new Map([[operand.type, operand.value]]);
  }

  if (operand.type == "array") {
    let isMap = operand.value.every(
      (el: any) => Array.isArray(el) && el.length == 2
    );
    if (isMap) {
      return new Map(operand.value);
    }
    let map = new Map(operand.value.map((el, idx) => [String(idx), el]));
    return map;
  }

  if (operand.type == "set") {
    return new Map(
      Array.from(operand.value).map((el, idx) => [String(idx), el])
    );
  }

  if (operand.type == "object") {
    return new Map(Object.entries(operand.value));
  }

  throw new TypeError(
    `not possible to convert value of type ${operand.type} to Map`
  );
}

function _coerceToSet(operand: AnyTypedObject): Set<any> {
  // Try to parse JSON. If failure, return set with single element.
  if (operand.type == "string") {
    let arr = _parseString(operand.value, "array") || [operand.value];
    return new Set(arr);
  }

  if (_isPrimitive(operand.type) || operand.type == "date") {
    return new Set([operand.value]);
  }

  if (operand.type == "array") {
    return new Set(operand.value);
  }

  if (operand.type == "map") {
    return new Set(operand.value.values());
  }

  if (operand.type == "object") {
    return new Set(Object.values(operand.value));
  }

  throw new TypeError(
    `not possible to convert value of type ${operand.type} to Set`
  );
}

function _coerceToObject(operand: AnyTypedObject): Record<string, any> {
  // Try to parse JSON. If failure, return object with single key-value pair.
  if (operand.type == "string") {
    let obj = _parseString(operand.value, "object") || {
      [operand.type]: operand.value,
    };
    return obj;
  }

  if (_isPrimitive(operand.type) || operand.type == "date") {
    return { [operand.type]: operand.value };
  }

  if (operand.type == "array") {
    return Object.assign({}, operand.value);
  }

  if (operand.type == "map") {
    return Object.fromEntries(operand.value);
  }

  if (operand.type == "set") {
    return Object.assign({}, Array.from(operand.value));
  }

  throw new TypeError(
    `not possible to convert value of type ${operand.type} to Object`
  );
}

function _coerceToBoolean(operand: AnyTypedObject): boolean {
  if (_isPrimitive(operand.type)) {
    if (operand.value == "true" || operand.value == "1" || operand.value == 1)
      return true;
    if (operand.value == "false" || operand.value == "0" || operand.value == 0)
      return false;
    return Boolean(operand.value);
  }
  if (operand.type == "date") {
    // If date, return true if date is valid.
    return !isNaN(operand.value.getTime());
  }

  // If not primitive nor Date, convert to boolean based on truthiness.
  if (operand.type == "set" || operand.type == "map") {
    return Array.from(operand.value).length > 0;
  }
  if (operand.type == "object") {
    return Object.keys(operand.value).length > 0;
  }

  try {
    return Boolean(operand.value);
  } catch (e) {
    throw new TypeError(
      `not possible to convert value of type ${operand.type} to Boolean`
    );
  }
}

function _makeDateFromString(string: string): Date | null {
  let date = new Date(string);
  if (!isNaN(date.getTime())) return date;
  if (_handleStringConversion(string)) return new Date(parseInt(string));
  return null;
}
