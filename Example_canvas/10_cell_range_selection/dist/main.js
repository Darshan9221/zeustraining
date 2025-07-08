// src/main.ts
import { Grid } from "./Grid";
import { ResizeHandler } from "./ResizeHandler";
import { InputHandler } from "./InputHandler";
import { DataManager } from "./DataManager";
/**
 * @class App
 * @description Main application class that orchestrates the grid, resize, and input functionalities.
 */
class App {
    /**
     * @constructor
     * @description Initializes the App by setting up the canvas, grid dimensions, and handlers.
     */
    constructor() {
        // public isDraggingSelection: boolean = false;
        // public isDraggingRowHeader: boolean = false;
        // public isDraggingColHeader: boolean = false;
        this.dragState = {
            isDraggingSelection: false,
            isDraggingRowHeader: false,
            isDraggingColHeader: false,
        };
        this.startRow = 0;
        this.startCol = 0;
        // --- NEW PROPERTIES FOR AUTO-SCROLL --- //
        this.autoScrollIntervalId = null;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        const canvas = document.getElementById("gridCanvas");
        const rows = 100000;
        const cols = 500;
        const cellWidth = 64;
        const cellHeight = 20;
        this.grid = new Grid(canvas, rows, cols, cellWidth, cellHeight, this.dragState);
        this.resizeHandler = new ResizeHandler(this.grid, canvas);
        this.inputHandler = new InputHandler(this.grid);
        this.setupEventListeners();
        this.setupUI();
        this.grid.resizeCanvas();
    }
    /**
     * @private
     * @method setupEventListeners
     * @description Sets up all the event listeners for user interactions like scrolling, mouse actions, and keyboard input.
     */
    setupEventListeners() {
        const hScrollbar = document.querySelector(".scrollbar-h");
        const vScrollbar = document.querySelector(".scrollbar-v");
        const canvas = this.grid.canvas;
        // Listens for window resize events to adjust canvas size
        window.addEventListener("resize", () => this.grid.resizeCanvas());
        // Listens for scroll events on horizontal and vertical scrollbars
        hScrollbar.addEventListener("scroll", this.handleScroll.bind(this));
        vScrollbar.addEventListener("scroll", this.handleScroll.bind(this));
        // Listens for mouse wheel events for custom scrolling behavior
        canvas.addEventListener("wheel", this.handleWheel.bind(this), {
            passive: false,
        });
        // Listens for mouse down, double click, mouse move, and mouse up events on the canvas and document
        canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
        canvas.addEventListener("dblclick", this.handleCanvasDblClick.bind(this));
        document.addEventListener("mousemove", this.handleMouseDrag.bind(this));
        document.addEventListener("mouseup", this.handleMouseUp.bind(this));
        // Listens for keyboard input
        document.addEventListener("keydown", this.handleKeydown.bind(this));
    }
    /**
     * @private
     * @method setupUI
     * @description Sets up the user interface elements like buttons and input fields for data generation and file loading.
     */
    setupUI() {
        const controlsContainer = document.createElement("div");
        controlsContainer.style.display = "flex";
        controlsContainer.style.alignItems = "center";
        controlsContainer.style.padding = "4px";
        const generateBtn = document.createElement("button");
        generateBtn.textContent = "Generate and Load";
        generateBtn.style.marginRight = "8px";
        const countInput = document.createElement("input");
        countInput.type = "number";
        countInput.placeholder = "e.g., 50000";
        countInput.value = "50000";
        countInput.style.width = "120px";
        countInput.style.marginRight = "16px";
        // Event listener for the "Generate and Load" button
        generateBtn.addEventListener("click", () => {
            const count = parseInt(countInput.value, 10);
            const maxRecords = this.grid.rows - 10;
            if (isNaN(count) || count <= 0) {
                alert("Please enter a valid positive number of records.");
                return;
            }
            if (count > maxRecords) {
                alert(`Number of records cannot exceed ${maxRecords}.`);
                countInput.value = maxRecords.toString();
                return;
            }
            DataManager.generateAndLoadData(this.grid, count);
        });
        const loadFileLabel = document.createElement("label");
        loadFileLabel.textContent = "Or Load File:";
        loadFileLabel.style.marginRight = "8px";
        const loadFileInput = document.createElement("input");
        loadFileInput.type = "file";
        loadFileInput.accept = ".json,application/json";
        // Event listener for file input to handle data loading from a file
        loadFileInput.addEventListener("change", (e) => DataManager.handleFileLoad(e, this.grid));
        controlsContainer.appendChild(generateBtn);
        controlsContainer.appendChild(countInput);
        controlsContainer.appendChild(loadFileLabel);
        controlsContainer.appendChild(loadFileInput);
        document.body.insertBefore(controlsContainer, document.body.firstChild);
    }
    /**
     * @private
     * @method handleScroll
     * @description Handles scroll events, updating the grid's scroll position and redrawing the canvas.
     */
    handleScroll() {
        this.grid.scrollX = document.querySelector(".scrollbar-h").scrollLeft;
        this.grid.scrollY = document.querySelector(".scrollbar-v").scrollTop;
        this.grid.requestRedraw();
        // Updates the input box position if it's active
        if (this.inputHandler.isActive()) {
            this.inputHandler.updateInputPosition();
        }
    }
    /**
     * @private
     * @method handleWheel
     * @description Handles mouse wheel events for smooth scrolling, supporting horizontal scroll with Shift key.
     * @param {WheelEvent} e - The wheel event object.
     */
    handleWheel(e) {
        e.preventDefault();
        const hScrollbar = document.querySelector(".scrollbar-h");
        const vScrollbar = document.querySelector(".scrollbar-v");
        const rowscrollAmount = 20;
        const colscrollAmount = 100;
        // Scrolls horizontally if Shift key is pressed, otherwise scrolls vertically
        if (e.shiftKey) {
            hScrollbar.scrollLeft += Math.sign(e.deltaY) * colscrollAmount;
        }
        else {
            vScrollbar.scrollTop += Math.sign(e.deltaY) * rowscrollAmount;
        }
    }
    /**
     * @private
     * @method handleMouseDown
     * @description Handles mouse down events, managing cell selection, full row selection, and full column selection.
     * @param {MouseEvent} e - The mouse event object.
     */
    handleMouseDown(e) {
        // Commits and hides the input box if it's active
        if (this.inputHandler.isActive()) {
            this.inputHandler.commitAndHideInput();
        }
        const rect = this.grid.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        const virtualX = clickX + this.grid.scrollX;
        const virtualY = clickY + this.grid.scrollY;
        // Handle full row selection
        if (clickX < this.grid.headerWidth && clickY >= this.grid.headerHeight) {
            this.dragState.isDraggingRowHeader = true;
            const row = this.grid.rowAtY(virtualY);
            if (row) {
                this.startRow = row;
                this.grid.selectedRow = row;
                this.grid.selectedCol = 1;
                this.grid.selectionStartRow = this.startRow;
                this.grid.selectionEndRow = row;
                this.grid.selectionStartCol = 1;
                this.grid.selectionEndCol = this.grid.cols - 1;
                this.grid.requestRedraw();
            }
            return;
        }
        // Handle full column selection
        if (clickY < this.grid.headerHeight && clickX >= this.grid.headerWidth) {
            this.dragState.isDraggingColHeader = true;
            const col = this.grid.colAtX(virtualX);
            if (col) {
                this.startCol = col;
                this.grid.selectedCol = col;
                this.grid.selectedRow = 1;
                this.grid.selectionStartCol = this.startCol;
                this.grid.selectionEndCol = col;
                this.grid.selectionStartRow = 1;
                this.grid.selectionEndRow = this.grid.rows - 1;
                this.grid.requestRedraw();
            }
            return;
        }
        // Handle cell selection
        if (clickX < this.grid.headerWidth || clickY < this.grid.headerHeight)
            return;
        const row = this.grid.rowAtY(virtualY);
        const col = this.grid.colAtX(virtualX);
        if (row && row < this.grid.rows && col && col < this.grid.cols) {
            this.dragState.isDraggingSelection = true;
            this.grid.selectedRow = row;
            this.grid.selectedCol = col;
            this.grid.selectionStartRow = row;
            this.grid.selectionStartCol = col;
            this.grid.selectionEndRow = row;
            this.grid.selectionEndCol = col;
            document.getElementById("selectedInfo").textContent = `R${row}, C${col}`;
            this.grid.requestRedraw();
        }
    }
    /**
     * @private
     * @method handleMouseDrag
     * @description Handles mouse drag events for selecting a range of cells and auto-scrolling during selection.
     * @param {MouseEvent} e - The mouse event object.
     */
    handleMouseDrag(e) {
        const rect = this.grid.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const virtualX = mouseX + this.grid.scrollX;
        const virtualY = mouseY + this.grid.scrollY;
        if (this.dragState.isDraggingRowHeader) {
            const row = this.grid.rowAtY(virtualY);
            if (row) {
                this.grid.selectionStartRow = this.startRow;
                this.grid.selectionEndRow = row;
                this.grid.selectionStartCol = 1;
                this.grid.selectionEndCol = this.grid.cols - 1;
                this.grid.requestRedraw();
            }
            return;
        }
        if (this.dragState.isDraggingColHeader) {
            const col = this.grid.colAtX(virtualX);
            if (col) {
                this.grid.selectionStartCol = this.startCol;
                this.grid.selectionEndCol = col;
                this.grid.selectionStartRow = 1;
                this.grid.selectionEndRow = this.grid.rows - 1;
                this.grid.requestRedraw();
            }
            return;
        }
        if (!this.dragState.isDraggingSelection)
            return;
        // const scrollAmount = 10;
        // const hScrollbar = document.querySelector(".scrollbar-h")!;
        // const vScrollbar = document.querySelector(".scrollbar-v")!;
        // // Auto-scrolls the grid if the mouse drags near the edges
        // if (mouseY < this.grid.headerHeight) vScrollbar.scrollTop -= scrollAmount;
        // if (mouseY > rect.height) vScrollbar.scrollTop += scrollAmount;
        // if (mouseX < this.grid.headerWidth) hScrollbar.scrollLeft -= scrollAmount;
        // if (mouseX > rect.width) hScrollbar.scrollLeft += scrollAmount;
        // Store the latest mouse position.
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        // Manage the auto-scroll interval (start/stop it as needed).
        this.handleAutoScroll();
        // Determines the row and column at the current mouse position
        const row = this.grid.rowAtY(virtualY) ||
            (virtualY < this.grid.headerHeight ? 1 : this.grid.rows - 1);
        const col = this.grid.colAtX(virtualX) ||
            (virtualX < this.grid.headerWidth ? 1 : this.grid.cols - 1);
        if (row && col) {
            const endRow = Math.max(1, Math.min(row, this.grid.rows - 1));
            const endCol = Math.max(1, Math.min(col, this.grid.cols - 1));
            // Updates the selection end coordinates and redraws the grid if changed
            if (endRow !== this.grid.selectionEndRow ||
                endCol !== this.grid.selectionEndCol) {
                this.grid.selectionEndRow = endRow;
                this.grid.selectionEndCol = endCol;
                this.grid.requestRedraw();
            }
        }
    }
    /**
     * @private
     * @method handleMouseUp
     * @description Handles mouse up events, ending the cell selection drag operation.
     * @param {MouseEvent} e - The mouse event object.
     */
    handleMouseUp(e) {
        this.dragState.isDraggingSelection = false;
        this.dragState.isDraggingRowHeader = false;
        this.dragState.isDraggingColHeader = false;
        // Crucial: Stop any auto-scrolling when the mouse is released.
        if (this.autoScrollIntervalId) {
            clearInterval(this.autoScrollIntervalId);
            this.autoScrollIntervalId = null;
        }
        this.grid.requestRedraw();
    }
    /**
     * @private
     * @method handleCanvasDblClick
     * @description Handles double-click events on the canvas to show the input box for the selected cell.
     * @param {MouseEvent} e - The mouse event object.
     */
    handleCanvasDblClick(e) {
        if (this.grid.selectedRow !== null && this.grid.selectedCol !== null) {
            this.inputHandler.showInputBox(this.grid.selectedRow, this.grid.selectedCol);
        }
    }
    /**
     * @private
     * @method handleAutoScroll
     * @description NEW: Manages the starting and stopping of the auto-scroll interval.
     */
    handleAutoScroll() {
        const rect = this.grid.canvas.getBoundingClientRect();
        const scrollAmount = 20;
        let scrollX = 0;
        let scrollY = 0;
        // Check for vertical scroll.
        // The top boundary is now the bottom of the column header area.
        if (this.lastMouseY < rect.top + this.grid.headerHeight) {
            scrollY = -scrollAmount;
        }
        else if (this.lastMouseY > rect.bottom) {
            scrollY = scrollAmount;
        }
        // Check for horizontal scroll.
        // The left boundary is now the right side of the row header area.
        if (this.lastMouseX < rect.left + this.grid.headerWidth) {
            scrollX = -scrollAmount;
        }
        else if (this.lastMouseX > rect.right) {
            // FIXED TYPO: This is now positive for right-scroll.
            scrollX = scrollAmount;
        }
        if (scrollX !== 0 || scrollY !== 0) {
            // If we need to scroll and there's no interval running, start one.
            if (this.autoScrollIntervalId === null) {
                this.autoScrollIntervalId = window.setInterval(() => {
                    const hScrollbar = document.querySelector(".scrollbar-h");
                    const vScrollbar = document.querySelector(".scrollbar-v");
                    hScrollbar.scrollLeft += scrollX;
                    vScrollbar.scrollTop += scrollY;
                    // After scrolling, we must update the selection end based on the new virtual coordinates
                    const currentRect = this.grid.canvas.getBoundingClientRect();
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
                        if (endRow)
                            this.grid.selectionEndRow = endRow;
                        if (endCol)
                            this.grid.selectionEndCol = endCol;
                    }
                    this.grid.requestRedraw();
                }, 50); // scrolls every 50ms
            }
        }
        else {
            // If we are inside the canvas, clear any existing interval.
            if (this.autoScrollIntervalId !== null) {
                clearInterval(this.autoScrollIntervalId);
                this.autoScrollIntervalId = null;
            }
        }
    }
    /**
     * @private
     * @method handleKeydown
     * @description Handles keyboard events for navigation, cell editing (F2, Backspace, direct typing), and deleting cell content.
     * @param {KeyboardEvent} e - The keyboard event object.
     */
    handleKeydown(e) {
        if (this.inputHandler.isActive())
            return;
        if (this.grid.selectedRow === null || this.grid.selectedCol === null)
            return;
        let nextRow = this.grid.selectedRow;
        let nextCol = this.grid.selectedCol;
        let navigate = false;
        switch (e.key) {
            case "Enter":
            case "ArrowDown":
                nextRow = Math.min(this.grid.rows - 2, this.grid.selectedRow + 1);
                navigate = true;
                break;
            case "ArrowUp":
                nextRow = Math.max(1, this.grid.selectedRow - 1);
                navigate = true;
                break;
            case "ArrowLeft":
                nextCol = Math.max(1, this.grid.selectedCol - 1);
                navigate = true;
                break;
            case "ArrowRight":
                nextCol = Math.min(this.grid.cols - 2, this.grid.selectedCol + 1);
                navigate = true;
                break;
            case "Tab":
                e.preventDefault();
                if (e.shiftKey) {
                    nextCol = Math.max(1, this.grid.selectedCol - 1);
                }
                else {
                    nextCol = Math.min(this.grid.cols - 1, this.grid.selectedCol + 1);
                }
                navigate = true;
                break;
            case "F2":
                // Shows the input box for editing the current cell
                this.inputHandler.showInputBox(this.grid.selectedRow, this.grid.selectedCol);
                e.preventDefault();
                return;
            case "Delete":
                // Clears the content of all cells within the current selection
                if (this.grid.selectionStartRow !== null) {
                    const minRow = Math.min(this.grid.selectionStartRow, this.grid.selectionEndRow);
                    const maxRow = Math.max(this.grid.selectionStartRow, this.grid.selectionEndRow);
                    const minCol = Math.min(this.grid.selectionStartCol, this.grid.selectionEndCol);
                    const maxCol = Math.max(this.grid.selectionStartCol, this.grid.selectionEndCol);
                    for (let r = minRow; r <= maxRow; r++) {
                        for (let c = minCol; c <= maxCol; c++) {
                            this.grid.setCellValue(r, c, "");
                        }
                    }
                    this.grid.requestRedraw();
                }
                e.preventDefault();
                return;
            case "Backspace":
                // Clears the content of the selected cell and opens the input box
                this.grid.setCellValue(this.grid.selectedRow, this.grid.selectedCol, "");
                this.inputHandler.showInputBox(this.grid.selectedRow, this.grid.selectedCol);
                e.preventDefault();
                return;
        }
        if (navigate) {
            e.preventDefault();
            this.grid.selectedRow = nextRow;
            this.grid.selectedCol = nextCol;
            this.grid.selectionStartRow = nextRow;
            this.grid.selectionStartCol = nextCol;
            this.grid.selectionEndRow = nextRow;
            this.grid.selectionEndCol = nextCol;
            document.getElementById("selectedInfo").textContent = `R${nextRow}, C${nextCol}`;
            this.inputHandler.ensureCellVisible(nextRow, nextCol);
            this.grid.requestRedraw();
            return;
        }
        // Handles direct typing into a cell
        if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            this.grid.setCellValue(this.grid.selectedRow, this.grid.selectedCol, "");
            this.inputHandler.showInputBox(this.grid.selectedRow, this.grid.selectedCol, e.key);
        }
    }
}
// Initializes the App once the DOM is fully loaded
window.addEventListener("DOMContentLoaded", () => new App());
