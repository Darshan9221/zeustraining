import { Grid } from "../Grid";
import { MouseHandler } from "../types";

const downArrowCursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 512 512"><polygon points="283.7,298.7 283.7,0 198.3,0 198.3,298.7 70.3,298.7 241,512 411.7,298.7"/></svg>') 8 15, auto`;

export class ColSelection implements MouseHandler {
  private grid: Grid;
  private startCol: number | null = null;

  constructor(grid: Grid) {
    this.grid = grid;
  }

  public hitTest(e: MouseEvent): boolean {
    const rect = this.grid.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return y < this.grid.headerHeight && x >= this.grid.headerWidth;
  }

  public setCursor(e: MouseEvent): string {
    return downArrowCursor;
  }

  public handleMouseDown(e: MouseEvent): void {
    const rect = this.grid.canvas.getBoundingClientRect();
    const click_x = e.clientX - rect.left;
    const virtual_x = click_x + this.grid.scrollX;
    const col_index = this.grid.colAtX(virtual_x);

    if (col_index === undefined || col_index === null) return;

    this.startCol = col_index;

    this.grid.selectedCol = col_index;
    this.grid.selectedRow = 1;
    this.grid.selectionStartCol = this.startCol;
    this.grid.selectionEndCol = col_index;
    this.grid.selectionStartRow = 1;
    this.grid.selectionEndRow = this.grid.rows - 1;
    this.grid.requestRedraw();
  }

  public handleMouseDrag(e: MouseEvent): void {
    if (this.startCol === null) return;

    const rect = this.grid.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const virtualX = mouseX + this.grid.scrollX;
    const col = this.grid.colAtX(virtualX);

    if (col && col !== this.grid.selectionEndCol) {
      this.grid.selectionEndCol = col;
      this.grid.requestRedraw();
    }
  }

  public handleMouseUp(e: MouseEvent): void {
    this.startCol = null;
  }
}
