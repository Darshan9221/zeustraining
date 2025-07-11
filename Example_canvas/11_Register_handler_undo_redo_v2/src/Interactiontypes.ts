import { ColumnResizeHandler } from "./handlers/ColumnResizeHandler";
import { RangeSelectionHandler } from "./handlers/RangeSelectionHandler";
import { RowResizeHandler } from "./handlers/RowResizeHandler";
import { RowSelectionHandler } from "./handlers/RowSelectionHandler";
import { ColumnSelectionHandler } from "./handlers/ColumnSelectionHandler";

export interface IInteractionHandler {
  /**
   * Checks if a mouse click or move happened.
   * @param {MouseEvent} e - The mouse event to test.
   */
  hitTest(e: MouseEvent): boolean;
  handleMouseDown(e: MouseEvent): void;
  handleMouseDrag(e: MouseEvent): void;
  handleMouseUp(e: MouseEvent): object | void;
}

export interface InteractionHandlers {
  range: RangeSelectionHandler;
  row: RowSelectionHandler;
  column: ColumnSelectionHandler;
  rowResize: RowResizeHandler;
  columnResize: ColumnResizeHandler;
}
