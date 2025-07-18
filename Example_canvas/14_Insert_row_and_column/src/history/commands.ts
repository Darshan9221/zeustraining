import { Grid } from "../Grid";

export interface ICommand {
  execute(grid: Grid): void;
  undo(grid: Grid): void;
}

export class EditCellCommand implements ICommand {
  constructor(
    private row: number,
    private col: number,
    private fromValue: any,
    private toValue: any
  ) {}

  public execute(grid: Grid): void {
    grid.setCellValue(this.row, this.col, this.toValue);
  }

  public undo(grid: Grid): void {
    grid.setCellValue(this.row, this.col, this.fromValue);
  }
}

export class ResizeColCommand implements ICommand {
  constructor(
    private col: number,
    private fromWidth: number,
    private toWidth: number
  ) {}

  public execute(grid: Grid): void {
    grid.colWidths[this.col] = this.toWidth;
    grid.updateScrollbarContentSize();
  }

  public undo(grid: Grid): void {
    grid.colWidths[this.col] = this.fromWidth;
    grid.updateScrollbarContentSize();
  }
}

export class ResizeRowCommand implements ICommand {
  constructor(
    private row: number,
    private fromHeight: number,
    private toHeight: number
  ) {}

  public execute(grid: Grid): void {
    grid.rowHeights[this.row] = this.toHeight;
    grid.updateScrollbarContentSize();
  }

  public undo(grid: Grid): void {
    grid.rowHeights[this.row] = this.fromHeight;
    grid.updateScrollbarContentSize();
  }
}

/**
 * Command for inserting a column.
 */
export class InsertColumnCommand implements ICommand {
  constructor(private col: number) {}

  public execute(grid: Grid): void {
    grid.insertColumn(this.col);
    grid.updateScrollbarContentSize();
  }

  public undo(grid: Grid): void {
    grid.removeColumn(this.col);
    grid.updateScrollbarContentSize();
  }
}

/**
 * Command for inserting a row.
 */
export class InsertRowCommand implements ICommand {
  constructor(private row: number) {}

  public execute(grid: Grid): void {
    grid.insertRow(this.row);
    grid.updateScrollbarContentSize();
  }

  public undo(grid: Grid): void {
    grid.removeRow(this.row);
    grid.updateScrollbarContentSize();
  }
}
