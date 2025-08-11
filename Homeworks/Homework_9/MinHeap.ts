import { CompareFn } from "./BinaryTree.js";

/**
 * A generic **min-heap** implementation.
 *
 * The smallest element is always at the root and can be retrieved
 * or removed in O(log n) time.
 *
 * @template T The type of elements stored in the heap.
 */
export class MinHeap<T> {
  /** @private Internal array representing the heap. */
  #heap: T[];

  /** @private Comparison function for determing the ordering elements. */
  private _compare: CompareFn<T>;

  /**
   * Creates a new MinHeap instance.
   *
   * @param {CompareFn<T>} compare - A comparison function returning:
   *   - Negative if `a < b`
   *   - Zero if `a === b`
   *   - Positive if `a > b`
   * @param {T[]} [args] - Optional initial elements to populate the heap.
   *   If provided, the heap is built in O(n) time.
   *
   * @example
   * const heap = new MinHeap<number>((a, b) => a - b, [5, 3, 8]);
   * console.log(heap.popMin()); // 3
   * console.log(heap.popMin()); // 5
   * console.log(heap.popMin()); // 8
   */
  constructor(compare: CompareFn<T>, args?: T[]) {
    this._compare = compare;
    if (args) {
      this.#heap = [...args];
      let minNode = Math.floor(this.#heap.length / 2) - 1;
      for (let i = minNode; i >= 0; i--) {
        this.heapifyDown(i);
      }
    } else {
      this.#heap = [];
    }
  }

  /**
   * Returns the underlying heap array (for inspection/debugging).
   *
   * @returns {T[]} The internal heap array.
   */
  get heap(): T[] {
    return this.#heap;
  }

  /**
   * Returns the index of a node's parent.
   *
   * @param {number} index - The index of the child node.
   * @returns {number} The index of the parent node.
   */
  parent(index: number): number {
    return Math.floor((index - 1) / 2);
  }

  /**
   * Returns the index of a node's left child.
   *
   * @param {number} index - The index of the parent node.
   * @returns {number} The index of the left child node.
   */
  leftChild(index: number): number {
    return 2 * index + 1;
  }

  /**
   * Returns the index of a node's right child.
   *
   * @param {number} index - The index of the parent node.
   * @returns {number} The index of the right child node.
   */
  rightChild(index: number): number {
    return 2 * index + 2;
  }

  /**
   * Inserts a value into the heap.
   *
   * @param {T} value - The value to insert.
   */
  insert(value: T) {
    this.#heap.push(value);
    this.heapifyUp(this.#heap.length - 1);
  }

  /**
   * Removes and returns the minimum value from the heap.
   *
   * @returns {T|null} The smallest element, or `null` if the heap is empty.
   */
  popMin(): T | null {
    if (!this.#heap) return null;

    let min = this.#heap[0];
    this.#heap[0] = this.#heap[this.#heap.length - 1];
    this.#heap.pop();
    this.heapifyDown(0);
    return min;
  }

  /**
   * Moves the element at the given index up to restore heap order.
   *
   * @param {number} index - The index of the element to move up.
   */
  heapifyUp(index: number) {
    while (
      index !== 0 &&
      this._compare(this.#heap[this.parent(index)], this.#heap[index]) > 0
    ) {
      [this.#heap[this.parent(index)], this.#heap[index]] = [
        this.#heap[index],
        this.#heap[this.parent(index)],
      ];
      index = this.parent(index);
    }
  }

  /**
   * Moves the element at the given index down to restore heap order.
   *
   * @param {number} index - The index of the element to move down.
   */
  heapifyDown(index: number) {
    let heapSize = this.#heap.length;
    let currMin = index;

    let i = 0;
    while (true) {
      let left = this.leftChild(index);
      let right = this.rightChild(index);
      if (
        left < heapSize &&
        this._compare(this.#heap[left], this.#heap[currMin]) < 0
      ) {
        currMin = left;
      }
      if (
        right < heapSize &&
        this._compare(this.#heap[right], this.#heap[currMin]) < 0
      ) {
        currMin = right;
      }
      if (currMin !== index) {
        [this.#heap[index], this.#heap[currMin]] = [
          this.#heap[currMin],
          this.#heap[index],
        ];
        index = currMin;
      } else {
        break;
      }
    }
  }

  /**
   * Checks whether the heap is empty.
   *
   * @returns {boolean} `true` if the heap contains no elements, otherwise `false`.
   */
  isEmpty(): boolean {
    return !(this.#heap.length > 0);
  }
}

// --- Example Usage ---
const heap = new MinHeap<number>((a, b) => a - b, [5, 3, 8, 1]);
console.log("Initial Min:", heap.popMin()); // 1
heap.insert(0);
heap.insert(7);
console.log("Next Min:", heap.popMin()); // 0
console.log("Next Min:", heap.popMin()); // 3

/**
 * MinHeap is primarily used for priority queues.
 * Go to ./BinaryTree.js to see implementation of MinHeap
 * in dijkstra's algorithm.
 */
