const canvas = document.getElementById("gridCanvas");
const ctx = canvas.getContext("2d");

const rows = 20;
const cols = 10;
let cellWidth = 100;
let cellHeight = 50;

class Cell {
  constructor(row, col, val = "") {
    this.row = row;
    this.col = col;
    this.val = val;
  }
  setValue(val) {
    this.val = val;
  }
  getValue() {
    return this.val;
  }
}

class Grid {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.cells = this.createCells();
  }
  createCells() {
    const cells = [];
    for (let i = 0; i <= this.rows; i++) {
      cells[i] = [];
      for (let j = 0; j <= this.cols; j++) {
        cells[i][j] = new Cell(i, j);
      }
    }
    return cells;
  }
  getCell(row, col) {
    return this.cells[row][col];
  }
}

const grids = new Grid(rows, cols);

function drawGrid(highlightedRow = null, highlightedCol = null) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Highlight row and column if needed
  if (highlightedRow !== null) {
    ctx.fillStyle = "rgba(0,0,255,0.15)";
    ctx.fillRect(0, highlightedRow * cellHeight, canvas.width, cellHeight);
  }
  if (highlightedCol !== null) {
    ctx.fillStyle = "rgba(0,0,255,0.15)";
    ctx.fillRect(highlightedCol * cellWidth, 0, cellWidth, canvas.height);
  }
  // Draw grid lines
  ctx.beginPath();
  for (let i = 0; i <= rows; i++) {
    ctx.moveTo(0, i * cellHeight);
    ctx.lineTo(canvas.width, i * cellHeight);
  }
  for (let i = 0; i <= cols; i++) {
    ctx.moveTo(i * cellWidth, 0);
    ctx.lineTo(i * cellWidth, canvas.height);
  }
  ctx.strokeStyle = "#000";
  ctx.stroke();

  ctx.font = "16px Arial";
  ctx.fillStyle = "#333";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= cols; col++) {
      const value = grids.getCell(row, col).getValue();
      if (value) {
        const x = col * cellWidth + cellWidth / 2;
        const y = row * cellHeight + cellHeight / 2;
        ctx.fillText(value, x, y);
      }
    }
  }
}

let selectedRow = null;
let selectedCol = null;

drawGrid();

// Attach click event listener directly to the existing canvas
canvas.addEventListener("click", handleCellClick);

function handleCellClick(event) {
  const col = Math.floor(event.offsetX / cellWidth);
  console.log(col);
  console.log("offsetX: ", event.offsetX);

  const row = Math.floor(event.offsetY / cellHeight);
  console.log("offsetY: ", event.offsetY);

  console.log(row);
  selectedRow = row;
  selectedCol = col;
  drawGrid(row, col);
  showInputBox(row, col);
}

let navigating = false;

function showInputBox(row, col) {
  // Remove any existing input
  let oldInput = document.getElementById("cell-input");
  if (oldInput) oldInput.remove();

  // Get cell value
  let value = grids.getCell(row, col).getValue();
  if (value === undefined) value = "";
  // Create input
  const input = document.createElement("input");
  input.type = "text";
  input.id = "cell-input";
  input.value = value;
  input.style.position = "absolute";
  input.style.left = canvas.offsetLeft + col * cellWidth + "px";
  input.style.top = canvas.offsetTop + row * cellHeight + "px";
  console.log(canvas.offsetLeft);
  console.log(canvas.offsetTop);

  console.log(canvas.offsetLeft + col * cellWidth + "px");
  console.log(canvas.offsetTop + row * cellHeight + "px");

  input.style.width = cellWidth + "px";
  input.style.height = cellHeight + "px";
  input.style.fontSize = "16px";
  input.style.textAlign = "center";
  input.style.zIndex = 10;
  document.body.appendChild(input);
  input.focus();
  input.select();

  // Save on blur
  input.addEventListener("blur", () => {
    if (navigating) return; // Don't remove input if navigating
    grids.getCell(row, col).setValue(input.value);
    input.remove();
    drawGrid();
  });
  input.addEventListener("keydown", (e) => {
    let nextRow = row;
    let nextCol = col;
    let nav = false;
    if (e.key === "Enter" || e.key === "ArrowDown") {
      nextRow = Math.min(rows - 1, row + 1);
      nav = true;
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      nextRow = Math.max(0, row - 1);
      nav = true;
      e.preventDefault();
    } else if (e.key === "ArrowLeft") {
      nextCol = Math.max(0, col - 1);
      nav = true;
      e.preventDefault();
    } else if (e.key === "ArrowRight") {
      nextCol = Math.min(cols - 1, col + 1);
      nav = true;
      e.preventDefault();
    } else {
      return;
    }
    if (nav) {
      navigating = true;
      grids.getCell(row, col).setValue(input.value);
      input.remove();
      selectedRow = nextRow;
      selectedCol = nextCol;
      drawGrid(nextRow, nextCol);
      showInputBox(nextRow, nextCol);
      navigating = false;
    }
  });
}

function resizeGrid(event) {
  if (event.offsetX > canvas.width - 20) {
    resizing = true;
    startX = event.offsetX;
  }
}

function doResize(event) {
  if (resizing) {
    const deltaX = event.offsetX - startX;
    const newCellWidth = cellWidth + deltaX;
    if (newCellWidth > 30) {
      //Minimum cell width constraint
      cellWidth = newCellWidth;
      drawGrid();
    }
  }
}

function stopResize() {
  resizing = false;
}

let resizing = false;
let startX;

canvas.addEventListener("mousedown", resizeGrid);
canvas.addEventListener("mousemove", doResize);
canvas.addEventListener("mouseup", stopResize);
