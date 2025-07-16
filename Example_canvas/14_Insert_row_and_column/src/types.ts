import { ColResize } from "./handlers/colResize";
import { RangeSelection } from "./handlers/rangeSelection";
import { RowResize } from "./handlers/rowResize";
import { RowSelection } from "./handlers/rowSelection";
import { ColSelection } from "./handlers/colSelection";

export interface MouseHandler {
  hitTest(e: MouseEvent): boolean;
  setCursor(e: MouseEvent): string;
  handleMouseDown(e: MouseEvent): void;
  handleMouseDrag(e: MouseEvent): void;
  handleMouseUp(e: MouseEvent): void;
}

export interface TouchHandlers {
  range: RangeSelection;
  row: RowSelection;
  column: ColSelection;
  rowResize: RowResize;
  columnResize: ColResize;
}
