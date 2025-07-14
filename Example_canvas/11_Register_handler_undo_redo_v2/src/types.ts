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
    handleMouseDown(e: MouseEvent): void;
    handleMouseDrag(e: MouseEvent): void;
    handleMouseUp(e: MouseEvent): object | void;
}

export interface TouchHandlers {
    range: RangeSelection;
    row: RowSelection;
    column: ColSelection;
    rowResize: RowResize;
    columnResize: ColResize;
}