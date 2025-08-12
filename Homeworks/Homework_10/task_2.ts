export function hashFn(input: string, tableSize: number): number {
  let hashOutput = 0;
  let primeMultiplier = 31; // Prime multipliers create better distribution

  for (let i = 0; i < input.length; i++) {
    hashOutput =
      (hashOutput * primeMultiplier + input.charCodeAt(i)) % tableSize;
  }

  return hashOutput;
}

function resizeTable<T>(
  oldTable: HashTable,
  newSize: number,
  hashFn: (input: string, tableSize: number) => number
) {
  const newTable: HashTable = {
    size: newSize,
    occupied: oldTable.occupied,
    maxLoad: 0.7,
    table: new Array(newSize).fill(undefined),
  };

  for (let item of oldTable.table) {
    if (item !== undefined) {
      let index = hashFn(String(item), newSize);

      while (newTable.table[index] !== undefined) {
        index = (index + 1) % newSize;
      }

      newTable.table[index] = item;
    }
  }

  return newTable;
}

type HashTable = {
  size: number;
  occupied: number;
  maxLoad: number;
  table: (string | undefined)[];
};

const tableSize = 10;
let hashTable: HashTable = {
  size: tableSize,
  occupied: 0,
  maxLoad: 0.7,
  table: new Array(tableSize).fill(undefined),
};

// Strings to store
const values = [
  "apple",
  "banana",
  "grape",
  "melon",
  "pear",
  "kiwi",
  "plum",
  "pepper",
  "lemon",
  "orange",
  "tomato",
  "lettuce",
];

// Populate the hash table
for (const value of values) {
  let index = hashFn(value, tableSize);

  // check if max load reached
  if ((hashTable.occupied + 1) / hashTable.size > hashTable.maxLoad) {
    hashTable = resizeTable(hashTable, hashTable.size * 2, hashFn);
  }

  // Find first available spot from given index.
  while (hashTable.table[index] !== undefined) {
    index = (index + 1) % hashTable.size;
  }

  hashTable.table[index] = value;
  hashTable.occupied++;
}

console.log("Final hash table:");
console.log(hashTable);
