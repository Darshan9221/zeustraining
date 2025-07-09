// src/main.ts
import { Grid } from "./Grid";
import { InputHandler } from "./InputHandler";
import { DataManager } from "./DataManager";
import { ColumnResizeHandler } from "./handlers/ColumnResizeHandler";
import { RowResizeHandler } from "./handlers/RowResizeHandler";
import { RowSelectionHandler } from "./handlers/RowSelectionHandler";
import { ColumnSelectionHandler } from "./handlers/ColumnSelectionHandler";
import { RangeSelectionHandler } from "./handlers/RangeSelectionHandler";
import { AutoScrollHandler } from "./handlers/AutoScrollHandler";
import { CellSelectionHandler } from "./handlers/CellSelectionHandler";
import { CellNavigationHandler } from "./handlers/CellNavigationHandler";

export interface DragState {
  isDraggingSelection: boolean;
  isDraggingRowHeader: boolean;
  isDraggingColHeader: boolean;
  isResizing: boolean; // Flag to indicate a column/row resize is active
}

/**
 * @class App
 * @description Main application class that orchestrates the grid and all interaction handlers.
 */
class App {
  private grid: Grid;
  private inputHandler: InputHandler;

  // Handlers for specific features
  private columnResizeHandler: ColumnResizeHandler;
  private rowResizeHandler: RowResizeHandler;
  private rowSelectionHandler: RowSelectionHandler;
  private columnSelectionHandler: ColumnSelectionHandler;
  private cellSelectionHandler: CellSelectionHandler;
  private rangeSelectionHandler: RangeSelectionHandler;
  private cellNavigationHandler: CellNavigationHandler;
  private autoScrollHandler: AutoScrollHandler;

  // Shared state object passed to handlers that need it.
  private dragState: DragState = {
    isDraggingSelection: false,
    isDraggingRowHeader: false,
    isDraggingColHeader: false,
    isResizing: false,
  };

  /**
   * @constructor
   * @description Initializes the App by setting up the canvas, grid, and all handlers.
   */
  constructor() {
    const canvas = document.getElementById("gridCanvas") as HTMLCanvasElement;
    const rows = 100000;
    const cols = 500;
    const cellWidth = 64;
    const cellHeight = 20;

    this.grid = new Grid(
      canvas,
      rows,
      cols,
      cellWidth,
      cellHeight,
      this.dragState
    );

    // Initialize all feature handlers
    this.inputHandler = new InputHandler(this.grid);
    this.columnResizeHandler = new ColumnResizeHandler(
      this.grid,
      canvas,
      this.dragState
    );
    this.rowResizeHandler = new RowResizeHandler(
      this.grid,
      canvas,
      this.dragState
    );
    this.rowSelectionHandler = new RowSelectionHandler(
      this.grid,
      this.dragState
    );
    this.columnSelectionHandler = new ColumnSelectionHandler(
      this.grid,
      this.dragState
    );
    this.cellSelectionHandler = new CellSelectionHandler(
      this.grid,
      this.dragState
    );
    // --- MODIFIED --- Pass the dragState to the navigation handler
    this.cellNavigationHandler = new CellNavigationHandler(
      this.grid,
      this.inputHandler,
      this.dragState
    );
    this.rangeSelectionHandler = new RangeSelectionHandler(
      this.grid,
      this.dragState
    );
    this.autoScrollHandler = new AutoScrollHandler(
      this.grid,
      canvas,
      this.dragState
    );

    this.setupEventListeners();
    this.setupUI();

    this.grid.resizeCanvas();
  }

  /**
   * @private
   * @method setupEventListeners
   * @description Sets up all the event listeners for user interactions like scrolling, mouse actions, and keyboard input.
   */
  private setupEventListeners(): void {
    const hScrollbar = document.querySelector(".scrollbar-h")!;
    const vScrollbar = document.querySelector(".scrollbar-v")!;
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
    // Listens for keyboard input and delegates to the navigation handler
    document.addEventListener("keydown", (e) =>
      this.cellNavigationHandler.handleKeyDown(e)
    );
  }

  /**
   * @private
   * @method setupUI
   * @description Sets up the user interface elements like buttons and input fields for data generation and file loading.
   */
  private setupUI(): void {
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
    loadFileInput.addEventListener("change", (e) =>
      DataManager.handleFileLoad(e, this.grid)
    );

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
  private handleScroll(): void {
    this.grid.scrollX = document.querySelector(".scrollbar-h")!.scrollLeft;
    this.grid.scrollY = document.querySelector(".scrollbar-v")!.scrollTop;
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
  private handleWheel(e: WheelEvent): void {
    e.preventDefault();
    const hScrollbar = document.querySelector(".scrollbar-h")!;
    const vScrollbar = document.querySelector(".scrollbar-v")!;
    const rowscrollAmount = 20;
    const colscrollAmount = 100;
    // Scrolls horizontally if Shift key is pressed, otherwise scrolls vertically
    if (e.shiftKey) {
      hScrollbar.scrollLeft += Math.sign(e.deltaY) * colscrollAmount;
    } else {
      vScrollbar.scrollTop += Math.sign(e.deltaY) * rowscrollAmount;
    }
  }

  /**
   * @private
   * @method handleMouseDown
   * @description Delegates mouse down events to the appropriate handlers.
   * @param {MouseEvent} e - The mouse event object.
   */
  private handleMouseDown(e: MouseEvent): void {
    // Commits and hides the input box if it's active
    if (this.inputHandler.isActive()) {
      this.inputHandler.commitAndHideInput();
    }

    // Delegate to handlers. Resize handlers go first to set the isResizing flag.
    this.columnResizeHandler.handleMouseDown(e);
    this.rowResizeHandler.handleMouseDown(e);

    // Selection handlers will now check the isResizing flag and ignore clicks if needed.
    this.rowSelectionHandler.handleMouseDown(e);
    this.columnSelectionHandler.handleMouseDown(e);
    this.cellSelectionHandler.handleMouseDown(e);
  }

  /**
   * @private
   * @method handleMouseDrag
   * @description Delegates mouse drag events to the appropriate handlers.
   * @param {MouseEvent} e - The mouse event object.
   */
  private handleMouseDrag(e: MouseEvent): void {
    // Delegate to handlers.
    this.columnResizeHandler.handleMouseDrag(e);
    this.rowResizeHandler.handleMouseDrag(e);
    this.rowSelectionHandler.handleMouseDrag(e);
    this.columnSelectionHandler.handleMouseDrag(e);
    this.rangeSelectionHandler.handleMouseDrag(e);
    this.autoScrollHandler.handleMouseDrag(e);
  }

  /**
   * @private
   * @method handleMouseUp
   * @description Delegates mouse up events, resetting all drag-related states.
   * @param {MouseEvent} e - The mouse event object.
   */
  private handleMouseUp(e: MouseEvent): void {
    // Let resize handlers finish first to reset the isResizing flag.
    this.columnResizeHandler.handleMouseUp();
    this.rowResizeHandler.handleMouseUp();

    // Reset shared drag state for selections.
    this.dragState.isDraggingSelection = false;
    this.dragState.isDraggingRowHeader = false;
    this.dragState.isDraggingColHeader = false;

    // Stop auto-scrolling
    this.autoScrollHandler.handleMouseUp();

    this.grid.requestRedraw();
  }

  /**
   * @private
   * @method handleCanvasDblClick
   * @description Handles double-click events on the canvas to show the input box for the selected cell.
   * @param {MouseEvent} e - The mouse event object.
   */
  private handleCanvasDblClick(e: MouseEvent): void {
    if (this.grid.selectedRow !== null && this.grid.selectedCol !== null) {
      this.inputHandler.showInputBox(
        this.grid.selectedRow,
        this.grid.selectedCol
      );
    }
  }
}

// Initializes the App once the DOM is fully loaded
window.addEventListener("DOMContentLoaded", () => new App());
