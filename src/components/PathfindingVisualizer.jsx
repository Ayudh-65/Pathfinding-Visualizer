import React, { useState } from "react";

import {
  dijkstra,
  getDijkstraNodesInShortestPathOrder,
} from "../algorithms/dijkstra";
import "./Node.css";
import "./PathfindingVisualizer.css";

const START_NODE_COLUMN = 8;
const START_NODE_ROW = 6;
const FINISH_NODE_COLUMN = 32;
const FINISH_NODE_ROW = 13;

const ROWS = 20;
const COLUMNS = 40;

const getInitialGrid = () => {
  const newGrid = [];
  for (let row = 0; row <= ROWS; row++) {
    const currentRow = [];
    for (let column = 0; column <= COLUMNS; column++) {
      currentRow.push({
        column,
        row,
        isStart: column === START_NODE_COLUMN && row === START_NODE_ROW,
        isFinish: column === FINISH_NODE_COLUMN && row === FINISH_NODE_ROW,
        distance: Infinity,
        isVisited: false,
        isWall: false,
        previousNode: null,
      });
    }
    newGrid.push(currentRow);
  }
  return newGrid;
};

export default function PathfindingVisualizer() {
  const [grid, setGrid] = useState(getInitialGrid());
  const [draggedNode, setDraggedNode] = useState(null);
  const [startNode, setStartNode] = useState([
    START_NODE_ROW,
    START_NODE_COLUMN,
  ]);
  const [finishNode, setFinishNode] = useState([
    FINISH_NODE_ROW,
    FINISH_NODE_COLUMN,
  ]);

  const handleDragStart = (nodeType) => {
    setDraggedNode(nodeType);
  };

  const handleDrop = (row, column) => {
    const newGrid = grid.slice();

    // make existing start/finish node into regular node
    if (draggedNode === "start")
      newGrid[startNode[0]][startNode[1]].isStart = false;
    else if (draggedNode === "finish")
      newGrid[finishNode[0]][finishNode[1]].isFinish = false;

    // set new node as start/finish
    newGrid[row][column].isStart = draggedNode === "start" && true;
    newGrid[row][column].isFinish = draggedNode === "finish" && true;

    setStartNode(draggedNode === "start" ? [row, column] : startNode);
    setFinishNode(draggedNode === "finish" ? [row, column] : finishNode);

    setGrid(newGrid);
    setDraggedNode(null);
  };

  const visualizeDijkstra = async () => {
    // Clear previous path and reset node states
    const newGrid = grid.slice();
    for (const row of newGrid) {
      for (const node of row) {
        if (node.isVisited || node.distance !== Infinity || node.previousNode) {
          node.isVisited = false;
          node.distance = Infinity;
          node.previousNode = null;
          const nodeDoc = document.getElementById(
            `node-${node.row}-${node.column}`
          );
          if (nodeDoc) {
            nodeDoc.className =
              "node" +
              (node.isStart
                ? " start"
                : node.isFinish
                ? " finish"
                : node.isWall
                ? " wall"
                : "");
          }
        }
      }
    }
    setGrid(newGrid);

    const startNodeObj = newGrid[startNode[0]][startNode[1]];
    const finishNodeObj = newGrid[finishNode[0]][finishNode[1]];
    const visitedNodesInOrder = await dijkstra(
      newGrid,
      startNodeObj,
      finishNodeObj
    );
    const nodesInShortestPathOrder = await getDijkstraNodesInShortestPathOrder(
      finishNodeObj
    );

    for (let i = 0; i < visitedNodesInOrder.length; i++) {
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        if (node.isStart || node.isFinish) return;
        const nodeDoc = document.getElementById(
          `node-${node.row}-${node.column}`
        );
        if (nodeDoc) nodeDoc.className = "node visited";
      }, 5 * i);
    }

    setTimeout(() => {
      for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
        setTimeout(() => {
          const node = nodesInShortestPathOrder[i];
          if (node.isStart || node.isFinish) return;
          const nodeDoc = document.getElementById(
            `node-${node.row}-${node.column}`
          );
          if (nodeDoc) nodeDoc.className = "node path";
        }, 10 * i);
      }
    }, 5 * visitedNodesInOrder.length);
  };

  return (
    <div>
      <div className="menu">
        <button className="visualizeButton" onClick={visualizeDijkstra}>
          Visualize!
        </button>
      </div>
      <div className="grid">
        {grid.map((row, rowId) => {
          return (
            <div key={rowId} className="row">
              {row.map(({ column, row, isStart, isFinish, isWall }, nodeId) => (
                <div
                  key={nodeId}
                  id={`node-${row}-${column}`}
                  className={`node ${
                    isStart
                      ? "start"
                      : isFinish
                      ? "finish"
                      : isWall
                      ? "wall"
                      : ""
                  }`}
                  onDragStart={() =>
                    handleDragStart(
                      isStart ? "start" : isFinish ? "finish" : null
                    )
                  }
                  onDropCapture={() => handleDrop(row, column)}
                  onDragOver={(e) => e.preventDefault()}
                  draggable
                ></div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
