import { Grid } from "./Grid";
import { InputHandler } from "./InputHandler";
import { DataManager } from "./DataManager";
import { ColumnResizeHandler } from "./handlers/ColumnResizeHandler";
import { RowResizeHandler } from "./handlers/RowResizeHandler";
import { RowSelectionHandler } from "./handlers/RowSelectionHandler";
import { ColumnSelectionHandler } from "./handlers/ColumnSelectionHandler";
import { RangeSelectionHandler } from "./handlers/RangeSelectionHandler";
import { AutoScrollHandler } from "./handlers/AutoScrollHandler";
import { CellNavigationHandler } from "./handlers/CellNavigationHandler";
import { ActionLogger } from "./ActionLogger";
import { GridInteractionHandler } from "./GridInteractionHandler";

/**
 * @class App
 * @description Main application class that orchestrates the grid and all interaction handlers.
 */
class App {
  private grid: Grid;
  private inputHandler: InputHandler;
  private actionLogger: ActionLogger;
  private interactionHandler: GridInteractionHandler;
  private cellNavigationHandler: CellNavigationHandler;

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

    // 1. Create the core components
    this.grid = new Grid(canvas, rows, cols, cellWidth, cellHeight);
    this.inputHandler = new InputHandler(this.grid);
    this.actionLogger = new ActionLogger();

    // 2. Create all specific interaction handlers
    const autoScrollHandler = new AutoScrollHandler(this.grid, canvas);
    const handlers = {
      range: new RangeSelectionHandler(this.grid),
      row: new RowSelectionHandler(this.grid),
      column: new ColumnSelectionHandler(this.grid),
      rowResize: new RowResizeHandler(this.grid),
      columnResize: new ColumnResizeHandler(this.grid),
    };

    // 3. Create the central interaction controller and pass it all its dependencies
    this.interactionHandler = new GridInteractionHandler(
      this.grid,
      canvas,
      this.inputHandler,
      this.actionLogger,
      autoScrollHandler,
      handlers
    );

    // 4. Create keyboard handler and pass it the central controller for state checking
    this.cellNavigationHandler = new CellNavigationHandler(
      this.grid,
      this.inputHandler,
      this.interactionHandler
    );

    // 5. Inject the interaction handler into components that need to know its state
    this.grid.setInteractionHandler(this.interactionHandler);

    this.setupEventListeners();
    this.setupUI();

    this.grid.resizeCanvas();
  }

  /**
   * @private
   * @method setupEventListeners
   * @description Sets up event listeners for non-mouse interactions like scrolling and keyboard.
   */
  private setupEventListeners(): void {
    const hScrollbar = document.querySelector(".scrollbar-h")!;
    const vScrollbar = document.querySelector(".scrollbar-v")!;

    // Start listening for mouse events via the central handler
    this.interactionHandler.attachEventListeners();

    window.addEventListener("resize", () => this.grid.resizeCanvas());
    hScrollbar.addEventListener("scroll", this.handleScroll.bind(this));
    vScrollbar.addEventListener("scroll", this.handleScroll.bind(this));
    this.grid.canvas.addEventListener("wheel", this.handleWheel.bind(this), {
      passive: false,
    });
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
}

// Initializes the App once the DOM is fully loaded
window.addEventListener("DOMContentLoaded", () => new App());
