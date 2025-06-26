/**
 * DataManager Class
 * No changes from the previous step.
 */
class DataManager {
  constructor(totalRows, totalColumns) {
    this.cellData = new Map();
    this.headers = [];
    this.totalRows = totalRows;
    this.totalColumns = totalColumns;
    this.headers = new Array(this.totalColumns);
    for (let i = 0; i < this.totalColumns; i++) {
      this.headers[i] = this.toColumnName(i + 1);
    }
  }
  toColumnName(num) {
    let columnName = "";
    while (num > 0) {
      let remainder = (num - 1) % 26;
      columnName = String.fromCharCode(65 + remainder) + columnName;
      num = Math.floor((num - 1) / 26);
    }
    return columnName;
  }
  loadData(jsonData) {
    if (!jsonData || jsonData.length === 0) return;
    const dataHeaders = Object.keys(jsonData[0]);
    for (let i = 0; i < dataHeaders.length && i < this.totalColumns; i++) {
      this.headers[i] = dataHeaders[i];
    }
    const dataRows = jsonData.length;
    const dataCols = dataHeaders.length;
    for (let r = 0; r < dataRows && r < this.totalRows; r++) {
      for (let c = 0; c < dataCols && c < this.totalColumns; c++) {
        const key = `${r},${c}`;
        const header = dataHeaders[c];
        this.cellData.set(key, jsonData[r][header]);
      }
    }
  }
  getCellData(row, col) {
    const key = `${row},${col}`;
    return this.cellData.get(key);
  }
  setCellData(row, col, value) {
    if (row < 0) return;
    const key = `${row},${col}`;
    this.cellData.set(key, value);
  }
}

/**
 * Renderer Class
 * Updated to draw interactive scrollbars.
 */
class Renderer {
  constructor(ctx, selectionManager) {
    this.ctx = ctx;
    this.selectionManager = selectionManager;
  }

  draw(grid) {
    this.ctx.clearRect(0, 0, grid.canvas.width, grid.canvas.height);
    this.ctx.font = "14px Arial";
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = "#e0e0e0";

    const totalRows = grid.totalRows;
    const totalColumns = grid.totalColumns;
    const startRow = Math.max(
      0,
      Math.floor(grid.scrollTop / grid.defaultRowHeight)
    );
    const endRow = Math.min(
      totalRows,
      startRow + Math.ceil(grid.canvas.height / grid.defaultRowHeight) + 1
    );
    const startCol = Math.max(
      0,
      Math.floor(grid.scrollLeft / grid.defaultColWidth)
    );
    const endCol = Math.min(
      totalColumns,
      startCol + Math.ceil(grid.canvas.width / grid.defaultColWidth) + 1
    );

    this.drawCells(grid, startRow, endRow, startCol, endCol);
    this.drawHeaders(grid, startCol, endCol, startRow, endRow);
    this.drawSelection(grid);

    // --- NEW ---
    // Draw the scrollbars on top of everything else.
    this.drawScrollbars(grid);
  }

  drawCells(grid, startRow, endRow, startCol, endCol) {
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "middle";
    this.ctx.fillStyle = "#333";
    const yOffset = grid.defaultRowHeight; // Account for header row
    const xOffset = grid.defaultColWidth; // Account for row number column

    for (let r = startRow; r < endRow; r++) {
      for (let c = startCol; c < endCol; c++) {
        const y = yOffset + r * grid.defaultRowHeight - grid.scrollTop;
        const x = xOffset + c * grid.defaultColWidth - grid.scrollLeft;

        this.ctx.strokeRect(x, y, grid.defaultColWidth, grid.defaultRowHeight);

        const cellValue = grid.dataManager.getCellData(r, c) || "";
        this.ctx.fillText(cellValue, x + 5, y + grid.defaultRowHeight / 2);
      }
    }
  }

  drawHeaders(grid, startCol, endCol, startRow, endRow) {
    this.ctx.fillStyle = "#f8f9fa";
    this.ctx.textAlign = "center";
    const yOffset = grid.defaultRowHeight;
    const xOffset = grid.defaultColWidth;

    // Draw Column Headers
    for (let c = startCol; c < endCol; c++) {
      const x = xOffset + c * grid.defaultColWidth - grid.scrollLeft;
      this.ctx.fillRect(x, 0, grid.defaultColWidth, grid.defaultRowHeight);
      this.ctx.strokeRect(x, 0, grid.defaultColWidth, grid.defaultRowHeight);
      this.ctx.fillStyle = "#333";
      this.ctx.fillText(
        grid.dataManager.headers[c],
        x + grid.defaultColWidth / 2,
        yOffset / 2
      );
      this.ctx.fillStyle = "#f8f9fa";
    }

    // Draw Row Headers
    for (let r = startRow; r < endRow; r++) {
      const y = yOffset + r * grid.defaultRowHeight - grid.scrollTop;
      this.ctx.fillRect(0, y, grid.defaultColWidth, grid.defaultRowHeight);
      this.ctx.strokeRect(0, y, grid.defaultColWidth, grid.defaultRowHeight);
      this.ctx.fillStyle = "#333";
      this.ctx.fillText(r + 1, xOffset / 2, y + grid.defaultRowHeight / 2);
      this.ctx.fillStyle = "#f8f9fa";
    }

    // Draw top-left corner box
    this.ctx.fillRect(0, 0, xOffset, yOffset);
    this.ctx.strokeRect(0, 0, xOffset, yOffset);
  }

  drawSelection(grid) {
    const activeCell = this.selectionManager.getActiveCell();
    if (activeCell && activeCell.row !== null) {
      const { row, col } = activeCell;

      const x =
        grid.defaultColWidth + col * grid.defaultColWidth - grid.scrollLeft;
      const y =
        grid.defaultRowHeight + row * grid.defaultRowHeight - grid.scrollTop;

      this.ctx.strokeStyle = "#007bff";
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(
        x - 1,
        y - 1,
        grid.defaultColWidth + 2,
        grid.defaultRowHeight + 2
      );

      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = "#e0e0e0";
    }
  }

  // --- NEW ---
  /**
   * Draws the vertical and horizontal scrollbars.
   * @param {Grid} grid - The main grid instance.
   */
  drawScrollbars(grid) {
    const { canvas, scrollbarWidth } = grid;
    const viewableWidth = canvas.width - grid.defaultColWidth - scrollbarWidth;
    const viewableHeight =
      canvas.height - grid.defaultRowHeight - scrollbarWidth;

    // --- Vertical Scrollbar ---
    if (grid.maxScrollTop > 0) {
      // Track
      this.ctx.fillStyle = "#f1f1f1";
      this.ctx.fillRect(
        canvas.width - scrollbarWidth,
        grid.defaultRowHeight,
        scrollbarWidth,
        viewableHeight
      );

      // Thumb
      const thumbHeight = Math.max(
        20,
        viewableHeight *
          (viewableHeight / (grid.totalRows * grid.defaultRowHeight))
      );
      const thumbY =
        grid.defaultRowHeight +
        (grid.scrollTop / grid.maxScrollTop) * (viewableHeight - thumbHeight);
      this.ctx.fillStyle = "#c1c1c1";
      this.ctx.fillRect(
        canvas.width - scrollbarWidth,
        thumbY,
        scrollbarWidth,
        thumbHeight
      );
    }

    // --- Horizontal Scrollbar ---
    if (grid.maxScrollLeft > 0) {
      // Track
      this.ctx.fillStyle = "#f1f1f1";
      this.ctx.fillRect(
        grid.defaultColWidth,
        canvas.height - scrollbarWidth,
        viewableWidth,
        scrollbarWidth
      );

      // Thumb
      const thumbWidth = Math.max(
        20,
        viewableWidth *
          (viewableWidth / (grid.totalColumns * grid.defaultColWidth))
      );
      const thumbX =
        grid.defaultColWidth +
        (grid.scrollLeft / grid.maxScrollLeft) * (viewableWidth - thumbWidth);
      this.ctx.fillStyle = "#c1c1c1";
      this.ctx.fillRect(
        thumbX,
        canvas.height - scrollbarWidth,
        thumbWidth,
        scrollbarWidth
      );
    }
  }
}

/**
 * SelectionManager Class
 * No changes needed in this class.
 */
class SelectionManager {
  constructor() {
    this.activeCell = { row: null, col: null };
  }
  selectCell(row, col) {
    this.activeCell = { row, col };
  }
  getActiveCell() {
    return this.activeCell;
  }
  clearSelection() {
    this.activeCell = { row: null, col: null };
  }
}

/**
 * CellEditor Class
 * Modified to accept an initial value and to move selection on commit.
 */
class CellEditor {
  constructor(container, grid) {
    this.container = container;
    this.grid = grid;
    this.editorInput = null;
    this.editingCell = null;
  }

  /**
   * Begins the editing process for a specified cell.
   * @param {number} row - The row index of the cell to edit.
   * @param {number} col - The column index of the cell to edit.
   * @param {string} [initialValue] - An optional value to start the editor with.
   */
  startEditing(row, col, initialValue) {
    // --- MODIFIED ---
    if (this.editingCell) {
      this.commitEdit();
    }

    this.editingCell = { row, col };
    const x =
      this.grid.defaultColWidth +
      col * this.grid.defaultColWidth -
      this.grid.scrollLeft;
    const y =
      this.grid.defaultRowHeight +
      row * this.grid.defaultRowHeight -
      this.grid.scrollTop;
    const width = this.grid.defaultColWidth;
    const height = this.grid.defaultRowHeight;

    this.editorInput = document.createElement("input");
    this.editorInput.type = "text";
    this.editorInput.className = "cell-editor";
    this.editorInput.style.left = `${x}px`;
    this.editorInput.style.top = `${y}px`;
    this.editorInput.style.width = `${width}px`;
    this.editorInput.style.height = `${height}px`;

    // --- MODIFIED ---
    // If an initial value is provided (e.g., from typing a character), use it.
    // Otherwise, use the cell's current data.
    if (initialValue !== undefined) {
      this.editorInput.value = initialValue;
    } else {
      this.editorInput.value =
        this.grid.dataManager.getCellData(row, col) || "";
    }

    this.editorInput.addEventListener("blur", () => this.commitEdit());
    this.editorInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.commitEdit(true); // Pass true to move selection down
      } else if (e.key === "Escape") {
        this.cancelEdit();
      }
    });

    this.container.appendChild(this.editorInput);
    this.editorInput.focus();
    // If starting with an initial value, place cursor at the end. Otherwise, select all.
    if (initialValue !== undefined) {
      this.editorInput.selectionStart = this.editorInput.selectionEnd =
        this.editorInput.value.length;
    } else {
      this.editorInput.select();
    }
  }

  /**
   * Commits the edited value and optionally moves the selection.
   * @param {boolean} [moveNext=false] - If true, moves selection to the cell below.
   */
  commitEdit(moveNext = false) {
    // --- MODIFIED ---
    if (!this.editorInput || !this.editingCell) return;
    const { row, col } = this.editingCell;
    const newValue = this.editorInput.value;
    this.grid.dataManager.setCellData(row, col, newValue);
    this.removeEditor();

    // --- MODIFIED ---
    // Standard spreadsheet behavior: move to the next cell after pressing Enter.
    if (moveNext) {
      const nextRow = Math.min(row + 1, this.grid.totalRows - 1);
      this.grid.selectionManager.selectCell(nextRow, col);
      this.grid.ensureCellIsVisible(nextRow, col);
    }

    this.grid.draw();
  }

  cancelEdit() {
    this.removeEditor();
    this.grid.draw();
  }
  removeEditor() {
    if (this.editorInput) {
      this.editorInput.remove();
      this.editorInput = null;
      this.editingCell = null;
    }
  }
}

/**
 * InputHandler Class
 * Heavily modified to handle keyboard navigation, new edit triggers, and scrollbar dragging.
 */
class InputHandler {
  constructor(canvas, grid) {
    this.canvas = canvas;
    this.grid = grid;

    this.handleClick = this.handleClick.bind(this);
    this.handleDoubleClick = this.handleDoubleClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this); // --- NEW ---
    this.handleMouseDown = this.handleMouseDown.bind(this); // --- NEW ---
    this.handleMouseMove = this.handleMouseMove.bind(this); // --- NEW ---
    this.handleMouseUp = this.handleMouseUp.bind(this); // --- NEW ---

    this.canvas.addEventListener("click", this.handleClick);
    this.canvas.addEventListener("dblclick", this.handleDoubleClick);
    this.canvas.addEventListener("keydown", this.handleKeyDown); // --- NEW ---
    this.canvas.addEventListener("mousedown", this.handleMouseDown); // --- NEW ---

    // Listen for mouse move/up on the window to handle dragging outside the canvas
    window.addEventListener("mousemove", this.handleMouseMove); // --- NEW ---
    window.addEventListener("mouseup", this.handleMouseUp); // --- NEW ---
  }

  // --- NEW ---
  /**
   * Handles keyboard input for navigation and editing.
   * @param {KeyboardEvent} e - The keyboard event.
   */
  handleKeyDown(e) {
    const grid = this.grid;
    const selection = grid.selectionManager;
    const activeCell = selection.getActiveCell();
    if (activeCell.row === null) return; // Do nothing if no cell is selected

    // If currently editing, let the CellEditor handle the event.
    if (grid.cellEditor.editingCell) {
      return;
    }

    let { row, col } = activeCell;

    switch (e.key) {
      case "ArrowUp":
        row = Math.max(0, row - 1);
        break;
      case "ArrowDown":
        row = Math.min(grid.totalRows - 1, row + 1);
        break;
      case "ArrowLeft":
        col = Math.max(0, col - 1);
        break;
      case "ArrowRight":
        col = Math.min(grid.totalColumns - 1, col - 1);
        break;
      case "Tab":
        e.preventDefault(); // Prevent focus from leaving the canvas
        if (e.shiftKey) {
          col = Math.max(0, col - 1);
        } else {
          col = Math.min(grid.totalColumns - 1, col + 1);
        }
        break;
      case "Enter":
      case "F2":
        e.preventDefault();
        grid.cellEditor.startEditing(row, col);
        return; // Stop further processing
      default:
        // If a printable character is typed, start editing with that character.
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          grid.cellEditor.startEditing(row, col, e.key);
        }
        return; // Stop further processing
    }

    selection.selectCell(row, col);
    grid.ensureCellIsVisible(row, col);
    grid.draw();
  }

  // --- NEW ---
  /**
   * Handles mouse down events, primarily for initiating scrollbar dragging.
   * @param {MouseEvent} e - The mouse event.
   */
  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check for vertical scrollbar click
    if (mouseX > this.canvas.width - this.grid.scrollbarWidth) {
      this.grid.isDraggingVerticalScroll = true;
      this.grid.dragStartPos = { y: mouseY, scrollTop: this.grid.scrollTop };
    }
    // Check for horizontal scrollbar click
    else if (mouseY > this.canvas.height - this.grid.scrollbarWidth) {
      this.grid.isDraggingHorizontalScroll = true;
      this.grid.dragStartPos = { x: mouseX, scrollLeft: this.grid.scrollLeft };
    }
  }

  // --- NEW ---
  /**
   * Handles mouse move events, for dragging scrollbars.
   * @param {MouseEvent} e - The mouse event.
   */
  handleMouseMove(e) {
    const grid = this.grid;
    if (!grid.isDraggingVerticalScroll && !grid.isDraggingHorizontalScroll)
      return;

    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (grid.isDraggingVerticalScroll) {
      const dy = mouseY - grid.dragStartPos.y;
      const viewableHeight =
        grid.canvas.height - grid.defaultRowHeight - grid.scrollbarWidth;
      const scrollableRatio =
        grid.maxScrollTop /
        (viewableHeight -
          Math.max(
            20,
            viewableHeight *
              (viewableHeight / (grid.totalRows * grid.defaultRowHeight))
          ));
      grid.setScrollTop(grid.dragStartPos.scrollTop + dy * scrollableRatio);
    }

    if (grid.isDraggingHorizontalScroll) {
      const dx = mouseX - grid.dragStartPos.x;
      const viewableWidth =
        grid.canvas.width - grid.defaultColWidth - grid.scrollbarWidth;
      const scrollableRatio =
        grid.maxScrollLeft /
        (viewableWidth -
          Math.max(
            20,
            viewableWidth *
              (viewableWidth / (grid.totalColumns * grid.defaultColWidth))
          ));
      grid.setScrollLeft(grid.dragStartPos.scrollLeft + dx * scrollableRatio);
    }

    grid.draw();
  }

  // --- NEW ---
  /**
   * Handles mouse up events to end scrollbar dragging.
   */
  handleMouseUp() {
    this.grid.isDraggingVerticalScroll = false;
    this.grid.isDraggingHorizontalScroll = false;
  }

  handleClick(event) {
    const { row, col } = this.getCoordsFromEvent(event);
    if (row === null) return;
    this.grid.cellEditor.commitEdit();
    this.grid.selectionManager.selectCell(row, col);
    this.grid.draw();
  }

  handleDoubleClick(event) {
    const { row, col } = this.getCoordsFromEvent(event);
    if (row === null) return;
    this.grid.cellEditor.startEditing(row, col);
  }

  getCoordsFromEvent(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (x < this.grid.defaultColWidth || y < this.grid.defaultRowHeight) {
      return { row: null, col: null };
    }

    const col = Math.floor(
      (x + this.grid.scrollLeft - this.grid.defaultColWidth) /
        this.grid.defaultColWidth
    );
    const row = Math.floor(
      (y + this.grid.scrollTop - this.grid.defaultRowHeight) /
        this.grid.defaultRowHeight
    );

    if (
      row >= 0 &&
      col >= 0 &&
      row < this.grid.totalRows &&
      col < this.grid.totalColumns
    ) {
      return { row, col };
    }
    return { row: null, col: null };
  }
}

/**
 * Grid Class
 * Modified to manage scrollbar state and provide helper methods.
 */
class Grid {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    this.container = this.canvas.parentElement;
    this.ctx = this.canvas.getContext("2d");

    this.totalRows = options.totalRows || 1000;
    this.totalColumns = options.totalColumns || 100;

    this.defaultColWidth = 150;
    this.defaultRowHeight = 30;
    this.scrollTop = 0;
    this.scrollLeft = 0;

    /** @type {number} The width of the scrollbar. */ // --- NEW ---
    this.scrollbarWidth = 14;
    /** @type {boolean} Flag for dragging the vertical scrollbar. */ // --- NEW ---
    this.isDraggingVerticalScroll = false;
    /** @type {boolean} Flag for dragging the horizontal scrollbar. */ // --- NEW ---
    this.isDraggingHorizontalScroll = false;
    /** @type {object|null} Stores starting position for a drag operation. */ // --- NEW ---
    this.dragStartPos = null;

    this.dataManager = new DataManager(this.totalRows, this.totalColumns);
    this.selectionManager = new SelectionManager();
    this.renderer = new Renderer(this.ctx, this.selectionManager);
    this.cellEditor = new CellEditor(this.container, this);
    this.inputHandler = new InputHandler(this.canvas, this);

    this.init();
  }

  /**
   * @type {number} Maximum vertical scroll value.
   */
  get maxScrollTop() {
    return Math.max(
      0,
      this.totalRows * this.defaultRowHeight -
        (this.canvas.height - this.defaultRowHeight - this.scrollbarWidth)
    );
  }

  /**
   * @type {number} Maximum horizontal scroll value.
   */
  get maxScrollLeft() {
    return Math.max(
      0,
      this.totalColumns * this.defaultColWidth -
        (this.canvas.width - this.defaultColWidth - this.scrollbarWidth)
    );
  }

  init() {
    this.canvas.width = this.container.clientWidth;
    this.canvas.height = this.container.clientHeight;
    this.canvas.addEventListener("wheel", this.handleWheel.bind(this), {
      passive: false,
    });
    this.draw();
  }

  handleWheel(e) {
    e.preventDefault();
    this.setScrollLeft(this.scrollLeft + e.deltaX);
    this.setScrollTop(this.scrollTop + e.deltaY);
    if (this.cellEditor.editingCell) {
      this.cellEditor.commitEdit();
    }
    this.draw();
  }

  /** Sets the vertical scroll position and clamps it. */ // --- NEW ---
  setScrollTop(value) {
    this.scrollTop = Math.max(0, Math.min(value, this.maxScrollTop));
  }

  /** Sets the horizontal scroll position and clamps it. */ // --- NEW ---
  setScrollLeft(value) {
    this.scrollLeft = Math.max(0, Math.min(value, this.maxScrollLeft));
  }

  /**
   * Ensures a given cell is visible in the viewport, scrolling if necessary.
   * @param {number} row - The row index of the cell.
   * @param {number} col - The column index of the cell.
   */
  ensureCellIsVisible(row, col) {
    // --- NEW ---
    const cellTop = row * this.defaultRowHeight;
    const cellBottom = cellTop + this.defaultRowHeight;
    const viewTop = this.scrollTop;
    const viewBottom =
      this.scrollTop +
      this.canvas.height -
      this.defaultRowHeight -
      this.scrollbarWidth;

    if (cellTop < viewTop) {
      this.setScrollTop(cellTop);
    } else if (cellBottom > viewBottom) {
      this.setScrollTop(
        cellBottom -
          (this.canvas.height - this.defaultRowHeight - this.scrollbarWidth)
      );
    }

    const cellLeft = col * this.defaultColWidth;
    const cellRight = cellLeft + this.defaultColWidth;
    const viewLeft = this.scrollLeft;
    const viewRight =
      this.scrollLeft +
      this.canvas.width -
      this.defaultColWidth -
      this.scrollbarWidth;

    if (cellLeft < viewLeft) {
      this.setScrollLeft(cellLeft);
    } else if (cellRight > viewRight) {
      this.setScrollLeft(
        cellRight -
          (this.canvas.width - this.defaultColWidth - this.scrollbarWidth)
      );
    }
  }

  loadData(jsonData) {
    this.dataManager.loadData(jsonData);
    this.draw();
  }

  draw() {
    this.renderer.draw(this);
  }
}

// --- Main Application Entry Point ---
function generateFakeData(count) {
  const data = [];
  const firstNames = [
    "Raj",
    "Sonia",
    "Amit",
    "Priya",
    "Vikram",
    "Neha",
    "Arun",
    "Deepika",
  ];
  const lastNames = [
    "Solanki",
    "Gupta",
    "Sharma",
    "Patel",
    "Kumar",
    "Singh",
    "Reddy",
    "Jain",
  ];
  for (let i = 1; i <= count; i++) {
    data.push({
      ID: i,
      FirstName: firstNames[Math.floor(Math.random() * firstNames.length)],
      LastName: lastNames[Math.floor(Math.random() * lastNames.length)],
      Age: Math.floor(Math.random() * 40) + 20,
      Salary: Math.floor(Math.random() * 1500000) + 500000,
    });
  }
  return data;
}

window.addEventListener("DOMContentLoaded", () => {
  console.log("Creating grid with 100,000 rows and 500 columns...");
  const excelGrid = new Grid("grid-canvas", {
    totalRows: 100000,
    totalColumns: 500,
  });

  console.log("Generating 50,000 records of data...");
  const jsonData = generateFakeData(50000);
  console.log("Loading data into the grid...");
  excelGrid.loadData(jsonData);
  console.log(
    "Grid is ready. Click on the grid to focus, then use arrow keys to navigate."
  );
});
