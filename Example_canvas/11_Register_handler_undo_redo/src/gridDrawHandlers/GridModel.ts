/**
 * Manages the core state of the spreadsheet grid.
 * This class is the single source of truth for grid data and state,
 * but contains no rendering or calculation logic.
 */
export class GridModel {
  public readonly rows: number;
  public readonly cols: number;
  public readonly headerWidth: number;
  public readonly headerHeight: number;
  public colWidths: number[];
  public rowHeights: number[];
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
    defaultCellWidth: number,
    defaultCellHeight: number
  ) {
    this.rows = rows;
    this.cols = cols;
    this.headerWidth = defaultCellWidth;
    this.headerHeight = defaultCellHeight;
    this.colWidths = Array(cols).fill(defaultCellWidth);
    this.rowHeights = Array(rows).fill(defaultCellHeight);
  }

  /**
   * @public
   * @method setCellValue
   * @description Sets the value of a cell at the specified row and column. If the value is empty, the cell data is removed.
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
   * @public
   * @method getCellValue
   * @description Gets the value of a cell at the specified row and column.
   * @param {number} row - The row index of the cell.
   * @param {number} col - The column index of the cell.
   * @returns {any} The value of the cell, or an empty string if no value is found.
   */
  public getCellValue(row: number, col: number): any {
    return this.cellData.get(`${row},${col}`) || "";
  }

  /**
   * @public
   * @method clearAllCells
   * @description Clears all data from the grid cells.
   */
  public clearAllCells(): void {
    this.cellData.clear();
  }
}
