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

class App {
  private grid: Grid;
  private inputHandler: InputHandler;
  private actionLogger: ActionLogger;
  private interactionHandler: GridInteractionHandler;
  private cellNavigationHandler: CellNavigationHandler;

  constructor() {
    const canvas = document.getElementById("gridCanvas") as HTMLCanvasElement;
    const rows = 100000;
    const cols = 500;
    const defaultCellW = 64;
    const defaultCellH = 20;

    // Create the core grid components
    this.grid = new Grid(canvas, rows, cols, defaultCellW, defaultCellH);
    this.inputHandler = new InputHandler(this.grid);
    this.actionLogger = new ActionLogger();

    // Create all helper classes for mouse interactions
    const autoScrollHandler = new AutoScrollHandler(this.grid, canvas);
    const handlers = {
      range: new RangeSelectionHandler(this.grid),
      row: new RowSelectionHandler(this.grid),
      column: new ColumnSelectionHandler(this.grid),
      rowResize: new RowResizeHandler(this.grid),
      columnResize: new ColumnResizeHandler(this.grid),
    };

    // Create the main interaction controller that manages all handlers
    this.interactionHandler = new GridInteractionHandler(
      this.grid,
      canvas,
      this.inputHandler,
      this.actionLogger,
      autoScrollHandler,
      handlers
    );

    // Create the keyboard handler
    this.cellNavigationHandler = new CellNavigationHandler(
      this.grid,
      this.inputHandler,
      this.interactionHandler
    );

    // Let the grid know about the interaction handler so it can check if we're dragging
    this.grid.setInteractionHandler(this.interactionHandler);

    this.setupEventListeners();
    this.setupUI();

    // Do an initial resize and draw
    this.grid.resizeCanvas();
  }

  private setupEventListeners(): void {
    const hScrollbar = document.querySelector(".scrollbar-h")!;
    const vScrollbar = document.querySelector(".scrollbar-v")!;

    // Tell the interaction handler to start listening for mouse events
    this.interactionHandler.attachEventListeners();

    // Other listeners
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

  private setupUI(): void {
    // Create some buttons and inputs for loading data
    const controlsDiv = document.createElement("div");
    controlsDiv.style.display = "flex";
    controlsDiv.style.alignItems = "center";
    controlsDiv.style.padding = "4px";

    const genButton = document.createElement("button");
    genButton.textContent = "Generate and Load";
    genButton.style.marginRight = "8px";

    const numInput = document.createElement("input");
    numInput.type = "number";
    numInput.placeholder = "e.g., 50000";
    numInput.value = "50000";
    numInput.style.width = "120px";
    numInput.style.marginRight = "16px";

    genButton.addEventListener("click", () => {
      const count = parseInt(numInput.value, 10);
      const maxRecords = this.grid.rows - 10;
      if (isNaN(count) || count <= 0) {
        alert("Please enter a valid positive number.");
        return;
      }
      if (count > maxRecords) {
        alert(`Number of records is too high! Max is ${maxRecords}.`);
        numInput.value = maxRecords.toString();
        return;
      }
      DataManager.generateAndLoadData(this.grid, count);
    });

    const fileLabel = document.createElement("label");
    fileLabel.textContent = "Or Load File:";
    fileLabel.style.marginRight = "8px";
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json,application/json";
    fileInput.addEventListener("change", (e) =>
      DataManager.handleFileLoad(e, this.grid)
    );

    controlsDiv.appendChild(genButton);
    controlsDiv.appendChild(numInput);
    controlsDiv.appendChild(fileLabel);
    controlsDiv.appendChild(fileInput);
    document.body.insertBefore(controlsDiv, document.body.firstChild);
  }

  private handleScroll(): void {
    // When the scrollbars move, update the grid's internal scroll position
    this.grid.scrollX = document.querySelector(".scrollbar-h")!.scrollLeft;
    this.grid.scrollY = document.querySelector(".scrollbar-v")!.scrollTop;
    this.grid.requestRedraw();

    // if we're editing a cell, make sure the input box moves with the scroll
    if (this.inputHandler.isActive()) {
      this.inputHandler.updateInputPosition();
    }
  }

  private handleWheel(e: WheelEvent): void {
    e.preventDefault();
    const hScrollbar = document.querySelector(".scrollbar-h")!;
    const vScrollbar = document.querySelector(".scrollbar-v")!;
    const rowScrollAmount = 20;
    const colScrollAmount = 100;

    // if shift is held, scroll horizontally. Otherwise, vertically.
    if (e.shiftKey) {
      hScrollbar.scrollLeft += Math.sign(e.deltaY) * colScrollAmount;
    } else {
      vScrollbar.scrollTop += Math.sign(e.deltaY) * rowScrollAmount;
    }
  }
}

window.addEventListener("DOMContentLoaded", () => new App());
