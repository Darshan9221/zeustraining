// src/handlers/AutoScrollHandler.ts
import { Grid } from "../Grid";
import { DragState } from "../main";

/**
 * @class AutoScrollHandler
 * @description Manages auto-scrolling when dragging a selection near the edges of the grid viewport.
 */
export class AutoScrollHandler {
  private grid: Grid;
  private canvas: HTMLCanvasElement;
  private dragState: DragState;
  private autoScrollIntervalId: number | null = null;
  private lastMouseX: number = 0;
  private lastMouseY: number = 0;

  constructor(grid: Grid, canvas: HTMLCanvasElement, dragState: DragState) {
    this.grid = grid;
    this.canvas = canvas;
    this.dragState = dragState;
  }

  /**
   * @public
   * @method handleMouseDrag
   * @description Called on mouse move to check if auto-scrolling should be initiated or stopped.
   * @param {MouseEvent} e - The mouse event object.
   */
  public handleMouseDrag(e: MouseEvent): void {
    // Prevent auto-scroll during a resize operation.
    if (this.dragState.isResizing) {
      return;
    }

    // Auto-scroll only works when a drag is active
    if (
      !this.dragState.isDraggingSelection &&
      !this.dragState.isDraggingColHeader &&
      !this.dragState.isDraggingRowHeader
    ) {
      return;
    }

    // Store the latest mouse position.
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;

    // Manage the auto-scroll interval (start/stop it as needed).
    this.manageAutoScrollInterval();
  }

  /**
   * @public
   * @method handleMouseUp
   * @description Stops any active auto-scroll interval when the mouse is released.
   */
  public handleMouseUp(): void {
    if (this.autoScrollIntervalId) {
      clearInterval(this.autoScrollIntervalId);
      this.autoScrollIntervalId = null;
    }
  }

  /**
   * @private
   * @method manageAutoScrollInterval
   * @description Manages the starting and stopping of the auto-scroll interval based on mouse position.
   */
  private manageAutoScrollInterval(): void {
    const rect = this.canvas.getBoundingClientRect();
    const isOutside =
      this.lastMouseY < rect.top + this.grid.headerHeight ||
      this.lastMouseY > rect.bottom ||
      this.lastMouseX < rect.left + this.grid.headerWidth ||
      this.lastMouseX > rect.right;

    if (isOutside) {
      // If we need to scroll and there's no interval running, start one.
      if (this.autoScrollIntervalId === null) {
        this.autoScrollIntervalId = window.setInterval(() => {
          // Move scroll direction logic inside the interval to re-evaluate on every tick.
          const scrollAmount = 20;
          let scrollX = 0;
          let scrollY = 0;
          const currentRect = this.canvas.getBoundingClientRect();

          // Check for vertical scroll.
          if (this.lastMouseY < currentRect.top + this.grid.headerHeight) {
            scrollY = -scrollAmount;
          } else if (this.lastMouseY > currentRect.bottom) {
            scrollY = scrollAmount;
          }

          // Check for horizontal scroll.
          if (this.lastMouseX < currentRect.left + this.grid.headerWidth) {
            scrollX = -scrollAmount;
          } else if (this.lastMouseX > currentRect.right) {
            scrollX = scrollAmount;
          }

          const hScrollbar = document.querySelector(".scrollbar-h")!;
          const vScrollbar = document.querySelector(".scrollbar-v")!;
          hScrollbar.scrollLeft += scrollX;
          vScrollbar.scrollTop += scrollY;

          // After scrolling, we must update the selection end based on the new virtual coordinates
          const mouseX = this.lastMouseX - currentRect.left;
          const mouseY = this.lastMouseY - currentRect.top;
          const virtualX = mouseX + this.grid.scrollX;
          const virtualY = mouseY + this.grid.scrollY;

          const endRow = this.grid.rowAtY(virtualY);
          const endCol = this.grid.colAtX(virtualX);

          // Update the appropriate selection end based on drag mode
          if (this.dragState.isDraggingRowHeader && endRow)
            this.grid.selectionEndRow = endRow;
          else if (this.dragState.isDraggingColHeader && endCol)
            this.grid.selectionEndCol = endCol;
          else if (this.dragState.isDraggingSelection) {
            if (endRow) this.grid.selectionEndRow = endRow;
            if (endCol) this.grid.selectionEndCol = endCol;
          }
          this.grid.requestRedraw();
        }, 50); // scrolls every 50ms
      }
    } else {
      // If we are inside the canvas, clear any existing interval.
      if (this.autoScrollIntervalId !== null) {
        clearInterval(this.autoScrollIntervalId);
        this.autoScrollIntervalId = null;
      }
    }
  }
}
