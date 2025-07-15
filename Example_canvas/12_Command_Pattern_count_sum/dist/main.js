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
import { RegisterHandler } from "./registerHandler";
import { TouchHandler } from "./touchHandler";
class App {
    constructor() {
        const canvas = document.getElementById("gridCanvas");
        const rows = 100000;
        const cols = 500;
        const defaultCellW = 64;
        const defaultCellH = 20;
        // Core grid components
        this.grid = new Grid(canvas, rows, cols, defaultCellW, defaultCellH);
        this.inputHandler = new InputHandler(this.grid);
        this.registerHandler = new RegisterHandler();
        // Helper classes for mouse interactions
        const autoScrollHandler = new AutoScroll(this.grid, canvas);
        const handlers = {
            range: new RangeSelection(this.grid),
            row: new RowSelection(this.grid),
            column: new ColSelection(this.grid),
            rowResize: new RowResize(this.grid),
            columnResize: new ColResize(this.grid),
        };
        this.touchHandler = new TouchHandler(this.grid, canvas, this.inputHandler, this.registerHandler, autoScrollHandler, handlers);
        // Keyboard handler
        this.cellNavigation = new CellNavigation(this.grid, this.inputHandler, this.touchHandler);
        this.grid.setTouchHandler(this.touchHandler);
        this.setupEventListeners();
        this.setupUI();
        this.grid.resizeCanvas();
    }
    setupEventListeners() {
        const hScrollbar = document.querySelector(".scrollbar-h");
        const vScrollbar = document.querySelector(".scrollbar-v");
        this.touchHandler.attachEventListeners();
        window.addEventListener("resize", () => this.grid.resizeCanvas());
        hScrollbar.addEventListener("scroll", this.handleScroll.bind(this));
        vScrollbar.addEventListener("scroll", this.handleScroll.bind(this));
        this.grid.canvas.addEventListener("wheel", this.handleWheel.bind(this), {
            passive: false,
        });
        document.addEventListener("keydown", (e) => this.cellNavigation.handleKeyDown(e));
    }
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
        fileInput.addEventListener("change", (e) => DataManager.handleFileLoad(e, this.grid));
        controlsDiv.appendChild(genButton);
        controlsDiv.appendChild(numInput);
        controlsDiv.appendChild(fileLabel);
        controlsDiv.appendChild(fileInput);
        document.body.insertBefore(controlsDiv, document.body.firstChild);
        const statusBar = document.createElement("div");
        statusBar.id = "statusBar";
        statusBar.style.padding = "4px";
        statusBar.style.fontFamily = "monospace";
        statusBar.style.background = "#f8f8f8";
        statusBar.style.borderTop = "1px solid #ccc";
        document.body.appendChild(statusBar);
    }
    handleScroll() {
        this.grid.scrollX = document.querySelector(".scrollbar-h").scrollLeft;
        this.grid.scrollY = document.querySelector(".scrollbar-v").scrollTop;
        this.grid.requestRedraw();
        if (this.inputHandler.isActive()) {
            this.inputHandler.updateInputPosition();
        }
    }
    /**
     * Checks if a mouse click or move happened.
     * @param {MouseEvent} e - The mouse event to test.
     */
    handleWheel(e) {
        e.preventDefault();
        const hScrollbar = document.querySelector(".scrollbar-h");
        const vScrollbar = document.querySelector(".scrollbar-v");
        const rowScrollAmount = 20;
        const colScrollAmount = 100;
        if (e.shiftKey) {
            hScrollbar.scrollLeft += Math.sign(e.deltaY) * colScrollAmount;
        }
        else {
            vScrollbar.scrollTop += Math.sign(e.deltaY) * rowScrollAmount;
        }
    }
    updateStatistics() {
        if (this.grid) {
            this.grid.requestRedraw();
        }
    }
}
window.addEventListener("DOMContentLoaded", () => new App());
