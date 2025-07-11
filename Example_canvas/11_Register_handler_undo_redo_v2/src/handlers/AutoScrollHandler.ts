import { Grid } from "../Grid";
import { ColumnSelectionHandler } from "./ColumnSelectionHandler";
import { IInteractionHandler } from "../Interactiontypes";
import { RangeSelectionHandler } from "./RangeSelectionHandler";
import { RowSelectionHandler } from "./RowSelectionHandler";

export class AutoScrollHandler {
  private grid: Grid;
  private canvas: HTMLCanvasElement;
  private autoScrollIntervalId: number | null = null;
  private lastMouseX: number = 0;
  private lastMouseY: number = 0;

  constructor(grid: Grid, canvas: HTMLCanvasElement) {
    this.grid = grid;
    this.canvas = canvas;
  }

  /**
   * Called on mouse move to check if auto-scrolling should be initiated or stopped.
   * @param {MouseEvent} e
   * @param {IInteractionHandler} activeHandler - The currently active selection handler.
   */
  public handleMouseDrag(
    e: MouseEvent,
    activeHandler: IInteractionHandler
  ): void {
    // Keep track of the latest mouse position
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;

    this.manageAutoScrollInterval(activeHandler);
  }

  // Stops any active auto-scroll interval when the mouse is released.
  public handleMouseUp(): void {
    if (this.autoScrollIntervalId) {
      clearInterval(this.autoScrollIntervalId);
      this.autoScrollIntervalId = null;
    }
  }

  /**
   *  Manages the starting and stopping of the auto-scroll interval based on mouse position.
   * @param {IInteractionHandler} activeHandler - The currently active selection handler.
   */
  private manageAutoScrollInterval(activeHandler: IInteractionHandler): void {
    const rect = this.canvas.getBoundingClientRect();
    const isOutside =
      this.lastMouseY < rect.top + this.grid.headerHeight ||
      this.lastMouseY > rect.bottom ||
      this.lastMouseX < rect.left + this.grid.headerWidth ||
      this.lastMouseX > rect.right;

    if (isOutside) {
      // If mouse is outside the grid and we aren't already scrolling, start.
      if (this.autoScrollIntervalId === null) {
        this.autoScrollIntervalId = window.setInterval(() => {
          // console.log("Auto-scrolling...");
          const scrollAmount = 20; // how many pixels to scroll each time
          let scrollX = 0;
          let scrollY = 0;
          const currentRect = this.canvas.getBoundingClientRect();

          // This logic depends on what we're dragging (full row, full col, or range)
          if (activeHandler instanceof RowSelectionHandler) {
            // If selecting rows, we only want to scroll up and down
            if (this.lastMouseY < currentRect.top + this.grid.headerHeight) {
              scrollY = -scrollAmount;
            } else if (this.lastMouseY > currentRect.bottom) {
              scrollY = scrollAmount;
            }
          } else if (activeHandler instanceof ColumnSelectionHandler) {
            // If selecting columns, only scroll left and right
            if (this.lastMouseX < currentRect.left + this.grid.headerWidth) {
              scrollX = -scrollAmount;
            } else if (this.lastMouseX > currentRect.right) {
              scrollX = scrollAmount;
            }
          } else if (activeHandler instanceof RangeSelectionHandler) {
            // For a normal selection, scroll on both axes
            if (this.lastMouseY < currentRect.top + this.grid.headerHeight) {
              scrollY = -scrollAmount;
            } else if (this.lastMouseY > currentRect.bottom) {
              scrollY = scrollAmount;
            }
            if (this.lastMouseX < currentRect.left + this.grid.headerWidth) {
              scrollX = -scrollAmount;
            } else if (this.lastMouseX > currentRect.right) {
              scrollX = scrollAmount;
            }
          }

          // If we calculated a scroll amount, apply it
          if (scrollX !== 0 || scrollY !== 0) {
            const hScrollbar = document.querySelector(".scrollbar-h")!;
            const vScrollbar = document.querySelector(".scrollbar-v")!;
            hScrollbar.scrollLeft += scrollX;
            vScrollbar.scrollTop += scrollY;

            // IMPORTANT: after we scroll, we have to update the selection
            // as if the mouse moved to the new scrolled position
            const mouseX = this.lastMouseX - currentRect.left;
            const mouseY = this.lastMouseY - currentRect.top;
            const virtualX = mouseX + this.grid.scrollX;
            const virtualY = mouseY + this.grid.scrollY;

            const endRow =
              this.grid.rowAtY(virtualY) ||
              (virtualY < this.grid.headerHeight ? 1 : this.grid.rows - 1);
            const endCol =
              this.grid.colAtX(virtualX) ||
              (virtualX < this.grid.headerWidth ? 1 : this.grid.cols - 1);

            // update the selection end based on what we're dragging
            if (activeHandler instanceof RowSelectionHandler) {
              this.grid.selectionEndRow = endRow;
            } else if (activeHandler instanceof ColumnSelectionHandler) {
              this.grid.selectionEndCol = endCol;
            } else if (activeHandler instanceof RangeSelectionHandler) {
              this.grid.selectionEndRow = endRow;
              this.grid.selectionEndCol = endCol;
            }
            this.grid.requestRedraw();
          }
        }, 50); // scrolls every 50ms
      }
    } else {
      // If we are inside the canvas, stop scrolling.
      if (this.autoScrollIntervalId !== null) {
        clearInterval(this.autoScrollIntervalId);
        this.autoScrollIntervalId = null;
      }
    }
  }
}
