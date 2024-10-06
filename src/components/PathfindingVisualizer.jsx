import React, { useEffect, useState } from "react";

import { breadthFirstSearch, getBfsNodesInShortestPathOrder } from "../algorithms/bfs";
import { depthFirstSearch, getDfsNodesInShortestPathOrder } from "../algorithms/dfs";
import "./Node.css";
import "./PathfindingVisualizer.css";

const MIN_ROWS = 5;
const MIN_COLUMNS = 6;
// Node size in pixels
const NODE_SIZE = 25;


const getInitialGrid = (rowCount, columnCount, startNode, finishNode) => {
  const newGrid = [];
  for (let row = 0; row <= rowCount; row++) {
    const currentRow = [];
    for (let column = 0; column <= columnCount; column++) {
      currentRow.push({
        column,
        row,
        isStart: row === startNode[0] && column === startNode[1],
        isFinish: row === finishNode[0] && column === finishNode[1],
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
  const [gridSize, setGridSize] = useState([MIN_ROWS, MIN_COLUMNS]);
  const [startNode, setStartNode] = useState([3, 2]);
  const [finishNode, setFinishNode] = useState([3, 5]);
  const [grid, setGrid] = useState(getInitialGrid(gridSize[0], gridSize[1], startNode, finishNode));
  const [draggedNode, setDraggedNode] = useState(null);
  const [creatingWalls, setCreatingWalls] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [algorithm, setAlgorithm] = useState("bfs");
  

  const calculateGridSize = () => {
    const rowCount = Math.max(Math.floor(window.innerHeight * 0.84 / NODE_SIZE), MIN_ROWS);
    const columnCount = Math.max(Math.floor(window.innerWidth * 0.98 / NODE_SIZE) - 1, MIN_COLUMNS);
    const newStartNode = [Math.floor(rowCount * 0.5), Math.floor(columnCount * 0.2)]
    const newFinishNode = [Math.floor(rowCount * 0.5), Math.floor(columnCount * 0.8)]

    setStartNode(newStartNode);
    setFinishNode(newFinishNode);
    setGridSize([rowCount, columnCount]);
  };

  useEffect(() => {
    calculateGridSize();
    window.addEventListener("resize", calculateGridSize);

    return () => {
      window.removeEventListener("resize", calculateGridSize);
    };
  }, []);

  useEffect(() => {
    setGrid(getInitialGrid(gridSize[0], gridSize[1], startNode, finishNode));
  }, [gridSize])

  useEffect(() => {
    // If mouse leaves the grid
    window.addEventListener("mouseup", () => setCreatingWalls(false));
    return () => window.removeEventListener("mouseup", () => setCreatingWalls(false));
  }, []);

  const clearGrid = () => {
    const newGrid = grid.map((row) =>
      row.map((node) => {
        const nodeDoc = document.getElementById(`node-${node.row}-${node.column}`);
        if (nodeDoc) {
          nodeDoc.className = "node" + (node.isStart ? " start" : node.isFinish ? " finish" : "");
        }
        return {
          ...node,
          distance: Infinity,
          isVisited: false,
          isWall: false,
          previousNode: null,
        };
      })
    );
    setGrid(newGrid);
  };

  const handleDragStart = (nodeType) => {
    setDraggedNode(nodeType);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if(creatingWalls) setCreatingWalls(false);
  };

  const handleDrop = (row, column) => {
    if(!draggedNode) return;
    if(creatingWalls) setCreatingWalls(false);

    const newGrid = [...grid];

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

  const toggleWall = (row, column, create = true) => {
    const newGrid = [...grid];
    newGrid[row][column].isWall = create;
    setGrid(newGrid);
  };

  const handleMouseDown = (row, column, e) => {
    if(grid[row][column].isStart || grid[row][column].isFinish) return;

    setCreatingWalls(true);
    toggleWall(row, column, !e.shiftKey);
  };

  const handleMouseEnter = (row, column, e) => {
    if(!creatingWalls) return;
    if(grid[row][column].isStart || grid[row][column].isFinish) return;
    toggleWall(row, column, !e.shiftKey);
  };

  const toggleInfo = () => {
    const infoDiv = document.getElementById("info");
    infoDiv.className = !showInfo ? "info infoShow" : "info";
    setShowInfo(!showInfo);
  };

  const handleAlgoChange = (e) => {
    setAlgorithm(e.target.value);
  };

  const getVisitedNodes = (newGrid, startNodeObj, finishNodeObj) => {
    switch(algorithm) {
      case "dijkstra":
        return breadthFirstSearch(newGrid, startNodeObj, finishNodeObj);
      case "dfs":
        return depthFirstSearch(newGrid, startNodeObj, finishNodeObj);
      default:
        return breadthFirstSearch(newGrid, startNodeObj, finishNodeObj);
    }
  };

  const getNodesInShortestPathOrder = (finishNodeObj) => {
    switch(algorithm) {
      case "dijkstra":
        return getBfsNodesInShortestPathOrder(finishNodeObj);
      case "dfs":
        return getDfsNodesInShortestPathOrder(finishNodeObj);
      default:
        return getBfsNodesInShortestPathOrder(finishNodeObj);
    }
  };

  const visualizeAlgorithm = async () => {
    // Clear previous path and reset node states
    const newGrid = grid.map((row) =>
      row.map((node) => {
        if (node.isVisited || node.distance !== Infinity || node.previousNode) {
          const nodeDoc = document.getElementById(`node-${node.row}-${node.column}`);
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
          return {
            ...node,
            distance: Infinity,
            isVisited: false,
            previousNode: null,
          };
        }
        return node;
      })
    );
    setGrid(newGrid);

    const startNodeObj = newGrid[startNode[0]][startNode[1]];
    const finishNodeObj = newGrid[finishNode[0]][finishNode[1]];
    const visitedNodesInOrder = getVisitedNodes(newGrid, startNodeObj, finishNodeObj);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNodeObj);

    for (let i = 0; i < visitedNodesInOrder.length; i++) {
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        if (node.isStart || node.isFinish) return;
        const nodeDoc = document.getElementById(`node-${node.row}-${node.column}`);
        if (nodeDoc) nodeDoc.className = "node visited";
      }, 7 * i);
    }

    setTimeout(() => {
      for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
        setTimeout(() => {
          const node = nodesInShortestPathOrder[i];
          if (node.isStart || node.isFinish) return;
          const nodeDoc = document.getElementById(`node-${node.row}-${node.column}`);
          if (nodeDoc) nodeDoc.className = "node path";
        }, 10 * i);
      }
    }, 7 * visitedNodesInOrder.length);
  };

  return (
    <div className="base">
      <div className="menu">
        <div className="titleDiv">Pathfinding Visualizer 
          <a href="https://github.com/Ayudh-65/pathfinding-visualizer" target="_blank" rel="noopener noreferrer">
            <button className="github-button">
              <img src={`${process.env.PUBLIC_URL}/github-logo.svg`} alt="GitHub Logo" />
            </button>
          </a>
        </div>
        <div className="controlsDiv">
          <label htmlFor="algorithm" className="algoSelectLabel">Algorithm:</label>
          <select onChange={(e) => handleAlgoChange(e)} id="algorithm" className="algoDropDown">
            <option value="bfs">BFS</option>
            <option value="dfs">DFS</option>
          </select>
          <button className="visualizeButton" onClick={visualizeAlgorithm}>
            Start !
          </button>
          <button className="clearButton" onClick={clearGrid}>
            Clear Grid
          </button>
        </div>
        <div className="infoButtonDiv">
          <button onClick={toggleInfo}>Tutorial</button>
        </div>
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
                  onDrop={() => handleDrop(row, column)}
                  onDragOver={(e) => handleDragOver(e)}
                  onMouseDown={(e) => {
                    if (isStart || isFinish) return;
                    handleMouseDown(row, column, e);
                  }}
                  onMouseEnter={(e) => handleMouseEnter(row, column, e)}
                  onMouseUp={() => setCreatingWalls(false)}
                  draggable={isStart || isFinish}
                ></div>
              ))}
            </div>
          );
        })}
      </div>

      <div id="info" className="info infoShow ">
        <div className="info-content">
          <div>
            <div className="info-title">Welcome to Pathfinding Visualizer!</div>
            <div className="info-subtitle">An interactive path finding algorithm visualizer.</div>
          </div> 
          <div className="info-legend">
            <div><div className="node start"></div>Start Node</div>
            <div><div className="node finish"></div>Finish Node</div>
            <div><div className="node wall"></div>Wall Node</div>
            <div><div className="node visited"></div>Explored Node</div>
            <div><div className="node path"></div>Shortest Path</div>
          </div>
          <div className="info-legend2">
            <div><b className="control-title"><u>Controls:</u></b></div>
            <div>▶ <b>Create Walls: </b> Left Click</div>
            <div>▶ <b>Remove Walls: </b> Shift + Left Click</div>
            <div>▶ <b>Move Start/Finish Nodes: </b> Drag & Drop</div>
          </div>
          <div className="info-legend2">
            <div>Try different algorithms from the drop-down and visualize how they work.</div>
          </div>
        </div>
        <button onClick={toggleInfo}>Jump In!</button>
      </div>
    </div>
  );
}
