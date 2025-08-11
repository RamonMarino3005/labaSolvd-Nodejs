import assert from "node:assert";
import { Node } from "./Node.js";

/**
 * A generic FIFO queue implementation
 * using a singly linked list under the hood.
 *
 * Elements are enqueued at the tail and dequeued from the head.
 * Maintains O(1) time complexity for both enqueue and dequeue operations.
 *
 * @typeParam T - The type of elements stored in the queue.
 */
export class Queue<T> {
  /** Reference to the first node in the queue. */
  #head: Node<T> | null = null;

  /** Reference to the last node in the queue. */
  #tail: Node<T> | null = null;

  /** Number of elements currently in the queue. */
  private _size: number = 0;

  /**
   * Creates a new queue optionally pre-filled with values.
   * @param args - Optional values to enqueue on construction.
   */
  constructor(...args: any[]) {
    args.forEach((val) => {
      this.enqueue(val);
    });
  }

  /** Returns the number of elements in the queue. */
  get size() {
    return this._size;
  }

  /**
   * Adds a value to the end of the queue.
   * @param value - The value to enqueue.
   */
  enqueue(value: T) {
    const newNode = new Node(value);
    if (!this.#head) {
      this.#head = newNode;
      this.#tail = this.#head;
    } else {
      this.#tail!.next = newNode;
      this.#tail = newNode;
    }
    this._size++;
  }

  /**
   * Removes and returns the value at the front of the queue.
   * @returns The dequeued value, or null if the queue is empty.
   */
  dequeue() {
    if (this.#head) {
      let val = this.#head.data;
      this.#head = this.#head.next;
      this._size--;
      return val;
    }
    return null;
  }

  /**
   * Returns the value at the front of the queue without removing it.
   * @returns The front value, or null if the queue is empty.
   */
  peek() {
    return this.#head ? this.#head.data : null;
  }

  /**
   * Checks whether the queue has no elements.
   * @returns True if the queue is empty, false otherwise.
   */
  isEmpty() {
    return this.#head === null;
  }

  /**
   * Returns a string representation of the queue contents.
   * @returns A string in the form "A -> B -> C" or "Empty Queue".
   */
  toString() {
    if (!this.#head) return "Empty Queue";
    let str = `${this.#head.data}`;
    let temp = this.#head.next;
    while (temp !== null) {
      str += " -> " + temp.data;
      temp = temp.next;
    }
    return str;
  }
}

/**
 * Creating a Queue and Enqueuing Elements
 */
const queue = new Queue<number>();

// Add elements to the queue
queue.enqueue(10);
queue.enqueue(20);
queue.enqueue(30);

console.log("Queue after enqueuing:", queue.toString()); // 10 -> 20 -> 30
assert.equal(queue.size, 3);
assert.equal(queue.isEmpty(), false);

/**
 * Peeking at the Front of the Queue
 */
// Peek does not remove the element
const front = queue.peek();
assert.equal(front, 10);
console.log("Front element (peek):", front);

/**
 * Dequeueing Elements
 */
const firstOut = queue.dequeue();
assert.equal(firstOut, 10);
console.log("Dequeued:", firstOut);
console.log("Queue now:", queue.toString()); // 20 -> 30

// Dequeue again
const secondOut = queue.dequeue();
assert.equal(secondOut, 20);
console.log("Dequeued:", secondOut);
console.log("Queue now:", queue.toString()); // 30

/**
 * Using the Constructor to pre-fill the Queue
 */
const prefilled = new Queue("A", "B", "C");
console.log("Prefilled queue:", prefilled.toString()); // A -> B -> C
assert.equal(prefilled.size, 3);
assert.equal(prefilled.peek(), "A");

/**
 * Emptying the Queue
 */
while (!prefilled.isEmpty()) {
  console.log("Removing:", prefilled.dequeue());
}
assert.equal(prefilled.isEmpty(), true);
console.log("After emptying:", prefilled.toString()); // Empty Queue

/**
 * Edge Case: Dequeue from Empty Queue
 */
const emptyQueue = new Queue<number>();
assert.equal(emptyQueue.dequeue(), null);
assert.equal(emptyQueue.peek(), null);
console.log("Empty queue peek and dequeue work as expected");
