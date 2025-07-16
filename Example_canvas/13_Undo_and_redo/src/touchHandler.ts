// src/touchHandler.ts

import { Grid } from "./Grid";
import { InputHandler } from "./InputHandler";
import { AutoScroll } from "./handlers/autoScroll";
import { MouseHandler, TouchHandlers } from "./types";
import { RangeSelection } from "./handlers/rangeSelection";
import { RowSelection } from "./handlers/rowSelection";
import { ColSelection } from "./handlers/colSelection";

export class TouchHandler {
  private grid: Grid;
  private canvas: HTMLCanvasElement;
  private inputHandler: InputHandler;
  private autoScroll: AutoScroll;
  private handlers: TouchHandlers;

  private handlerPriority: MouseHandler[];

  private activeHandler: MouseHandler | null = null;

  constructor(
    grid: Grid,
    canvas: HTMLCanvasElement,
    inputHandler: InputHandler,
    autoScroll: AutoScroll,
    handlers: TouchHandlers
  ) {
    this.grid = grid;
    this.canvas = canvas;
    this.inputHandler = inputHandler;
    this.autoScroll = autoScroll;
    this.handlers = handlers;

    this.handlerPriority = [
      handlers.columnResize,
      handlers.rowResize,
      handlers.column,
      handlers.row,
      handlers.range,
    ];
  }

  public attachEventListeners(): void {
    this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
    document.addEventListener("mousemove", this.handleMouseMove.bind(this));
    document.addEventListener("mouseup", this.handleMouseUp.bind(this));
    this.canvas.addEventListener("dblclick", this.handleDblClick.bind(this));
  }

  public isDragging(): boolean {
    return this.activeHandler !== null;
  }

  /**
   * Behaviour of cell on mouse click
   * @param {MouseEvent} e
   */
  private handleMouseDown(e: MouseEvent): void {
    if (this.inputHandler.isActive()) {
      this.inputHandler.commitAndHideInput();
    }

    for (const handler of this.handlerPriority) {
      if (handler.hitTest(e)) {
        this.activeHandler = handler;
        this.activeHandler.handleMouseDown(e);
        break;
      }
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    if (this.activeHandler) {
      // If we're dragging, let the active handler deal with it
      this.activeHandler.handleMouseDrag(e);

      const isSelectionHandler =
        this.activeHandler instanceof RangeSelection ||
        this.activeHandler instanceof RowSelection ||
        this.activeHandler instanceof ColSelection;

      if (isSelectionHandler) {
        this.autoScroll.handleMouseDrag(e, this.activeHandler);
      }
    } else {
      let cursorSet = false;
      for (const handler of this.handlerPriority) {
        if (handler.hitTest(e)) {
          this.canvas.style.cursor = handler.setCursor(e);
          cursorSet = true;
          break;
        }
      }
      if (!cursorSet) {
        this.canvas.style.cursor = "default";
      }
    }
  }

  /**
   * Behaviour on leaving mouse click
   * @param {MouseEvent} e
   */
  private handleMouseUp(e: MouseEvent): void {
    if (this.activeHandler) {
      this.activeHandler.handleMouseUp(e);
      this.activeHandler = null;
      this.autoScroll.handleMouseUp();
      this.grid.requestRedraw();
    }
  }

  /**
   * Cell behaviour on double click
   * @param {MouseEvent} e
   */
  private handleDblClick(e: MouseEvent): void {
    if (this.handlers.range.hitTest(e)) {
      if (this.grid.selectedRow !== null && this.grid.selectedCol !== null) {
        this.inputHandler.showInputBox(
          this.grid.selectedRow,
          this.grid.selectedCol
        );
      }
    }
  }
}
