// src/main.ts
import { Grid } from "./Grid";
import { ResizeHandler } from "./ResizeHandler";
import { InputHandler } from "./InputHandler";
import { DataManager } from "./DataManager";
/**
 * Main application class to initialize and connect all components.
 */
class App {
    constructor() {
        const canvas = document.getElementById("gridCanvas");
        const rows = 100000;
        const cols = 500;
        const cellWidth = 64;
        const cellHeight = 20;
        this.grid = new Grid(canvas, rows, cols, cellWidth, cellHeight);
        this.resizeHandler = new ResizeHandler(this.grid, canvas);
        this.inputHandler = new InputHandler(this.grid);
        this.setupEventListeners();
        this.setupUI();
        this.grid.drawGrid();
    }
    /**
     * Sets up all the necessary global event listeners for the application.
     */
    setupEventListeners() {
        const hScrollbar = document.querySelector(".scrollbar-h");
        const vScrollbar = document.querySelector(".scrollbar-v");
        const canvas = this.grid.canvas;
        window.addEventListener("resize", () => this.grid.resizeCanvas());
        hScrollbar.addEventListener("scroll", this.handleScroll.bind(this));
        vScrollbar.addEventListener("scroll", this.handleScroll.bind(this));
        canvas.addEventListener("wheel", this.handleWheel.bind(this), {
            passive: false,
        });
        canvas.addEventListener("click", this.handleCanvasClick.bind(this));
        document.addEventListener("keydown", this.handleKeydown.bind(this));
    }
    /**
     * Sets up the data generation and loading buttons.
     */
    setupUI() {
        const generateBtn = document.createElement("button");
        generateBtn.id = "generateDataBtn";
        generateBtn.textContent = "Generate 50,000 JSON Records";
        generateBtn.style.margin = "8px";
        generateBtn.addEventListener("click", DataManager.generateAndDownloadData);
        const loadInput = document.createElement("input");
        loadInput.type = "file";
        loadInput.id = "loadDataInput";
        loadInput.accept = ".json,application/json";
        loadInput.style.margin = "8px";
        loadInput.addEventListener("change", (e) => DataManager.handleFileLoad(e, this.grid));
        document.body.insertBefore(generateBtn, document.body.firstChild);
        document.body.insertBefore(loadInput, document.body.firstChild);
    }
    /**
     * Handles scroll events from the custom scrollbars.
     */
    handleScroll() {
        this.grid.scrollX = document.querySelector(".scrollbar-h").scrollLeft;
        this.grid.scrollY = document.querySelector(".scrollbar-v").scrollTop;
        this.grid.drawGrid();
        if (this.inputHandler.isActive()) {
            this.inputHandler.updateInputPosition();
        }
    }
    /**
     * Handles mouse wheel events on the canvas for scrolling.
     * @param {WheelEvent} e The wheel event.
     */
    handleWheel(e) {
        e.preventDefault();
        const hScrollbar = document.querySelector(".scrollbar-h");
        const vScrollbar = document.querySelector(".scrollbar-v");
        const scrollAmount = 60;
        if (e.shiftKey) {
            hScrollbar.scrollLeft += Math.sign(e.deltaY) * scrollAmount;
        }
        else {
            vScrollbar.scrollTop += Math.sign(e.deltaY) * scrollAmount;
        }
    }
    /**
     * Handles click events on the canvas to select cells or headers.
     * @param {MouseEvent} e The mouse event.
     */
    handleCanvasClick(e) {
        const rect = this.grid.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        const virtualX = clickX + this.grid.scrollX;
        const virtualY = clickY + this.grid.scrollY;
        if (clickX < this.grid.headerWidth && clickY >= this.grid.headerHeight) {
            const row = this.grid.rowAtY(virtualY);
            if (row && row < this.grid.rows) {
                this.grid.highlightedRowHeader = row;
                this.grid.highlightedColHeader = null;
                this.grid.selectedRow = null;
                this.grid.selectedCol = null;
                this.grid.drawGrid();
            }
            return;
        }
        if (clickY < this.grid.headerHeight && clickX >= this.grid.headerWidth) {
            const col = this.grid.colAtX(virtualX);
            if (col && col < this.grid.cols) {
                this.grid.highlightedColHeader = col;
                this.grid.highlightedRowHeader = null;
                this.grid.selectedRow = null;
                this.grid.selectedCol = null;
                this.grid.drawGrid();
            }
            return;
        }
        if (clickX < this.grid.headerWidth || clickY < this.grid.headerHeight)
            return;
        this.grid.highlightedRowHeader = null;
        this.grid.highlightedColHeader = null;
        const row = this.grid.rowAtY(virtualY);
        const col = this.grid.colAtX(virtualX);
        if (row && row < this.grid.rows && col && col < this.grid.cols) {
            this.grid.selectedRow = row;
            this.grid.selectedCol = col;
            document.getElementById("selectedInfo").textContent = `R${row}, C${col}`;
            this.grid.drawGrid();
            this.inputHandler.showInputBox(row, col);
        }
    }
    /**
     * Handles global keydown events for grid navigation.
     * @param {KeyboardEvent} e The keyboard event.
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
            case "ArrowDown":
                nextRow = Math.min(this.grid.rows - 1, this.grid.selectedRow + 1);
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
                nextCol = Math.min(this.grid.cols - 1, this.grid.selectedCol + 1);
                navigate = true;
                break;
            case "Enter":
            case "F2":
                this.inputHandler.showInputBox(this.grid.selectedRow, this.grid.selectedCol);
                return;
        }
        if (navigate) {
            e.preventDefault();
            this.grid.selectedRow = nextRow;
            this.grid.selectedCol = nextCol;
            document.getElementById("selectedInfo").textContent = `R${nextRow}, C${nextCol}`;
            this.inputHandler.ensureCellVisible(nextRow, nextCol);
            this.grid.drawGrid();
        }
    }
}
window.addEventListener("DOMContentLoaded", () => new App());
