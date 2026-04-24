const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const USER_ID = 'ayushdutta_11112004';
const EMAIL_ID = 'dutta_ayush@srmap.edu.in';
const COLLEGE_ROLL_NUMBER = 'AP23110011131';

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
  const childrenToParents = {};
  
  for (const edge of edges) {
    if (!childrenToParents[edge.child]) {
      childrenToParents[edge.child] = edge.parent;
    }
  }
  
  for (const edge of edges) {
    if (!tree[edge.parent]) {
      tree[edge.parent] = {};
    }
    if (!tree[edge.child]) {
      tree[edge.child] = {};
    }
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

function findGroup(nodes, edges) {
  const nodeSet = new Set(nodes);
  const adj = {};
  for (const edge of edges) {
    if (!adj[edge.parent]) adj[edge.parent] = [];
    adj[edge.parent].push(edge.child);
  }
  
  const visited = new Set();
  const group = [];
  
  function dfs(node) {
    visited.add(node);
    group.push(node);
    if (adj[node]) {
      for (const neighbor of adj[node]) {
        if (!visited.has(neighbor)) {
          dfs(neighbor);
        }
      }
    }
  }
  
  for (const node of nodes) {
    if (!visited.has(node)) {
      dfs(node);
    }
  }
  
  return group;
}

function getEdgesForGroup(allEdges, groupNodes) {
  return allEdges.filter(e => groupNodes.has(e.parent) && groupNodes.has(e.child));
}

function buildHierarchies(processedEdges) {
  if (processedEdges.length === 0) return [];
  
  const allNodes = [...new Set([...processedEdges.map(e => e.parent), ...processedEdges.map(e => e.child)])];
  const roots = findRoots(processedEdges);
  
  const graph = {};
  const parents = new Set();
  const children = new Set();
  
  for (const edge of processedEdges) {
    parents.add(edge.parent);
    children.add(edge.child);
    if (!graph[edge.parent]) graph[edge.parent] = [];
    graph[edge.parent].push(edge.child);
  }
  
  const orphanedNodes = [...parents].filter(p => !children.has(p));
  for (const root of roots) {
    if (!orphanedNodes.includes(root)) {
      orphanedNodes.push(root);
    }
  }
  
  const componentMap = {};
  
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
          if (!visited.has(child)) {
            stack.push(child);
          }
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
    if (!root) {
      root = [...comp].sort()[0];
    }
    
    const hasCycle = detectCycle(compEdges, root);
    
    if (hasCycle) {
      totalCycles++;
      hierarchies.push({
        root,
        tree: {},
        has_cycle: true
      });
    } else {
      const tree = buildTree(compEdges);
      const depth = getDepth(tree, root);
      
      if (depth > maxDepth || (depth === maxDepth && root < (largestRoot || ''))) {
        maxDepth = depth;
        largestRoot = root;
      }
      
      hierarchies.push({
        root,
        tree: tree[root],
        depth
      });
    }
  }
  
  hierarchies.sort((a, b) => a.root.localeCompare(b.root));
  
  const validTrees = hierarchies.filter(h => !h.has_cycle);
  
  return {
    hierarchies,
    totalTrees: validTrees.length,
    totalCycles,
    largestTreeRoot: largestRoot
  };
}

app.post('/bfhl', (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: 'Invalid request: data must be an array' });
    }
    
    const invalidEntries = [];
    const validEdges = [];
    const duplicateEdges = new Set();
    const seenEdges = new Set();
    
    for (const entry of data) {
      if (!validateEdge(entry)) {
        invalidEntries.push(entry);
      } else {
        const edgeKey = entry.trim();
        if (seenEdges.has(edgeKey)) {
          duplicateEdges.add(edgeKey);
        } else {
          seenEdges.add(edgeKey);
          validEdges.push(parseEdge(entry));
        }
      }
    }
    
    const result = buildHierarchies(validEdges);
    
    const response = {
      user_id: USER_ID,
      email_id: EMAIL_ID,
      college_roll_number: COLLEGE_ROLL_NUMBER,
      hierarchies: result.hierarchies,
      invalid_entries: invalidEntries,
      duplicate_edges: [...duplicateEdges],
      summary: {
        total_trees: result.totalTrees,
        total_cycles: result.totalCycles,
        largest_tree_root: result.largestTreeRoot
      }
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;