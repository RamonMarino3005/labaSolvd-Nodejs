import { Queue } from "./Queue.js";
import { MinHeap } from "./MinHeap.js";

/**
 * Represents an edge in a graph.
 *
 * @template T - The type of the nodes in the graph.
 */
type Edge<T> = {
  /** The starting node of the edge */
  from: T;

  /** The ending node of the edge */
  to: T;

  /** The weight or cost associated with the edge */
  weight: number;
};

/**
 * Represents a node in the adjacency list with its associated weight.
 *
 * @template T - The type of the node value.
 */
export class GraphNode<T> {
  /**
   * Creates an instance of GraphNode.
   * @param node - The node value.
   * @param weight - The weight associated with the edge to this node.
   */
  constructor(public node: T, public weight: number) {}
}

/**
 * A generic weighted graph implementation using an adjacency list.
 *
 * Supports directed or undirected edges, weighted edges, node and edge retrieval,
 * and graph traversal algorithms like Depth First Search and Breadth First Search.
 *
 * @template T - The type of nodes in the graph.
 */
export class Graph<T> {
  /** adjacency list storing nodes and their neighbors */
  private _adjacencyList: Map<T, GraphNode<T>[]>;

  /**
   * Creates a new graph instance.
   *
   * @param initialGraph - Optional initial adjacency list.
   */
  constructor(initialGraph?: Map<T, T[]>) {
    this._adjacencyList = initialGraph || new Map();
  }

  /**
   * Gets the adjacency list map of the graph.
   */
  get adjacencyList() {
    return this._adjacencyList;
  }

  /**
   * Returns all nodes in the graph.
   *
   * @returns An array of all nodes.
   */
  getAllNodes() {
    return [...this._adjacencyList.keys()];
  }

  /**
   * Returns all edges in the graph.
   *
   * @returns An array of edges, each containing from, to, and weight.
   */
  getAllEdges(): Edge<T>[] {
    return [...this._adjacencyList.entries()]
      .map(([node, connections]) => {
        return connections.map((adjNode) => {
          let { node: to, weight } = adjNode;
          return { from: node, to, weight };
        });
      })
      .flat();
  }

  /**
   * Adds a node to the graph.
   *
   * @param value - The node value to add.
   * @returns True if node was added, false if it already existed.
   */
  addNode(value: T) {
    let nodeExists = this._adjacencyList.has(value);

    if (!nodeExists) {
      this._adjacencyList.set(value, []);
      return true;
    }
    return false;
  }

  /**
   * Adds an edge between two nodes.
   *
   * Adds the nodes if they don't already exist.
   *
   * @param from - The source node.
   * @param to - The target node.
   * @param weight - The weight of the edge (default set to 1).
   * @param undirected - If true, adds edges in both directions (default is true).
   * @returns True after edge(s) are added.
   */
  addEdge(from: T, to: T, weight: number = 1, undirected: boolean = true) {
    this.addNode(from);
    this.addNode(to);

    // Add edge to vertexes
    this._adjacencyList.get(from)?.push({ node: to, weight });
    if (undirected) {
      this._adjacencyList.get(to)?.push({ node: from, weight });
    }
    return true;
  }

  /**
   * Returns the neighbors of a node.
   *
   * @param node - The node to get neighbors for.
   * @returns An array of GraphNodes representing neighbors and their weights, or undefined if node doesn't exist.
   */
  getNeighbors(node: T) {
    return this._adjacencyList.get(node);
  }

  /**
   * Performs Depth First Search to find a path from startNode to target.
   *
   * @param adjecencyList - The adjacency list of the graph.
   * @param startNode - The node to start searching from.
   * @param target - The node to find.
   * @returns An array representing the path from startNode to target, or null if no path exists.
   */
  static DepthFirstSearch<T>(
    adjecencyList: Map<T, GraphNode<T>[]>,
    startNode: T,
    target: T
  ) {
    let node = startNode;
    if (!node) return null;

    let visited = new Set<T>();

    const search = function (
      graph: Map<T, GraphNode<T>[]>,
      node: T | null,
      path: T[],
      visited: Set<T>
    ): null | T[] {
      if (!node || visited.has(node)) return null;
      if (node === target) return path;

      visited.add(node);

      for (const neighbor of graph.get(node) || []) {
        if (!visited.has(neighbor.node)) {
          let path_found = search(
            graph,
            neighbor.node,
            [...path, neighbor.node],
            visited
          );
          if (path_found) return path_found;
        }
      }

      return null;
    };

    return search(adjecencyList, node, [node], visited);
  }

  /**
   * Performs Breadth First Search to find a path from startNode to target.
   *
   * @param adjecencyList - The adjacency list of the graph.
   * @param startNode - The node to start searching from.
   * @param target - The node to find.
   * @returns An array representing the path from startNode to target, or null if no path exists.
   */
  static BreathFirstSearch<T>(
    adjecencyList: Map<T, GraphNode<T>[]>,
    startNode: T,
    target: T
  ) {
    let node = startNode;
    if (!node) return null;

    const visited = new Set<T>([node]);
    let queue = new Queue<[T, T[]]>([node, [node]]);

    while (queue.size > 0) {
      let [currNode, path] = queue.dequeue()!;
      if (currNode === target) return path;

      for (const neighbor of adjecencyList.get(currNode) || []) {
        if (!visited.has(neighbor.node)) {
          visited.add(neighbor.node);
          queue.enqueue([neighbor.node, [...path, neighbor.node]]);
        }
      }
    }

    return null;
  }
}

function dijkstra<T>(graph: Graph<T>, from: T, to: T) {
  const negativeEdges = graph.getAllEdges().some((edge) => edge.weight < 0);
  if (negativeEdges) return null;

  const visited = new Set<T>();

  const nodeMap: Map<T, [number, T | null]> = new Map();
  graph.getAllNodes().forEach((node) => {
    nodeMap.set(node, [node === from ? 0 : Infinity, null]);
  });

  const compareNodes = (a: GraphNode<T>, b: GraphNode<T>) => {
    if (a.weight > b.weight) return 1;
    else if (a.weight < b.weight) return -1;
    else {
      return 0;
    }
  };
  const p_queue: MinHeap<GraphNode<T>> = new MinHeap(compareNodes);
  p_queue.insert(new GraphNode(from, 0));

  while (!p_queue.isEmpty()) {
    let selectedNode = p_queue.popMin()!;
    visited.add(selectedNode.node);

    let neighbors = graph.getNeighbors(selectedNode.node);

    for (const neighbor of neighbors || []) {
      if (visited.has(neighbor.node)) continue;

      let [curr_weight] = nodeMap.get(neighbor.node)!;

      let totalWeight = nodeMap.get(selectedNode.node)![0] + neighbor.weight;

      if (totalWeight < curr_weight) {
        nodeMap.set(neighbor.node, [totalWeight, selectedNode.node]);
        p_queue.insert(neighbor);
      }
    }
  }

  let path = [];

  let currNode: T | null = to;
  while (currNode !== null) {
    path.push(currNode);
    currNode = nodeMap.get(currNode)![1];
  }
  return path.reverse();
}

// 1. Create a graph.
const cityMap = new Graph<string>();

// 2. Add cities (nodes) and roads (edges with weights in km)
cityMap.addEdge("A", "B", 4); // A ↔ B = 4 km
cityMap.addEdge("A", "C", 2); // A ↔ C = 2 km
cityMap.addEdge("B", "C", 1); // B ↔ C = 1 km
cityMap.addEdge("B", "D", 5); // B ↔ D = 5 km
cityMap.addEdge("C", "D", 8); // C ↔ D = 8 km
cityMap.addEdge("C", "E", 10); // C ↔ E = 10 km
cityMap.addEdge("D", "E", 2); // D ↔ E = 2 km
cityMap.addEdge("D", "Z", 6); // D ↔ Z = 6 km
cityMap.addEdge("E", "Z", 3); // E ↔ Z = 3 km

// 3. Get the graph structure.
console.log("All cities:", cityMap.getAllNodes());
console.log("All roads:", cityMap.getAllEdges());

// 4. Depth First Search - find any path from A to Z
const dfsPath = Graph.DepthFirstSearch(cityMap.adjacencyList, "A", "Z");
console.log("DFS Path from A to Z:", dfsPath);

// 5. Breadth First Search - find shortest path in terms of nodes (not distance)
const bfsPath = Graph.BreathFirstSearch(cityMap.adjacencyList, "A", "Z");
console.log("BFS Path from A to Z:", bfsPath);

// 6. Dijkstra’s Algorithm - shortest path based on road distances
const shortestPath = dijkstra(cityMap, "A", "Z");
console.log("Dijkstra shortest path from A to Z:", shortestPath);
