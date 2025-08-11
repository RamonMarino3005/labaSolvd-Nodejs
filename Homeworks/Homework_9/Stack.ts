import { CompareFn } from "./BinaryTree.js";
import { Graph } from "./Graph.js";

/**
 * A generic stack that follows the LIFO principle.
 *
 * @template T The type of elements stored in the stack.
 */
export class Stack<T> {
  /** @private Internal array holding stack elements. */
  #stack;

  /**
   * Creates a new Stack instance.
   *
   * @param {T[]} [initialValues] - Optional array of initial values to populate the stack.
   */
  constructor(initialValues?: T[]) {
    this.#stack = initialValues || [];
  }

  /**
   * Pushes a new element onto the top of the stack.
   *
   * @param {T} x - The element to add.
   */
  push(x: T) {
    this.#stack.push(x);
  }

  /**
   * Removes and returns the top element of the stack.
   *
   * @returns {T|null} The removed element, or `null` if the stack is empty.
   */
  pop(): T | null {
    return this.#stack.pop() ?? null;
  }

  /**
   * Returns the top element of the stack without removing it.
   *
   * @returns {T|null} The top element, or `null` if the stack is empty.
   */
  peak(): T | null {
    return !this.isEmpty() ? this.#stack[this.#stack.length - 1] : null;
  }

  /**
   * Checks if the stack is empty.
   *
   * @returns {boolean} `true` if the stack contains no elements, otherwise `false`.
   */
  isEmpty(): boolean {
    return this.#stack.length === 0;
  }

  /**
   * Returns the number of elements in the stack.
   *
   * @returns {number} The current size of the stack.
   */
  size(): number {
    return this.#stack.length;
  }

  /**
   * Returns a string representation of the stack.
   *
   * - Displays `"EMPTY STACK"` if there are no elements.
   * - Otherwise, shows elements from top to bottom, separated by arrows.
   *
   * @returns {string} A formatted string of stack contents.
   */
  toString(): string {
    if (this.#stack.length === 0)
      return `
-----------------------
    EMPTY STACK
-----------------------
`;

    let lastIdx = this.#stack.length - 1;
    return this.#stack.reduceRight((multiline, curr, idx) => {
      let breaker = idx !== lastIdx ? "\n\n^\n|\n\n" : "";
      return `${multiline}${breaker}${curr}`;
    }, "\n");
  }

  /**
   * Returns an iterator that iterates over the stack elements in LIFO order.
   *
   * @returns {Iterator<T>} An iterator over the stack.
   */ [Symbol.iterator](): Iterator<T> {
    let idx = this.#stack.length - 1;
    let stack_items = this.#stack.slice();
    return {
      next() {
        if (idx >= 0) {
          return { value: stack_items[idx--], done: false };
        } else {
          return { value: undefined, done: true };
        }
      },
    };
  }
}

/**
 * A stack that supports retrieving the minimum and maximum values in O(1) time,
 * in addition to standard stack operations..
 *
 * Internally maintains two helper stacks (`#minStack` and `#maxStack`) that track
 * the minimum and maximum elements seen so far at each level of the stack.
 *
 * @template T The type of elements stored in the stack.
 */
class MinMaxStack<T> extends Stack<T> {
  /** @private Stack tracking the minimum value at each depth. */
  #minStack: T[] = [];

  /** @private Stack tracking the maximum value at each depth. */
  #maxStack: T[] = [];

  /** @private Comparison function to determine ordering. */
  private _compare: CompareFn<T>;

  /**
   * Creates a new MinMaxStack instance.
   *
   * @param {CompareFn<T>} compare - A comparison function that returns:
   *   - A negative number if `a < b`
   *   - Zero if `a === b`
   *   - A positive number if `a > b`
   * @param {T[]} [initialValues] - Optional initial values to populate the stack.
   *
   * @example
   * // If stack will be numeric, then:
   * const stack = new MinMaxStack<number>((a, b) => a - b);
   */
  constructor(compare: CompareFn<T>, initialValues?: T[]) {
    super(initialValues);
    this._compare = compare;

    if (initialValues) {
      initialValues.forEach((value) => {
        this.updateMinStack(value);
        this.updateMaxStack(value);
      });
    }
  }

  /**
   * Pushes a new value onto the stack. Updates the min/max stacks.
   *
   * @param {T} value - The value to push.
   */
  push(value: T) {
    super.push(value);
    this.updateMinStack(value);
    this.updateMaxStack(value);
  }

  /**
   * Removes and returns the top value of the stack,. Updates the min/max stacks.
   *
   * @returns {T|null} The removed value, or `null` if the stack is empty.
   */
  pop(): T | null {
    let popped = super.pop();

    if (popped !== null) {
      this.#minStack.pop();
      this.#maxStack.pop();
    }

    return popped;
  }

  /**
   * Returns the current minimum value in the stack.
   *
   * @returns {T|null} The minimum value, or `null` if the stack is empty.
   */
  getMin(): T | null {
    return !this.isEmpty() ? this.#minStack[this.#minStack.length - 1] : null;
  }

  /**
   * Returns the current maximum value in the stack.
   *
   * @returns {T|null} The maximum value, or `null` if the stack is empty.
   */
  getMax(): T | null {
    return !this.isEmpty() ? this.#maxStack[this.#maxStack.length - 1] : null;
  }

  /**
   * @private
   * Updates the minStack with a new value.
   *
   * @param {T} value - The new value to consider for min tracking.
   */
  private updateMinStack(value: T) {
    if (
      this.#minStack.length === 0 ||
      this._compare(value, this.getMin()!) < 0
    ) {
      this.#minStack.push(value);
    } else {
      this.#minStack.push(this.getMin()!);
    }
  }

  /**
   * @private
   * Updates the maxStack with a new value.
   *
   * @param {T} value - The new value to consider for max tracking.
   */
  private updateMaxStack(value: T) {
    if (
      this.#maxStack.length === 0 ||
      this._compare(value, this.getMax()!) > 0
    ) {
      this.#maxStack.push(value);
    } else {
      this.#maxStack.push(this.getMax()!);
    }
  }
}

// Create a new stack
const stack = new Stack<number>();

// Push items
stack.push(10);
stack.push(20);
stack.push(30);

// Peek at the top item
console.log(stack.peak()); // 30

// Pop the top item
console.log(stack.pop()); // 30

// Check size
console.log(stack.size()); // 2

// Check if empty
console.log(stack.isEmpty()); // false

// Print the stack
console.log(stack.toString());

// Iterate over the stack (top to bottom)
for (const item of stack) {
  console.log(item);
}

/**
 * --------------------------
 * COMBINING DATA STRUCTURES: USING STACK FOR DFS IMPLEMENTATION INSTEAD OF RECURSION.
 * --------------------------
 */
function DFS<T>(graph: Graph<T>, start: T, target: T) {
  const stack = new Stack<[T, T[]]>([[start, [start]]]);

  const visited = new Set<T>();

  while (!stack.isEmpty()) {
    let [node, path] = stack.pop()!;

    if (visited.has(node)) continue;
    visited.add(node);

    if (node === target) return path;

    for (const neighbor of graph.getNeighbors(node) || []) {
      if (!visited.has(neighbor.node)) {
        stack.push([neighbor.node, [...path, neighbor.node]]);
      }
    }
  }

  return null;
}

// STACK IMPLEMENTED DFS USAGE
const g = new Graph<string>();
g.addEdge("A", "B", 1);
g.addEdge("A", "C", 1);
g.addEdge("B", "D", 1);
g.addEdge("C", "E", 1);
g.addEdge("D", "F", 1);
g.addEdge("E", "F", 1);

console.log("Graph nodes:", g.getAllNodes());
console.log("Graph edges:", g.getAllEdges());

const path = DFS(g, "A", "F");
console.log("DFS path from A to F:", path);

// --- MinMaxStack: Example Usage ---
const minMaxStack = new MinMaxStack<number>((a, b) => a - b);

minMaxStack.push(5);
minMaxStack.push(3);
minMaxStack.push(7);
minMaxStack.push(4);

console.log("Min:", minMaxStack.getMin()); // 3
console.log("Max:", minMaxStack.getMax()); // 7

minMaxStack.pop();
console.log("After pop -> Min:", minMaxStack.getMin()); // 3
console.log("After pop -> Max:", minMaxStack.getMax()); // 7
