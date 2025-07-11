export class GridModel {
  public readonly rows: number;
  public readonly cols: number;
  public readonly headerWidth: number;
  public readonly headerHeight: number;
  public colWidths: number[];
  public rowHeights: number[];

  // Using a Map is good for sparse data
  private cellData = new Map<string, any>();
  public scrollX: number = 0;
  public scrollY: number = 0;
  public viewportStartRow: number = 0;
  public viewportEndRow: number = 0;
  public viewportStartCol: number = 0;
  public viewportEndCol: number = 0;
  public selectedRow: number | null = null;
  public selectedCol: number | null = null;
  public selectionStartRow: number | null = null;
  public selectionStartCol: number | null = null;
  public selectionEndRow: number | null = null;
  public selectionEndCol: number | null = null;

  constructor(
    rows: number,
    cols: number,
    cellW: number, // Changed from defaultCellWidth
    cellH: number // Changed from defaultCellHeight
  ) {
    this.rows = rows;
    this.cols = cols;
    this.headerWidth = cellW;
    this.headerHeight = cellH;
    // create arrays to hold the widths and heights for every column and row
    this.colWidths = Array(cols).fill(cellW);
    this.rowHeights = Array(rows).fill(cellH);
  }

  /**
   * Sets the value of a cell at the specified row and column. If the value is empty, the cell data is removed.
   * @param {number} row - The row index of the cell.
   * @param {number} col - The column index of the cell.
   * @param {any} value - The value to set in the cell.
   */
  public setCellValue(row: number, col: number, value: any): void {
    const key = `${row},${col}`;
    if (value === "" || value === null || value === undefined) {
      this.cellData.delete(key);
    } else {
      this.cellData.set(key, value);
    }
  }

  /**
   * Gets the value of a cell at the given row and column.
   * @param {number} row - The row index of the cell.
   * @param {number} col - The column index of the cell.
   */
  public getCellValue(row: number, col: number): any {
    return this.cellData.get(`${row},${col}`) || "";
  }

  /**
   * Clears all data from the grid cells.
   */
  public clearAllCells(): void {
    this.cellData.clear();
  }
}
