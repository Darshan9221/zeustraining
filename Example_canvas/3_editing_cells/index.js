const canvas = document.getElementById("gridCanvas");
const ctx = canvas.getContext("2d");

const rows = 4;
const cols = 4;
const cellWidth = canvas.width / cols;
const cellHeight = canvas.height / rows;

class Cell {
  constructor(row, col, val = "") {
    this.row = row;
    this.col = col;
    this.val = val;
  }
  setValue(value) {
    this.value = value;
  }
  getValue() {
    return this.value;
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
        cells[i][j] = new Cell(i, j); //Initialize cell with row and column
      }
    }
    return cells;
  }

  getCell(row, col) {
    return this.cells[row][col];
  }
}

const grids = new Grid(4, 4);

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
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

  // Draw cell values
  ctx.font = "16px Arial";
  ctx.fillStyle = "#333";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const value = grids.getCell(row, col).getValue();
      if (value) {
        const x = col * cellWidth + cellWidth / 2;
        const y = row * cellHeight + cellHeight / 2;
        ctx.fillText(value, x, y);
      }
    }
  }
}

drawGrid();

canvas.addEventListener("click", (event) => {
  const col = Math.floor(event.offsetX / cellWidth);
  const row = Math.floor(event.offsetY / cellHeight);

  const newValue = prompt("Edit cell", grids.getCell(row, col).getValue());
  if (newValue !== null) {
    grids.getCell(row, col).setValue(newValue);
    drawGrid();
  }
});
