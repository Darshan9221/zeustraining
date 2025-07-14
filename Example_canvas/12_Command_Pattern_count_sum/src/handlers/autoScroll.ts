import { Grid } from "../Grid";
import { ColSelection } from "./colSelection";
import { MouseHandler } from "../types";
import { RangeSelection } from "./rangeSelection";
import { RowSelection } from "./rowSelection";

export class AutoScroll {
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
     * @param {MouseHandler} activeHandler - The currently active selection handler.
     */
    public handleMouseDrag(
        e: MouseEvent,
        activeHandler: MouseHandler
    ): void {
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
     * @param {MouseHandler} activeHandler - The currently active selection handler.
     */
    private manageAutoScrollInterval(activeHandler: MouseHandler): void {
        const rect = this.canvas.getBoundingClientRect();
        const isOutside =
            this.lastMouseY < rect.top + this.grid.headerHeight ||
            this.lastMouseY > rect.bottom ||
            this.lastMouseX < rect.left + this.grid.headerWidth ||
            this.lastMouseX > rect.right;

        if (isOutside) {
            if (this.autoScrollIntervalId === null) {
                this.autoScrollIntervalId = window.setInterval(() => {
                    // console.log("Auto-scrolling...");
                    const scrollAmount = 20;
                    let scrollX = 0;
                    let scrollY = 0;
                    const currentRect = this.canvas.getBoundingClientRect();

                    // This logic depends on what we're dragging (full row, full col, or range)
                    if (activeHandler instanceof RowSelection) {
                        if (this.lastMouseY < currentRect.top + this.grid.headerHeight) {
                            scrollY = -scrollAmount;
                        } else if (this.lastMouseY > currentRect.bottom) {
                            scrollY = scrollAmount;
                        }
                    } else if (activeHandler instanceof ColSelection) {
                        if (this.lastMouseX < currentRect.left + this.grid.headerWidth) {
                            scrollX = -scrollAmount;
                        } else if (this.lastMouseX > currentRect.right) {
                            scrollX = scrollAmount;
                        }
                    } else if (activeHandler instanceof RangeSelection) {
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

                    if (scrollX !== 0 || scrollY !== 0) {
                        const hScrollbar = document.querySelector(".scrollbar-h")!;
                        const vScrollbar = document.querySelector(".scrollbar-v")!;
                        hScrollbar.scrollLeft += scrollX;
                        vScrollbar.scrollTop += scrollY;

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

                        if (activeHandler instanceof RowSelection) {
                            this.grid.selectionEndRow = endRow;
                        } else if (activeHandler instanceof ColSelection) {
                            this.grid.selectionEndCol = endCol;
                        } else if (activeHandler instanceof RangeSelection) {
                            this.grid.selectionEndRow = endRow;
                            this.grid.selectionEndCol = endCol;
                        }
                        this.grid.requestRedraw();
                    }
                }, 50);
            }
        } else {
            if (this.autoScrollIntervalId !== null) {
                clearInterval(this.autoScrollIntervalId);
                this.autoScrollIntervalId = null;
            }
        }
    }
}