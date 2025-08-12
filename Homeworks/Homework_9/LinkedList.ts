import assert from "node:assert";
import { Node } from "./Node.js";

/**
 * A generic singly linked list implementation.
 *
 * Supports insertion, deletion, searching, and traversal.
 * Maintains references to the head and tail nodes for efficient
 * append operations. Can also be constructed from an existing
 * chain of nodes, with cycle detection.
 *
 * @typeParam T - The type of elements stored in the list.
 */
export class LinkedList<T> {
  /** Reference to the root node of the list. */
  private _head: Node<T> | null = null;

  /** Reference to the last node in the list. */
  private _tail: Node<T> | null = null;

  /** Number of elements in the list. */
  _size: number = 0;

  /**
   * Creates a new linked list from the given values.
   * @param args - Optional initial values to insert into the list.
   */
  constructor(...args: T[]) {
    args.forEach((value) => {
      this.insert(value);
    });
  }

  /** Returns the number of elements in the list. */
  get size() {
    return this._size;
  }

  /**
   * Inserts a value at the end of the list.
   * @param value - The value to insert.
   */
  insert(value: T) {
    const newNode = new Node(value);
    if (!this._head) {
      this._head = newNode;
      this._tail = this._head;
    } else {
      this._tail!.next = newNode;
      this._tail = newNode;
    }
    this._size++;
  }

  /**
   * Deletes the first occurrence of the given value from the list.
   * @param value - The value to delete.
   * @returns True if the value was found and removed, false otherwise.
   */
  delete(value: T): boolean {
    if (!this._head) return false;

    if (this._head.data === value) {
      this._head = this._head!.next;

      if (this._head === null) {
        this._tail = this._head;
      }

      this._size--;

      return true;
    }

    let curr = this._head;

    while (curr.next !== null) {
      if (curr.next.data === value) {
        curr.next = curr.next.next;

        // If element deleted was the last el, update tail.
        if (curr.next === null) {
          this._tail = curr;
        }

        this._size--;
        return true;
      }
      curr = curr.next;
    }

    return false;
  }

  /**
   * Deletes the first value from the list that satisfied
   * the provided function.
   *
   * @param compareFn - comparison function `(a, b) => boolean` to determine equality.
   * @returns True if a matching value was found and removed; otherwise, false.
   */
  deleteBy(filterFn: (a: T) => boolean): boolean {
    if (!this._head) return false;

    if (filterFn(this._head.data)) {
      this._head = this._head!.next;

      if (this._head === null) {
        this._tail = this._head;
      }

      this._size--;
      return true;
    }

    let curr = this._head;

    while (curr.next !== null) {
      if (filterFn(curr.next.data)) {
        curr.next = curr.next.next;

        // If element deleted was the last el, update tail.
        if (curr.next === null) {
          this._tail = curr;
        }

        this._size--;
        return true;
      }
      curr = curr.next;
    }

    return false;
  }

  /**
   * Removes and returns the last value in the list.
   * @returns The removed value, or undefined if the list is empty.
   */
  pop() {
    if (!this._tail || !this._head) return;

    let tail = this._tail?.data;
    let curr = this._head;

    while (curr.next && curr.next.next) {
      curr = curr.next;
    }

    curr.next = null;
    this._tail = curr;

    this._size--;
    return tail;
  }

  /** Returns the last value in the list without removing it. */
  peek() {
    return this._tail?.data;
  }

  /** Returns the first value in the list without removing it. */
  peekFirst() {
    return this._head?.data;
  }

  /**
   * Removes and returns the first node in the list.
   * @returns The removed node, or undefined if the list is empty.
   */
  shift() {
    if (!this._head) return;

    let shifted = this._head;
    this._head = this._head.next;

    this._size--;
    return shifted;
  }

  /**
   * Checks whether the list contains the given value.
   * @param value - The value to search for.
   * @returns True if the value exists in the list, false otherwise.
   */
  search(value: T) {
    let curr = this._head;

    while (curr !== null) {
      if (curr.data === value) return true;
      curr = curr.next;
    }

    return false;
  }

  /**
   * Searches the linked list for the first element that satisfies the provided function.
   *
   * @param predicate - A function that takes an element of type `T` and returns a boolean.
   *                    The search returns the first element that returns `true`.
   * @returns The first element in the list that satisfies the predicate, or `null` if none is found.
   */
  find(predicate: (value: T) => boolean): T | null {
    let curr = this._head;

    while (curr !== null) {
      if (predicate(curr.data)) {
        return curr.data;
      }
      curr = curr.next;
    }

    return null;
  }

  isEmpty(): boolean {
    return this.size === 0;
  }

  /**
   * Detects if a linked list contains a cycle.
   * Uses Floyd's cycle detection algorithm.
   *
   * @param root - The starting node of the list.
   * @returns The node where the cycle begins, or null if no cycle exists.
   */
  static cycle<T>(root: Node<T>) {
    if (!root) return null;

    let slow: Node<T> | null = root;
    let fast: Node<T> | null = root;

    let met = false;
    while (fast && fast.next) {
      slow = slow!.next;
      fast = fast.next.next;

      if (slow == fast) {
        met = true;
        break;
      }
    }

    if (!met) {
      return null;
    } else {
      slow = root;
      while (slow !== fast) {
        slow = slow!.next;
        fast = fast!.next;
      }

      return slow;
    }
  }

  /**
   * Creates a LinkedList instance from an existing root node.
   * Handles cycles by breaking them after the second visit.
   *
   * @param root - The first node in the chain.
   * @returns A new LinkedList instance.
   */
  static from<T>(root: Node<T>): LinkedList<T> {
    const cycle = LinkedList.cycle(root);
    let visited = false;

    const list = Object.create(this.prototype);
    list._head = root;

    let tail = root;
    let count = 1;

    while (tail.next) {
      if (cycle && tail.next === cycle) {
        if (visited) {
          tail.next = null;
          break;
        } else {
          visited = true;
        }
      }

      tail = tail.next;
      count++;
    }

    list._tail = tail;
    list._size = count;

    return list as LinkedList<T>;
  }

  /**
   * Returns a string representation of the list.
   * @returns A string in the form "A -> B -> C".
   */
  toString() {
    if (!this._head) return "Empty List";

    let stringify = (value: T) => {
      if (value && typeof value === "object") {
        // Try to stringify safely
        try {
          return JSON.stringify(value);
        } catch {
          return String(value);
        }
      } else {
        return String(value);
      }
    };

    const stringified: string[] = [];

    let curr: Node<T> | null = this._head;

    while (curr !== null) {
      stringified.push(stringify(curr.data));
      curr = curr.next;
    }

    return stringified.join(" -> ");
  }

  /**
   * Makes the list iterable.
   */
  [Symbol.iterator]() {
    let node = this._head;
    return {
      next() {
        if (node !== null) {
          let value = node.data;
          node = node.next;
          return { value, done: false };
        } else {
          return { value: undefined, done: true };
        }
      },
    };
  }
}

/**
 * 1. Creating a LinkedList from an array of values
 */
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const linkedList = new LinkedList(...numbers);
console.log("Initial list:", linkedList.toString()); // 1 -> 2 -> ... -> 9

// Remove last element (pop)
const removedLast = linkedList.pop();
assert.equal(removedLast, 9);
console.log("After pop():", linkedList.toString()); // 1 -> 2 -> ... -> 8

// Peek last element without removing
const lastItem = linkedList.peek();
assert.equal(lastItem, 8);

// Peek first element without removing
let firstItem = linkedList.peekFirst();
assert.equal(firstItem, 1);

// Remove first element (shift)
linkedList.shift();
firstItem = linkedList.peekFirst();
assert.equal(firstItem, 2);
console.log("After shift():", linkedList.toString()); // 2 -> 3 -> ... -> 8

// Delete a middle element
linkedList.delete(4);
assert.equal(linkedList.toString(), "2 -> 3 -> 5 -> 6 -> 7 -> 8");

/**
 * 2. Creating a LinkedList from a manually built chain of nodes
 */
// Manual node creation
const root: Node<number> = { data: 1, next: null };
const node2: Node<number> = { data: 2, next: null };
const node3: Node<number> = { data: 3, next: null };
const node4: Node<number> = { data: 4, next: null };

// Linking nodes together
root.next = node2;
node2.next = node3;
node3.next = node4;

// Create a LinkedList instance from an existing node chain
let manualList = LinkedList.from(root);
console.log("Manual list:", manualList.toString()); // 1 -> 2 -> 3 -> 4

/**
 * 3. Detecting and handling cycles
 */
// Introduce a cycle: node4 -> node2
node4.next = node2;

// Detect the cycle
let cycleStart = LinkedList.cycle(root);
assert.deepEqual(cycleStart, node2);
console.log("Cycle at node:", cycleStart);

// Build a LinkedList safely from a cycled chain
let cycledList = LinkedList.from(root);
console.log("Cycled list:", cycledList.toString()); // Stops before infinite loop

/**
 * 4. Searching, deleting, and iterating
 */
assert.equal(cycledList.search(3), true); // Value exists
assert.equal(cycledList.peek(), 4); // Last element before cycle break

// Attempt to delete a value not in the list
assert.equal(cycledList.delete(9), false);

// Delete an existing value
assert.equal(cycledList.delete(4), true);
console.log("After deleting 4:", cycledList.toString());

// Iterate over list
console.log("Iterating over list:");
for (const value of cycledList) {
  console.log(value);
}
