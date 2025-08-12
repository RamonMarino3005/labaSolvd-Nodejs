import { LinkedList } from "../Homework_9/LinkedList.js";

class ListNode<T> {
  constructor(public key: string, public value: T) {}
}

type HashMap<T> = Array<LinkedList<ListNode<T>> | undefined>;

/**
 * A hash table implementation that uses **separate chaining** with linked lists
 * to store key-value pairs. Keys are strings, and values are of a generic type `T`.
 *
 * @typeParam T - The type of values stored in the hash table.
 */
class HashTable<T> {
  private _table: HashMap<T>;

  /** Total number of buckets in the hash table. */
  public size: number;

  /** Number of stored elements in the hash table. */
  public count: number = 0;

  /**
   * Creates a new hash table.
   *
   * @param tableSize - The number of buckets in the table.
   */
  constructor(tableSize: number) {
    this._table = new Array<LinkedList<ListNode<T>> | undefined>(
      tableSize
    ).fill(undefined);
    this.size = tableSize;
  }

  /**
   * Hash function to map a string key to an index within the table.
   *
   * @param input - The string key to hash.
   * @param tableSize - The current number of buckets.
   * @returns A number between `0` and `tableSize - 1`.
   */
  hashFn(input: string, tableSize: number): number {
    let hashOutput = 0;
    let primeMultiplier = 31;

    for (let i = 0; i < input.length; i++) {
      hashOutput =
        (hashOutput * primeMultiplier + input.charCodeAt(i)) % tableSize;
    }

    return hashOutput;
  }

  /**
   * Inserts a key-value pair into the hash table.
   * If the key already exists, updates its value.
   *
   * @param key - The string key.
   * @param value - The value to associate with the key.
   */
  insert(key: string, value: T) {
    let index = this.hashFn(key, this.size);

    if (!this._table[index]) {
      this._table[index] = new LinkedList();
    }

    let list = this._table[index];
    let preexistingEl = list.find((node: ListNode<T>) => node.key === key);

    if (preexistingEl) {
      preexistingEl.value = value;
      return;
    }

    const newListNode = new ListNode<T>(key, value);
    list.insert(newListNode);
    this.count++;
  }

  /**
   * Retrieves the value associated with a given key.
   *
   * @param key - The key to look up.
   * @returns The value if found, or `undefined` if not present.
   */
  get(key: string): T | undefined {
    const index = this.hashFn(key, this.size);

    let list = this._table[index];
    if (!list) return undefined;

    return list.find((node) => node.key == key)?.value;
  }

  /**
   * Deletes the entry with the given key.
   *
   * @param key - The key to remove.
   * @returns `true` if the key was found and removed, `false` otherwise.
   */
  delete(key: string): boolean {
    const index = this.hashFn(key, this.size);

    let list = this._table[index];
    if (!list) return false;

    let deleted = list.deleteBy((node) => node.key == key);

    if (deleted) this.count--;
    return deleted;
  }

  /**
   * Returns a string representation of the hash table,
   * showing each bucket and its contents.
   *
   * @returns A multi-line string with each index and linked list contents.
   */
  getTable() {
    let multiline = "\n";
    for (const [index, list] of this._table.entries()) {
      multiline += `|${index} ---> ${list?.toString()}\n`;
    }
    return multiline;
  }

  /**
   * Returns a string representation of a single bucket's contents.
   *
   * @param index - The bucket index.
   * @returns A string containing all nodes in the bucket.
   */
  getBucket(index: number): string {
    let str = "";
    console.log("LinkedList:", this._table[index]);
    for (const node of this._table[index] || []) {
      str += `|${index} ---> ${JSON.stringify(node)}\n`;
    }
    return str ?? "undefined";
  }
}

type UserData = {
  uid: string;
  name: string;
  lastName: string;
  email: string;
};

// Mock Users
let mock: UserData[] = [
  {
    uid: "U001",
    name: "Ramon",
    lastName: "Marino",
    email: "ramon.marino@example.com",
  },
  {
    uid: "U002",
    name: "Tomas",
    lastName: "Carrol",
    email: "tomas.carrol@example.com",
  },
  {
    uid: "U003",
    name: "Lucas",
    lastName: "Smith",
    email: "lucas.smith@example.com",
  },

  {
    uid: "U004",
    name: "Charlie",
    lastName: "Azekiel",
    email: "charlie.azekiel@example.com",
  },
  {
    uid: "U005",
    name: "Diana",
    lastName: "Moldovar",
    email: "diana.moldovar@example.com",
  },
  {
    uid: "U006",
    name: "Rita",
    lastName: "Polion",
    email: "rita.polion@example.com",
  },
  {
    uid: "U007",
    name: "Juana",
    lastName: "Morata",
    email: "juana.morata@example.com",
  },
  {
    uid: "U008",
    name: "George",
    lastName: "Lucas",
    email: "george.lucas@example.com",
  },
];

// Create HashTable
let hashTable = new HashTable<UserData>(10);

// Insert all users
for (const user of mock) {
  hashTable.insert(user.name, user);
}

// Print the entire hash table buckets and contents
console.log("Initial hash table:\n", hashTable.getTable());

// Retrieve a user by name
const userName = "Charlie";
const user = hashTable.get(userName);
console.log(`\nRetrieved user "${userName}":`, user);

// Update a user (change email)
hashTable.insert("Rita", {
  uid: "U006",
  name: "Rita",
  lastName: "Polion",
  email: "rita.updated@example.com",
});
console.log(`\nAfter updating Rita's email:\n`, hashTable.get("Rita"));

// Delete a user
const deleteUser = "Lucas";
const deleted = hashTable.delete(deleteUser);
console.log(`\nDeleted user "${deleteUser}":`, deleted);

// Final table state
console.log("\nFinal hash table:\n", hashTable.getTable());
