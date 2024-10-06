// dfs.js
export function depthFirstSearch(grid, startNode, finishNode) {
  const visitedNodesInOrder = [];
  const stack = [startNode];
  startNode.isVisited = true;

  while (stack.length > 0) {
    const currentNode = stack.pop();
    visitedNodesInOrder.push(currentNode);

    if (currentNode === finishNode) return visitedNodesInOrder;

    const unvisitedNeighbors = getUnvisitedNeighbors(currentNode, grid);
    for (const neighbor of unvisitedNeighbors) {
      if (!neighbor.isWall) {
        neighbor.isVisited = true;
        neighbor.previousNode = currentNode;
        stack.push(neighbor);
      }
    }
  }

  return visitedNodesInOrder;
}
  
  function getUnvisitedNeighbors(node, grid) {
    const neighbors = [];
    const { column, row } = node;
    if (row > 0) neighbors.push(grid[row - 1][column]);
    if (row < grid.length - 1) neighbors.push(grid[row + 1][column]);
    if (column > 0) neighbors.push(grid[row][column - 1]);
    if (column < grid[0].length - 1) neighbors.push(grid[row][column + 1]);
    return neighbors.filter(neighbor => !neighbor.isVisited);
  }
  
  export function getDfsNodesInShortestPathOrder(finishNode) {
    const nodesInShortestPathOrder = [];
    let currentNode = finishNode;
    while (currentNode !== null) {
      nodesInShortestPathOrder.unshift(currentNode);
      currentNode = currentNode.previousNode;
    }
    return nodesInShortestPathOrder;
  }