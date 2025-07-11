// src/GridInteractionHandler.ts
import { RangeSelectionHandler } from "./handlers/RangeSelectionHandler";
import { RowSelectionHandler } from "./handlers/RowSelectionHandler";
import { ColumnSelectionHandler } from "./handlers/ColumnSelectionHandler";
/**
 * @class GridInteractionHandler
 * @description Central orchestrator for all mouse-based grid interactions.
 * It delegates hit-testing and event handling to specialized handlers.
 */
export class GridInteractionHandler {
    constructor(grid, canvas, inputHandler, actionLogger, autoScrollHandler, handlers) {
        // State
        this.activeHandler = null;
        this.grid = grid;
        this.canvas = canvas;
        this.inputHandler = inputHandler;
        this.actionLogger = actionLogger;
        this.autoScrollHandler = autoScrollHandler;
        this.handlers = handlers;
        // The order is critical! More specific interactions must come before general ones.
        // e.g., A resize handle is on a header, so we must check for resize first.
        this.handlerPriority = [
            handlers.columnResize,
            handlers.rowResize,
            handlers.column,
            handlers.row,
            handlers.range,
        ];
    }
    attachEventListeners() {
        this.canvas.addEventListener("mousedown", this._handleMouseDown.bind(this));
        document.addEventListener("mousemove", this._handleMouseMove.bind(this));
        document.addEventListener("mouseup", this._handleMouseUp.bind(this));
        this.canvas.addEventListener("dblclick", this._handleDblClick.bind(this));
    }
    isDragging() {
        return this.activeHandler !== null;
    }
    _handleMouseDown(e) {
        if (this.inputHandler.isActive()) {
            this.inputHandler.commitAndHideInput();
        }
        // Iterate through handlers in priority order and activate the first one that passes its hit-test.
        for (const handler of this.handlerPriority) {
            if (handler.hitTest(e)) {
                this.activeHandler = handler;
                this.activeHandler.handleMouseDown(e);
                break; // Stop after the first match
            }
        }
    }
    _handleMouseMove(e) {
        if (this.activeHandler) {
            // If a drag is active, delegate the event.
            this.activeHandler.handleMouseDrag(e);
            const isSelectionDrag = this.activeHandler instanceof RangeSelectionHandler ||
                this.activeHandler instanceof RowSelectionHandler ||
                this.activeHandler instanceof ColumnSelectionHandler;
            if (isSelectionDrag) {
                this.autoScrollHandler.handleMouseDrag(e, this.activeHandler);
            }
        }
        else {
            // If not dragging, perform hit-tests for hover effects (like changing the cursor).
            let cursorSet = false;
            for (const handler of this.handlerPriority) {
                if (handler.hitTest(e)) {
                    if (handler instanceof this.handlers.columnResize.constructor) {
                        this.canvas.style.cursor = "col-resize";
                        cursorSet = true;
                        break;
                    }
                    if (handler instanceof this.handlers.rowResize.constructor) {
                        this.canvas.style.cursor = "row-resize";
                        cursorSet = true;
                        break;
                    }
                }
            }
            if (!cursorSet && this.canvas.style.cursor !== "default") {
                this.canvas.style.cursor = "default";
            }
        }
    }
    _handleMouseUp(e) {
        if (this.activeHandler) {
            const action = this.activeHandler.handleMouseUp(e);
            if (action) {
                this.actionLogger.logAction({
                    type: this.activeHandler.constructor.name,
                    details: action,
                });
            }
            this.activeHandler = null;
            this.autoScrollHandler.handleMouseUp();
            this.grid.requestRedraw();
        }
    }
    _handleDblClick(e) {
        // For double-click, we only care about the range handler.
        if (this.handlers.range.hitTest(e)) {
            if (this.grid.selectedRow !== null && this.grid.selectedCol !== null) {
                this.inputHandler.showInputBox(this.grid.selectedRow, this.grid.selectedCol);
            }
        }
    }
}
