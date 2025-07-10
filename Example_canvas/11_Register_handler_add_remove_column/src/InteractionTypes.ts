// src/InteractionTypes.ts

import { ColumnResizeHandler } from "./handlers/ColumnResizeHandler";
import { RangeSelectionHandler } from "./handlers/RangeSelectionHandler";
import { RowResizeHandler } from "./handlers/RowResizeHandler";
import { RowSelectionHandler } from "./handlers/RowSelectionHandler";
import { ColumnSelectionHandler } from "./handlers/ColumnSelectionHandler";

/**
 * An interface that all specific action handlers (like resizing or selecting) must implement.
 * This allows the central GridInteractionHandler to treat them polymorphically.
 */
export interface IInteractionHandler {
  /**
   * Checks if a mouse event occurred on this handler's specific target area.
   * @param {MouseEvent} e - The mouse event to test.
   * @returns {boolean} True if the event is a "hit", false otherwise.
   */
  hitTest(e: MouseEvent): boolean;

  /** Called when a drag operation begins on this handler's target. */
  handleMouseDown(e: MouseEvent): void;

  /** Called for every mouse movement during the drag. */
  handleMouseDrag(e: MouseEvent): void;

  /** Called when the drag operation ends. Can return an object describing the action for logging. */
  handleMouseUp(e: MouseEvent): object | void;
}

/**
 * A collection of all specific handlers, passed to the central controller.
 */
export interface InteractionHandlers {
  range: RangeSelectionHandler;
  row: RowSelectionHandler;
  column: ColumnSelectionHandler;
  rowResize: RowResizeHandler;
  columnResize: ColumnResizeHandler;
}
