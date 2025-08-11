import assert from "assert";

export class TreeNode<T> {
  constructor(
    public data: T,
    public left: TreeNode<T> | null = null,
    public right: TreeNode<T> | null = null
  ) {}
}

type TreeOrders = "in-order" | "pre-order" | "post-order";

export type CompareFn<T> = (n1: T, n2: T) => number;

/**
 * A generic Binary Search Tree (BST) implementation with optional
 * construction from an array of values.
 *
 * This tree stores values in a way that all left descendants are
 * less than the node and all right descendants are greater.
 *
 * Supports insertion, deletion, searching, min/max lookup, and
 * multiple traversal orders.
 *
 * @typeParam T - The type of elements stored in the tree.
 */
export class BinarySearchTree<T> {
  /** The root node of the binary tree. */
  #root: TreeNode<T> | null = null;
  /** A comparison function used to order elements in the tree. */
  private _compare: CompareFn<T>;

  /**
   * Creates a new binary tree.
   *
   * @param compare - A comparison function `(a, b) => number` that defines how to order elements.
   * @param args - Optional values to insert immediately. These will be sorted and used to build a balanced tree.
   */
  constructor(compare: CompareFn<T>, ...args: T[]) {
    this._compare = compare;

    if (args.length) {
      args.sort(this._compare);
      this.#root = this.buildBalancedTree(args, this._compare);
    }
  }

  get root() {
    return this.#root;
  }
  /**
   * Inserts a value into the binary search tree.
   *
   * @param value - The value to insert.
   */
  insert(value: T) {
    this.#root = this._insert(this.#root, value);
  }

  private _insert(node: TreeNode<T> | null, value: T): TreeNode<T> {
    if (node === null) {
      return new TreeNode<T>(value);
    }

    if (this._compare(value, node.data) < 0) {
      node.left = this._insert(node.left, value);
    } else if (this._compare(value, node.data) > 0) {
      node.right = this._insert(node.right, value);
    } else {
      // No duplicates
    }
    return node;
  }

  /**
   * Deletes a node with the specified value from the binary search tree.
   *
   * This method uses recursion to locate the node to delete, then handles three cases:
   * 1. Node has no left child: replace it with its right child.
   * 2. Node has no right child: replace it with its left child.
   * 3. Node has two children: find the in-order successor (smallest node in the right subtree),
   *    replace the node's data with the successor's data, then delete the successor node recursively.
   *
   * @param value - The value to delete from the tree.
   * @returns The updated root node of the (sub)tree after deletion.
   */
  delete(value: T) {
    const deleteNode = function (
      node: TreeNode<T> | null,
      target: T,
      compare: CompareFn<T>
    ) {
      if (!node) return null;

      if (compare(target, node.data) < 0) {
        node.left = deleteNode(node.left, target, compare);
      } else if (compare(target, node.data) > 0) {
        node.right = deleteNode(node.right, target, compare);
      } else {
        if (!node.left) return node.right;
        if (!node.right) return node.left;

        let succesorNode = BinarySearchTree.findMinFromNode(node.right);

        node.data = succesorNode.data;

        node.right = deleteNode(node.right, succesorNode.data, compare);
      }

      return node;
    };

    return deleteNode(this.#root, value, this._compare);
  }

  /**
   * Finds and returns the smallest value in the tree.
   * @returns The minimum value, or null if the tree is empty.
   */
  findMin() {
    if (!this.#root) return null;
    return BinarySearchTree.findMinFromNode(this.#root).data;
  }

  /**
   * Finds and returns the largest value in the tree.
   * @returns The maximum value, or null if the tree is empty.
   */
  findMax() {
    if (!this.#root) return null;
    return BinarySearchTree.findMaxFromNode(this.#root).data;
  }

  /**
   * Builds a balanced binary search tree from a sorted array.
   *
   * @param arr - A sorted array of values.
   * @param compareFn - A comparison function to order the values.
   * @returns The root of the balanced tree.
   */
  buildBalancedTree(arr: any[], compareFn: CompareFn<any>): TreeNode<T> | null {
    if (arr.length === 0) {
      return null;
    }

    const mid = Math.floor(arr.length / 2);
    const node = new TreeNode(arr[mid]);

    node.left = this.buildBalancedTree(arr.slice(0, mid), compareFn);
    node.right = this.buildBalancedTree(arr.slice(mid + 1), compareFn);

    return node;
  }

  /**
   * Searches the tree for a given value.
   * @param value - The value to search for.
   * @returns True if found, false otherwise.
   */
  searchTree(value: T) {
    if (!this.#root) return null;

    const search = function (
      node: TreeNode<T> | null,
      target: T,
      compare: CompareFn<T>
    ) {
      if (!node) return false;

      if (compare(target, node.data) < 0) {
        return search(node.left, target, compare);
      } else if (compare(target, node.data) > 0) {
        return search(node.right, target, compare);
      } else {
        return true;
      }
    };

    return search(this.#root, value, this._compare);
  }

  /**
   * Traverses the tree in the specified order.
   *
   * @param order - One of `"in-order"`, `"pre-order"`, or `"post-order"`.
   * @returns An array of values in the traversal order.
   */
  traverseTree(order: TreeOrders = "in-order") {
    const traverse = function (
      node: TreeNode<T> | null,
      order: TreeOrders
    ): T[] {
      if (!node) return [];

      const left: T[] = traverse(node.left, order);
      const right: T[] = traverse(node.right, order);

      switch (order) {
        case "in-order":
          return left.concat([node.data], right);
        case "pre-order":
          return [node.data].concat(left, right);
        case "post-order":
          return left.concat(right, [node.data]);
      }
    };

    return traverse(this.#root, order);
  }

  /**
   * Finds the minimum node starting from a given node.
   * @param node - The starting node.
   * @returns The node containing the minimum value.
   */
  static findMinFromNode(node: TreeNode<any>) {
    let curr = node;
    while (curr.left !== null) {
      curr = curr.left;
    }
    return curr;
  }

  /**
   * Finds the maximum node starting from a given node.
   * @param node - The starting node.
   * @returns The node containing the maximum value.
   */
  static findMaxFromNode(node: TreeNode<any>) {
    let curr = node;
    while (curr.right !== null) {
      curr = curr.right;
    }
    return curr;
  }
}

// If tree is instance of BinarySearchTree.
function checkBST<T>(tree: BinarySearchTree<T>, CompareFn: CompareFn<T>) {
  let traversed = tree.traverseTree();

  return traversed.every(
    (value: T, idx: number, arr: T[]) =>
      idx === 0 || CompareFn(arr[idx - 1], value) < 0
  );
}

// If not, check recursively all nodes are greater than left tree and smaller than right tree.
function isBST<T>(
  node: TreeNode<T> | null,
  compare: CompareFn<T>,
  min: T | null = null,
  max: T | null = null
): boolean {
  if (!node) return true;

  if (
    (min !== null && compare(node.data, min) <= 0) ||
    (max !== null && compare(node.data, max) >= 0)
  ) {
    return false;
  }

  return (
    isBST(node.left, compare, min, node.data) &&
    isBST(node.right, compare, node.data, max)
  );
}

const nums = [
  1, 2, 43, 75, 23, 5, 7, 8, 34, 3, 4, 5, 9, 10, 11, 14, 12, 13, 15,
];

// Simple numeric comparison function
const numberCompare: CompareFn<number> = (a, b) => a - b;

// Construct a BinarySearchTree with initial values (balanced tree created automatically)
const tree = new BinarySearchTree<number>(
  numberCompare,
  10,
  5,
  15,
  3,
  7,
  12,
  18
);

// Check the root node value
console.log("Root node value:", tree.root?.data); // Should be the middle of sorted array (10)
assert.equal(tree.root?.data, 10);

// Insert new values
tree.insert(6);
tree.insert(17);
console.log("Added 6 and 17");

// Search for values (existing and non-existing)
assert.equal(tree.searchTree(7), true);
assert.equal(tree.searchTree(17), true);
assert.equal(tree.searchTree(100), false);
console.log("Search tests passed");

// Find min and max values
const minValue = tree.findMin();
const maxValue = tree.findMax();
console.log("Min value in tree:", minValue); // 3
console.log("Max value in tree:", maxValue); // 18
assert.equal(minValue, 3);
assert.equal(maxValue, 18);

// Traverse the tree in different orders
console.log("In-order traversal:", tree.traverseTree("in-order")); // Sorted ascending
console.log("Pre-order traversal:", tree.traverseTree("pre-order")); // Root first
console.log("Post-order traversal:", tree.traverseTree("post-order")); // Root last

// Delete some values
tree.delete(5); // Node with two children
tree.delete(18); // Leaf node
tree.delete(100); // Non-existent node, should do nothing

console.log("After deletions, in-order traversal:", tree.traverseTree());

// Final checks
assert.equal(tree.searchTree(5), false);
assert.equal(tree.searchTree(18), false);
assert.equal(tree.searchTree(10), true);
console.log("Deletion tests passed");

// Optional: visualize the tree root after operations
console.log("Tree root after operations:", tree.root);

// Algorithms test
const compare = (a: number, b: number) => {
  if (a < b) return -1;
  else if (a > b) return 1;
  else {
    return 0;
  }
};

// Check BinarySearchTree instance is BST.
assert(checkBST(tree, compare));

// Check custom Binary Trees are BST
const validBST = new TreeNode(
  10,
  new TreeNode(5, new TreeNode(3), new TreeNode(7)),
  new TreeNode(15, new TreeNode(12), new TreeNode(18))
);
// Invalid BST
const invalidBST = new TreeNode(
  10,
  new TreeNode(5, new TreeNode(3), new TreeNode(12)),
  new TreeNode(15, new TreeNode(11), new TreeNode(18))
);
assert(!isBST(invalidBST, compare));
assert(isBST(validBST, compare));
