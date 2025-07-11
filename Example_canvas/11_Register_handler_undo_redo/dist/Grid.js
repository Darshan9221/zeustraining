import { GridModel } from "./gridDrawHandlers/GridModel";
import { GridCalculator } from "./gridDrawHandlers/GridCalculator";
import { GridRenderer } from "./gridDrawHandlers/GridRenderer";
/**
 * The main Grid facade class.
 * It orchestrates the GridModel, GridCalculator, and GridRenderer
 * to provide a unified API to the rest of the application.
 */
export class Grid {
    // Pass-through getters for convenience, so handlers don't need to know about the model
    get rows() {
        return this.model.rows;
    }
    get cols() {
        return this.model.cols;
    }
    get headerWidth() {
        return this.model.headerWidth;
    }
    get headerHeight() {
        return this.model.headerHeight;
    }
    get colWidths() {
        return this.model.colWidths;
    }
    get rowHeights() {
        return this.model.rowHeights;
    }
    get scrollX() {
        return this.model.scrollX;
    }
    set scrollX(value) {
        this.model.scrollX = value;
    }
    get scrollY() {
        return this.model.scrollY;
    }
    set scrollY(value) {
        this.model.scrollY = value;
    }
    get viewportStartCol() {
        return this.model.viewportStartCol;
    }
    get viewportEndCol() {
        return this.model.viewportEndCol;
    }
    get viewportStartRow() {
        return this.model.viewportStartRow;
    }
    get viewportEndRow() {
        return this.model.viewportEndRow;
    }
    get selectedRow() {
        return this.model.selectedRow;
    }
    set selectedRow(value) {
        this.model.selectedRow = value;
    }
    get selectedCol() {
        return this.model.selectedCol;
    }
    set selectedCol(value) {
        this.model.selectedCol = value;
    }
    get selectionStartRow() {
        return this.model.selectionStartRow;
    }
    set selectionStartRow(value) {
        this.model.selectionStartRow = value;
    }
    get selectionStartCol() {
        return this.model.selectionStartCol;
    }
    set selectionStartCol(value) {
        this.model.selectionStartCol = value;
    }
    get selectionEndRow() {
        return this.model.selectionEndRow;
    }
    set selectionEndRow(value) {
        this.model.selectionEndRow = value;
    }
    get selectionEndCol() {
        return this.model.selectionEndCol;
    }
    set selectionEndCol(value) {
        this.model.selectionEndCol = value;
    }
    constructor(canvas, rows, cols, defaultCellWidth, defaultCellHeight) {
        this.interactionHandler = null;
        this.needsRedraw = false;
        this.canvas = canvas;
        this.model = new GridModel(rows, cols, defaultCellWidth, defaultCellHeight);
        this.calculator = new GridCalculator(this.model, this.canvas);
        this.renderer = new GridRenderer(this.model, this.calculator, this, this.canvas);
        this.renderLoop();
    }
    // --- Public API ---
    setInteractionHandler(handler) {
        this.interactionHandler = handler;
    }
    isDragging() {
        var _a;
        return ((_a = this.interactionHandler) === null || _a === void 0 ? void 0 : _a.isDragging()) || false;
    }
    setCellValue(row, col, value) {
        this.model.setCellValue(row, col, value);
    }
    getCellValue(row, col) {
        return this.model.getCellValue(row, col);
    }
    clearAllCells() {
        this.model.clearAllCells();
    }
    getColX(col) {
        return this.calculator.getColX(col);
    }
    getRowY(row) {
        return this.calculator.getRowY(row);
    }
    colAtX(x) {
        return this.calculator.colAtX(x);
    }
    rowAtY(y) {
        return this.calculator.rowAtY(y);
    }
    updateScrollbarContentSize() {
        let totalGridWidth = 0;
        for (let i = 1; i < this.model.cols; i++) {
            totalGridWidth += this.model.colWidths[i];
        }
        document.getElementById("hScrollContent").style.width =
            totalGridWidth + "px";
        let totalGridHeight = 0;
        for (let i = 1; i < this.model.rows; i++) {
            totalGridHeight += this.model.rowHeights[i];
        }
        document.getElementById("vScrollContent").style.height =
            totalGridHeight + "px";
    }
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const dpr = this.calculator.getDPR();
        this.canvas.width = (container.clientWidth - 20) * dpr;
        this.canvas.height = (container.clientHeight - 20) * dpr;
        this.canvas.style.width = container.clientWidth - 20 + "px";
        this.canvas.style.height = container.clientHeight - 20 + "px";
        this.canvas.getContext("2d").setTransform(1, 0, 0, 1, 0, 0);
        this.canvas.getContext("2d").scale(dpr, dpr);
        this.updateScrollbarContentSize();
        this.requestRedraw();
    }
    // --- Rendering Loop ---
    renderLoop() {
        requestAnimationFrame(this.renderLoop.bind(this));
        if (this.needsRedraw) {
            this.renderer.drawGrid();
            this.needsRedraw = false;
        }
    }
    requestRedraw() {
        this.needsRedraw = true;
    }
}
