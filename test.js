const { test, describe } = require('node:test');
const assert = require('node:assert');

function validateEdge(edge) {
  const trimmed = edge.trim();
  if (!trimmed) return false;
  if (!trimmed.includes('->')) return false;
  const [parent, child] = trimmed.split('->');
  if (!parent || !child) return false;
  if (parent.length !== 1 || child.length !== 1) return false;
  if (!/[A-Z]/.test(parent) || !/[A-Z]/.test(child)) return false;
  if (parent === child) return false;
  return true;
}

function parseEdge(edge) {
  const [parent, child] = edge.trim().split('->');
  return { parent, child };
}

function findRoots(edges) {
  const children = new Set(edges.map(e => e.child));
  const parents = new Set(edges.map(e => e.parent));
  const roots = [];
  for (const parent of parents) {
    if (!children.has(parent)) {
      roots.push(parent);
    }
  }
  return roots.length > 0 ? roots : [];
}

function buildTree(edges) {
  const tree = {};
  for (const edge of edges) {
    if (!tree[edge.parent]) tree[edge.parent] = {};
    if (!tree[edge.child]) tree[edge.child] = {};
  }
  for (const edge of edges) {
    tree[edge.parent][edge.child] = tree[edge.child];
  }
  return tree;
}

function detectCycle(edges, root) {
  const adj = {};
  for (const edge of edges) {
    if (!adj[edge.parent]) adj[edge.parent] = [];
    adj[edge.parent].push(edge.child);
  }
  const visited = new Set();
  const recStack = new Set();
  function dfs(node) {
    visited.add(node);
    recStack.add(node);
    if (adj[node]) {
      for (const neighbor of adj[node]) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (recStack.has(neighbor)) {
          return true;
        }
      }
    }
    recStack.delete(node);
    return false;
  }
  const nodes = [...new Set([...edges.map(e => e.parent), ...edges.map(e => e.child)])];
  for (const node of nodes) {
    if (!visited.has(node)) {
      if (dfs(node)) return true;
    }
  }
  return false;
}

function getDepth(tree, root) {
  if (!tree[root] || Object.keys(tree[root]).length === 0) return 1;
  let maxDepth = 0;
  for (const child of Object.keys(tree[root])) {
    maxDepth = Math.max(maxDepth, getDepth(tree, child));
  }
  return maxDepth + 1;
}

function buildHierarchies(processedEdges) {
  if (processedEdges.length === 0) return { hierarchies: [], totalTrees: 0, totalCycles: 0, largestTreeRoot: null };
  const allNodes = [...new Set([...processedEdges.map(e => e.parent), ...processedEdges.map(e => e.child)])];
  const roots = findRoots(processedEdges);
  const graph = {};
  const children = new Set();
  for (const edge of processedEdges) {
    children.add(edge.child);
    if (!graph[edge.parent]) graph[edge.parent] = [];
    graph[edge.parent].push(edge.child);
  }
  function findComponent(start, visited = new Set()) {
    const component = [];
    const stack = [start];
    while (stack.length > 0) {
      const node = stack.pop();
      if (visited.has(node)) continue;
      visited.add(node);
      component.push(node);
      if (graph[node]) {
        for (const child of graph[node]) {
          if (!visited.has(child)) stack.push(child);
        }
      }
    }
    return component;
  }
  const visited = new Set();
  const components = [];
  for (const node of allNodes) {
    if (!visited.has(node)) {
      const component = findComponent(node, visited);
      components.push(component);
    }
  }
  const hierarchies = [];
  let totalCycles = 0;
  let maxDepth = 0;
  let largestRoot = null;
  for (const comp of components) {
    if (comp.length === 0) continue;
    const compEdges = processedEdges.filter(e => comp.includes(e.parent) && comp.includes(e.child));
    let root = comp.find(n => !compEdges.some(e => e.child === n));
    if (!root) root = [...comp].sort()[0];
    const hasCycle = detectCycle(compEdges, root);
    if (hasCycle) {
      totalCycles++;
      hierarchies.push({ root, tree: {}, has_cycle: true });
    } else {
      const tree = buildTree(compEdges);
      const depth = getDepth(tree, root);
      if (depth > maxDepth || (depth === maxDepth && root < (largestRoot || ''))) {
        maxDepth = depth;
        largestRoot = root;
      }
      hierarchies.push({ root, tree: tree[root], depth });
    }
  }
  hierarchies.sort((a, b) => a.root.localeCompare(b.root));
  const validTrees = hierarchies.filter(h => !h.has_cycle);
  return { hierarchies, totalTrees: validTrees.length, totalCycles, largestTreeRoot: largestRoot };
}

describe('validateEdge', () => {
  test('valid edges', () => {
    assert.strictEqual(validateEdge('A->B'), true);
    assert.strictEqual(validateEdge('A->C'), true);
    assert.strictEqual(validateEdge('X->Y'), true);
  });

  test('invalid: not node format', () => {
    assert.strictEqual(validateEdge('hello'), false);
  });

  test('invalid: not uppercase letters', () => {
    assert.strictEqual(validateEdge('1->2'), false);
  });

  test('invalid: multi-character parent', () => {
    assert.strictEqual(validateEdge('AB->C'), false);
  });

  test('invalid: wrong separator', () => {
    assert.strictEqual(validateEdge('A-B'), false);
  });

  test('invalid: missing child', () => {
    assert.strictEqual(validateEdge('A->'), false);
  });

  test('invalid: self-loop', () => {
    assert.strictEqual(validateEdge('A->A'), false);
  });

  test('invalid: empty string', () => {
    assert.strictEqual(validateEdge(''), false);
  });

  test('trims whitespace', () => {
    assert.strictEqual(validateEdge('  A->B  '), true);
  });
});

describe('parseEdge', () => {
  test('parses correctly', () => {
    assert.deepStrictEqual(parseEdge('A->B'), { parent: 'A', child: 'B' });
  });
});

describe('buildHierarchies', () => {
  test('example from instructions', () => {
    const edges = ['A->B', 'A->C', 'B->D', 'C->E', 'E->F', 'X->Y', 'Y->Z', 'Z->X', 'P->Q', 'Q->R', 'G->H', 'G->I'].map(parseEdge);
    const result = buildHierarchies(edges);
    assert.strictEqual(result.hierarchies.length, 4);
    assert.strictEqual(result.totalTrees, 3);
    assert.strictEqual(result.totalCycles, 1);
    assert.strictEqual(result.largestTreeRoot, 'A');
  });

  test('empty edges', () => {
    const result = buildHierarchies([]);
    assert.strictEqual(result.hierarchies.length, 0);
    assert.strictEqual(result.totalTrees, 0);
    assert.strictEqual(result.totalCycles, 0);
  });

  test('single edge', () => {
    const edges = [parseEdge('A->B')];
    const result = buildHierarchies(edges);
    assert.strictEqual(result.totalTrees, 1);
    assert.strictEqual(result.totalCycles, 0);
    assert.strictEqual(result.hierarchies[0].root, 'A');
  });

  test('detects cycle', () => {
    const edges = [parseEdge('X->Y'), parseEdge('Y->Z'), parseEdge('Z->X')];
    const result = buildHierarchies(edges);
    assert.strictEqual(result.totalCycles, 1);
    assert.strictEqual(result.hierarchies[0].has_cycle, true);
  });

  test('duplicates handled separately', () => {
    const edges = [parseEdge('G->H'), parseEdge('G->I')];
    const result = buildHierarchies(edges);
    assert.strictEqual(result.hierarchies[0].root, 'G');
    assert.strictEqual(result.totalTrees, 1);
  });
});

describe('getDepth', () => {
  test('simple chain', () => {
    const tree = buildTree([parseEdge('A->B'), parseEdge('B->C')]);
    assert.strictEqual(getDepth(tree, 'A'), 3);
  });

  test('single node', () => {
    const tree = buildTree([]);
    assert.strictEqual(getDepth(tree, 'A'), 1);
  });
});

console.log('Running tests...');