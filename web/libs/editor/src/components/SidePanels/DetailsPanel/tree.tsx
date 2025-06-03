import React from 'react';
import {observer} from 'mobx-react';
import Tree from 'react-d3-tree';
import type {CustomNodeElementProps} from 'react-d3-tree';
import './tree.css';

/**
 * Constants controlling node label sizing
 */
const NODE_WIDTH = 400;
const NODE_HEIGHT = 300;


// Helper to extract text for tree nodes from a Region object
function extractText(region: any): string {
  if (!region) return '';
  if (region.text) {
    return Array.isArray(region.text)
      ? region.text.join(' ')
      : String(region.text);
  }
  if (typeof region.getSelectedString === 'function') {
    return region.getSelectedString(' ');
  }
  return '';
}

interface RawNodeDatum {
  name: string;
  attributes?: Record<string, string>;
  children?: RawNodeDatum[];
}


// Custom node element: HTML box only (no circle)
const MixedNodeElement = ({nodeDatum, toggleNode}: CustomNodeElementProps) => (
  <g>
    <foreignObject
      x={-NODE_WIDTH / 2}
      y={0}
      width={NODE_WIDTH}
      height={NODE_HEIGHT}
    >
      <div className="mixed-node-content" data-type={nodeDatum.name}>
        <h3 className="mixed-node-title">{nodeDatum.name}</h3>
        <p className="mixed-node-text">{nodeDatum.attributes.text}</p>
        {nodeDatum.children && nodeDatum.children.length > 0 && (
          <button className="mixed-node-toggle" onClick={toggleNode}>
            {nodeDatum.__rd3t.collapsed ? '➡️ Expand' : '⬅️ Collapse'}
          </button>
        )}
      </div>
    </foreignObject>
  </g>
);

interface PremisesTreeProps {
  relationStore: any;
}

const PremisesTree: React.FC<PremisesTreeProps> = observer(({relationStore}) => {
  const relations = relationStore.orderedRelations || [];
  const nodes: Record<string, RawNodeDatum> = {};
  const childIds = new Set<string>();

  // Initialize nodes with text from region models
  relations.forEach((rel: any) => {
    const {node1, node2} = rel;
    if (!nodes[node1.id]) {
      nodes[node1.id] = {
        name: node1.labelName || node1.id,
        attributes: {text: extractText(node1)},
      };
    }
    if (!nodes[node2.id]) {
      nodes[node2.id] = {
        name: node2.labelName || node2.id,
        attributes: {text: extractText(node2)},
      };
    }
  });

  // Build adjacency (directed edges only)
  relations.forEach((rel: any) => {
    let parentNode: RawNodeDatum;
    let childNode: RawNodeDatum;
    let childId: string;
    if (rel.direction === 'left') {
      // left: node1 <- node2, so node2 is parent, node1 is child
      parentNode = nodes[rel.node1.id];
      childNode = nodes[rel.node2.id];
      childId = rel.node2.id;
    } else if (rel.direction === 'right') {
      // right or bi (or default): node1 -> node2
      parentNode = nodes[rel.node2.id];
      childNode = nodes[rel.node1.id];
      childId = rel.node1.id;
    }
    // assign child
    parentNode.children = parentNode.children || [];
    parentNode.children.push(childNode);
    // mark this node as having a parent
    childIds.add(childId);
  });
  
  // Detect directed cycles in the inverted graph
  const dirAdj: Record<string, string[]> = {};
  Object.keys(nodes).forEach((id) => {
    dirAdj[id] = [];
  });
  relations.forEach((rel: any) => {
    // invert edge: follow same logic as adjacency build
    const fromId = rel.direction === 'left' ? rel.node1.id : rel.node2.id;
    const toId = rel.direction === 'left' ? rel.node2.id : rel.node1.id;
    dirAdj[fromId].push(toId);
  });
  // DFS cycle detection
  const visitedDir = new Set<string>();
  const recStack = new Set<string>();
  let cycleFound = false;

  function dfs(u: string) {
    if (cycleFound) return;
    visitedDir.add(u);
    recStack.add(u);
    for (const v of dirAdj[u] || []) {
      if (!visitedDir.has(v)) {
        dfs(v);
      } else if (recStack.has(v)) {
        cycleFound = true;
        return;
      }
    }
    recStack.delete(u);
  }

  for (const id of Object.keys(dirAdj)) {
    if (!visitedDir.has(id)) dfs(id);
    if (cycleFound) break;
  }
  if (cycleFound) {
    return (
      <div className="tree-error">
        A cycle was detected in relations; tree view is not available.
      </div>
    );
  }
  // Extract roots
  const roots = Object.entries(nodes)
    .filter(([id]) => !childIds.has(id))
    .map(([, node]) => node);

  return (
    <div className="tree-container">
      {roots.map((root, idx) => (
        <div key={idx} className="tree-wrapper">
          <Tree
            data={root}
            orientation="vertical"
            depthFactor={300}
            rootNodeClassName="node__root"
            branchNodeClassName="node__branch"
            leafNodeClassName="node__leaf"
            collapsible={true}
            separation={{siblings: 4, nonSiblings: 4}}
            renderCustomNodeElement={MixedNodeElement}
          />
        </div>
      ))}
    </div>
  );
});

export default PremisesTree;
