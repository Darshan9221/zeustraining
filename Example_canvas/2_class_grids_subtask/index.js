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
grids.getCell(2, 2).setValue("Hello");
console.log(grids.getCell(2, 2).getValue());
