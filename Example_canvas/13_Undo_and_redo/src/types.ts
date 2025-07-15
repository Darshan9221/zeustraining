// src/types.ts

import { ColResize } from "./handlers/colResize";
import { RangeSelection } from "./handlers/rangeSelection";
import { RowResize } from "./handlers/rowResize";
import { RowSelection } from "./handlers/rowSelection";
import { ColSelection } from "./handlers/colSelection";

export interface MouseHandler {
  /**
   * Checks if a mouse click or move happened.
   * @param {MouseEvent} e - The mouse event to test.
   */
  hitTest(e: MouseEvent): boolean;

  /**
   * Returns the appropriate CSS cursor string for this handler.
   * @param {MouseEvent} e - The mouse event.
   */
  setCursor(e: MouseEvent): string;
  handleMouseDown(e: MouseEvent): void;
  handleMouseDrag(e: MouseEvent): void;
  // FIX: This method no longer needs to return an action object.
  // The handlers themselves now record actions with the HistoryManager.
  handleMouseUp(e: MouseEvent): void;
}

export interface TouchHandlers {
  range: RangeSelection;
  row: RowSelection;
  column: ColSelection;
  rowResize: RowResize;
  columnResize: ColResize;
}
