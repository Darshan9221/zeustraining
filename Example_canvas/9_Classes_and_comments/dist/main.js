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
        // --- Configuration ---
        const rows = 100000;
        const cols = 500;
        const cellWidth = 64;
        const cellHeight = 20;
        // --- Initialization ---
        this.grid = new Grid(canvas, rows, cols, cellWidth, cellHeight);
        this.resizeHandler = new ResizeHandler(this.grid, canvas);
        this.inputHandler = new InputHandler(this.grid);
        this.setupEventListeners();
        this.setupUI();
        this.grid.drawGrid(); // Initial draw
    }
    /**
     * Sets up all the necessary global event listeners for the application.
     */
    setupEventListeners() {
        // ... (This function remains unchanged)
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
     * Sets up the UI controls: data generation dropdown, record count input, and file loader.
     */
    setupUI() {
        // --- Create a container for the controls for better layout ---
        const controlsContainer = document.createElement("div");
        controlsContainer.style.display = "flex";
        controlsContainer.style.alignItems = "center";
        controlsContainer.style.padding = "4px";
        // --- Create the Dropdown Menu ---
        const select = document.createElement("select");
        select.id = "generateDataSelect";
        select.style.marginRight = "8px";
        const placeholderOption = document.createElement("option");
        placeholderOption.textContent = "Generate Data...";
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        select.appendChild(placeholderOption);
        const downloadOption = document.createElement("option");
        downloadOption.textContent = "Generate and Download";
        downloadOption.value = "download";
        select.appendChild(downloadOption);
        const loadOption = document.createElement("option");
        loadOption.textContent = "Generate and Load";
        loadOption.value = "load";
        select.appendChild(loadOption);
        // --- Create the Number Input for Record Count ---
        const countInput = document.createElement("input");
        countInput.type = "number";
        countInput.id = "recordCountInput";
        countInput.placeholder = "e.g., 50000";
        countInput.value = "50000"; // Default value
        countInput.style.width = "120px";
        countInput.style.marginRight = "16px";
        // --- Add Event Listener to the Dropdown ---
        select.addEventListener("change", (e) => {
            const selectedValue = e.target.value;
            // --- Get and Validate the Record Count ---
            const count = parseInt(countInput.value, 10);
            const maxRecords = this.grid.rows - 10; // -1 for header, -9 for buffer
            if (isNaN(count) || count <= 0) {
                alert("Please enter a valid positive number of records.");
                select.selectedIndex = 0; // Reset dropdown
                return;
            }
            if (count > maxRecords) {
                alert(`Number of records cannot exceed ${maxRecords}. Please enter a smaller number.`);
                countInput.value = maxRecords.toString(); // Optional: set to max
                select.selectedIndex = 0; // Reset dropdown
                return;
            }
            // --- Perform the selected action ---
            if (selectedValue === "download") {
                DataManager.generateAndDownloadData(count);
            }
            else if (selectedValue === "load") {
                DataManager.generateAndLoadData(this.grid, count);
            }
            // Reset dropdown to the placeholder after action
            select.selectedIndex = 0;
        });
        // --- Create the File Input ---
        const loadFileLabel = document.createElement("label");
        loadFileLabel.textContent = "Or Load File:";
        loadFileLabel.style.marginRight = "8px";
        const loadFileInput = document.createElement("input");
        loadFileInput.type = "file";
        loadFileInput.id = "loadDataInput";
        loadFileInput.accept = ".json,application/json";
        loadFileInput.addEventListener("change", (e) => DataManager.handleFileLoad(e, this.grid));
        // --- Add all controls to the container ---
        controlsContainer.appendChild(select);
        controlsContainer.appendChild(countInput);
        controlsContainer.appendChild(loadFileLabel);
        controlsContainer.appendChild(loadFileInput);
        // --- Add the container to the page ---
        document.body.insertBefore(controlsContainer, document.body.firstChild);
    }
    // ... (The rest of the App class remains unchanged) ...
    handleScroll() {
        this.grid.scrollX = document.querySelector(".scrollbar-h").scrollLeft;
        this.grid.scrollY = document.querySelector(".scrollbar-v").scrollTop;
        this.grid.drawGrid();
        if (this.inputHandler.isActive()) {
            this.inputHandler.updateInputPosition();
        }
    }
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
// Start the application once the DOM is ready.
window.addEventListener("DOMContentLoaded", () => new App());
