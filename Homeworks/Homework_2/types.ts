export const PRIMITIVES = ["number", "string", "boolean"] as const;

export type Primitives = (typeof PRIMITIVES)[number];
export type PrimitiveTypes = number | string | boolean;

// Too many object types to handle, pick common ones
export const COMMON_OBJECT_TYPES = [
  "array",
  "object",
  "set",
  "map",
  "date",
] as const;
export type CommonObjectTypes = (typeof COMMON_OBJECT_TYPES)[number];
export type CommonObjects =
  | Array<any>
  | Set<any>
  | Map<any, any>
  | Date
  | Record<string, any>;

export type NonDateObjects = Exclude<CommonObjects, Date>;

export type AllCommonTypeLiterals =
  | Primitives
  | CommonObjectTypes
  | "null"
  | "undefined";
export type AllCommonTypes = PrimitiveTypes | CommonObjects | null | undefined;
export const VALID_TYPES = [
  "number",
  "string",
  "boolean",
  "array",
  "object",
  "set",
  "map",
  "date",
] as const;
export type ValidTypeLiterals = (typeof VALID_TYPES)[number];
export type ValidTypes = PrimitiveTypes | CommonObjects;

export type TypeMap = {
  number: number;
  string: string;
  boolean: boolean;
  array: any[];
  object: Record<string, any>;
  set: Set<any>;
  map: Map<any, any>;
  date: Date;
};
export type TypeKey = keyof TypeMap;

// Enforce type safety using mapped types.
export type TypedObject<T extends TypeKey> = {
  type: T;
  value: TypeMap[T];
};

export type AnyTypedObject = {
  [K in TypeKey]: TypedObject<K>;
}[TypeKey];

export type ConvertToNumberType = number | NonDateObjects;
