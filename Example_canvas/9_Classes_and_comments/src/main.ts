// src/main.ts
import { Grid } from "./Grid";
import { ResizeHandler } from "./ResizeHandler";
import { InputHandler } from "./InputHandler";
import { DataManager } from "./DataManager";

class App {
  private grid: Grid;
  private resizeHandler: ResizeHandler;
  private inputHandler: InputHandler;

  constructor() {
    const canvas = document.getElementById("gridCanvas") as HTMLCanvasElement;
    const rows = 100000;
    const cols = 500;
    const cellWidth = 64;
    const cellHeight = 20;

    this.grid = new Grid(canvas, rows, cols, cellWidth, cellHeight);
    this.resizeHandler = new ResizeHandler(this.grid, canvas);
    this.inputHandler = new InputHandler(this.grid);

    this.setupEventListeners();
    this.setupUI();

    // *** FIX: Call resizeCanvas() here to set initial size and trigger the first render. ***
    this.grid.resizeCanvas();
  }

  private setupEventListeners(): void {
    const hScrollbar = document.querySelector(".scrollbar-h")!;
    const vScrollbar = document.querySelector(".scrollbar-v")!;
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
    loadFileInput.addEventListener("change", (e) =>
      DataManager.handleFileLoad(e, this.grid)
    );

    controlsContainer.appendChild(generateBtn);
    controlsContainer.appendChild(countInput);
    controlsContainer.appendChild(loadFileLabel);
    controlsContainer.appendChild(loadFileInput);
    document.body.insertBefore(controlsContainer, document.body.firstChild);
  }

  private handleScroll(): void {
    this.grid.scrollX = document.querySelector(".scrollbar-h")!.scrollLeft;
    this.grid.scrollY = document.querySelector(".scrollbar-v")!.scrollTop;
    this.grid.requestRedraw();
    if (this.inputHandler.isActive()) {
      this.inputHandler.updateInputPosition();
    }
  }

  private handleWheel(e: WheelEvent): void {
    e.preventDefault();
    const hScrollbar = document.querySelector(".scrollbar-h")!;
    const vScrollbar = document.querySelector(".scrollbar-v")!;
    const rowscrollAmount = 20;
    const colscrollAmount = 100;
    if (e.shiftKey) {
      hScrollbar.scrollLeft += Math.sign(e.deltaY) * colscrollAmount;
    } else {
      vScrollbar.scrollTop += Math.sign(e.deltaY) * rowscrollAmount;
    }
  }

  private handleCanvasClick(e: MouseEvent): void {
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
        this.grid.requestRedraw();
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
        this.grid.requestRedraw();
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
      document.getElementById("selectedInfo")!.textContent = `R${row}, C${col}`;
      this.grid.requestRedraw();
      this.inputHandler.showInputBox(row, col);
    }
  }

  private handleKeydown(e: KeyboardEvent): void {
    if (this.inputHandler.isActive()) return;
    if (this.grid.selectedRow === null || this.grid.selectedCol === null)
      return;
    let nextRow = this.grid.selectedRow;
    let nextCol = this.grid.selectedCol;
    let navigate = false;
    switch (e.key) {
      case "ArrowDown":
        nextRow = Math.min(this.grid.rows - 1, this.grid.selectedRow);
        navigate = true;
        break;
      case "ArrowUp":
        nextRow = Math.max(1, this.grid.selectedRow);
        navigate = true;
        break;
      case "ArrowLeft":
        nextCol = Math.max(1, this.grid.selectedCol);
        navigate = true;
        break;
      case "ArrowRight":
        nextCol = Math.min(this.grid.cols - 1, this.grid.selectedCol);
        navigate = true;
        break;
      case "Enter":
      case "F2":
        this.inputHandler.showInputBox(
          this.grid.selectedRow,
          this.grid.selectedCol
        );
        return;
    }
    if (navigate) {
      e.preventDefault();
      this.grid.selectedRow = nextRow;
      this.grid.selectedCol = nextCol;
      document.getElementById(
        "selectedInfo"
      )!.textContent = `R${nextRow}, C${nextCol}`;
      this.inputHandler.ensureCellVisible(nextRow, nextCol);
      this.grid.requestRedraw();
    }
  }
}

window.addEventListener("DOMContentLoaded", () => new App());
