// src/App.ts
import { Grid } from "./Grid";
import { InputHandler } from "./InputHandler";
import { DataManager } from "./DataManager";
import { ColResize } from "./handlers/colResize";
import { RowResize } from "./handlers/rowResize";
import { RowSelection } from "./handlers/rowSelection";
import { ColSelection } from "./handlers/colSelection";
import { RangeSelection } from "./handlers/rangeSelection";
import { AutoScroll } from "./handlers/autoScroll";
import { CellNavigation } from "./handlers/cellNavigation";
import { HistoryManager } from "./history/historyManager";
import { TouchHandler } from "./touchHandler";
class App {
    constructor() {
        const canvas = document.getElementById("gridCanvas");
        const rows = 100000;
        const cols = 500;
        const defaultCellW = 80;
        const defaultCellH = 24;
        // 1. Core grid components are created first.
        this.grid = new Grid(canvas, rows, cols, defaultCellW, defaultCellH);
        this.historyManager = new HistoryManager(this.grid);
        this.inputHandler = new InputHandler(this.grid, this.historyManager);
        // 2. Helper classes for mouse interactions are created.
        const autoScrollHandler = new AutoScroll(this.grid, canvas);
        const handlers = {
            range: new RangeSelection(this.grid),
            row: new RowSelection(this.grid),
            column: new ColSelection(this.grid),
            // HistoryManager is passed directly to handlers that need to record actions.
            rowResize: new RowResize(this.grid, this.historyManager),
            columnResize: new ColResize(this.grid, this.historyManager),
        };
        // 3. The main TouchHandler orchestrates all mouse interactions.
        // It no longer needs the HistoryManager itself.
        this.touchHandler = new TouchHandler(this.grid, canvas, this.inputHandler, autoScrollHandler, handlers);
        // 4. Keyboard navigation handler is created.
        this.cellNavigation = new CellNavigation(this.grid, this.inputHandler, this.touchHandler);
        // 5. Wire up dependencies and initialize.
        this.grid.setTouchHandler(this.touchHandler);
        this.setupEventListeners();
        this.setupUI();
        this.grid.resizeCanvas();
    }
    /**
     * Attaches all high-level event listeners for the application.
     */
    setupEventListeners() {
        const hScrollbar = document.querySelector(".scrollbar-h");
        const vScrollbar = document.querySelector(".scrollbar-v");
        // Touch/Mouse events are delegated to the TouchHandler.
        this.touchHandler.attachEventListeners();
        window.addEventListener("resize", () => this.grid.resizeCanvas());
        hScrollbar.addEventListener("scroll", this.handleScroll.bind(this));
        vScrollbar.addEventListener("scroll", this.handleScroll.bind(this));
        this.grid.canvas.addEventListener("wheel", this.handleWheel.bind(this), {
            passive: false,
        });
        // A single, central keydown listener for the whole app.
        document.addEventListener("keydown", (e) => this.handleKeyDown(e));
    }
    /**
     * Central keyboard event handler. It processes global shortcuts like undo/redo
     * before delegating to the navigation handler.
     */
    handleKeyDown(e) {
        // Handle global shortcuts first (e.g., Undo/Redo).
        if (e.ctrlKey || e.metaKey) {
            // metaKey for macOS
            if (e.key.toLowerCase() === "z") {
                e.preventDefault();
                if (e.shiftKey) {
                    this.historyManager.redo();
                }
                else {
                    this.historyManager.undo();
                }
                return; // Stop processing after handling undo/redo.
            }
        }
        // If it wasn't a global shortcut, pass it to the cell navigation handler.
        this.cellNavigation.handleKeyDown(e);
    }
    /**
     * Programmatically creates the UI controls for data generation and file loading.
     */
    setupUI() {
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
            const maxRecords = this.grid.rows - 10; // Reserve some rows
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
        fileInput.addEventListener("change", (e) => DataManager.handleFileLoad(e, this.grid));
        controlsDiv.appendChild(genButton);
        controlsDiv.appendChild(numInput);
        controlsDiv.appendChild(fileLabel);
        controlsDiv.appendChild(fileInput);
        document.body.insertBefore(controlsDiv, document.body.firstChild);
        // Status bar for selection stats
        const statusBar = document.createElement("div");
        statusBar.id = "statusBar";
        statusBar.style.padding = "4px 8px";
        statusBar.style.fontFamily = "monospace";
        statusBar.style.fontSize = "12px";
        statusBar.style.background = "#f8f8f8";
        statusBar.style.borderTop = "1px solid #ccc";
        statusBar.style.position = "fixed";
        statusBar.style.bottom = "0";
        statusBar.style.left = "0";
        statusBar.style.width = "100%";
        statusBar.style.boxSizing = "border-box";
        statusBar.innerHTML =
            'Count: <span id="statCount">0</span>  |  Sum: <span id="statSum">0</span>  |  Average: <span id="statAverage">0</span>  |  Min: <span id="statMin">0</span>  |  Max: <span id="statMax">0</span>';
        document.body.appendChild(statusBar);
    }
    /**
     * Handles scroll events from the custom scrollbars, updating the grid's
     * scroll position and redrawing.
     */
    handleScroll() {
        this.grid.scrollX = document.querySelector(".scrollbar-h").scrollLeft;
        this.grid.scrollY = document.querySelector(".scrollbar-v").scrollTop;
        this.grid.requestRedraw();
        if (this.inputHandler.isActive()) {
            this.inputHandler.updateInputPosition();
        }
    }
    /**
     * Handles mouse wheel events for scrolling the grid.
     */
    handleWheel(e) {
        e.preventDefault();
        const hScrollbar = document.querySelector(".scrollbar-h");
        const vScrollbar = document.querySelector(".scrollbar-v");
        const rowScrollAmount = 40;
        const colScrollAmount = 100;
        // Use Shift key to scroll horizontally
        if (e.shiftKey) {
            hScrollbar.scrollLeft += Math.sign(e.deltaY) * colScrollAmount;
        }
        else {
            vScrollbar.scrollTop += Math.sign(e.deltaY) * rowScrollAmount;
        }
    }
}
// Start the application once the DOM is ready.
window.addEventListener("DOMContentLoaded", () => new App());
