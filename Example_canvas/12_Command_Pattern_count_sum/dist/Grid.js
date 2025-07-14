import { Model } from "./grid/model";
import { Calculator } from "./grid/calculation";
import { Renderer } from "./grid/renderer";
export class Grid {
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
    constructor(canvas, rows, cols, defaultCellW, defaultCellH) {
        this.touchHandler = null;
        this.needsRedraw = false;
        this.canvas = canvas;
        // Create the main parts of the grid system
        this.model = new Model(rows, cols, defaultCellW, defaultCellH);
        this.calculator = new Calculator(this.model, this.canvas);
        this.renderer = new Renderer(this.model, this.calculator, this, this.canvas);
        this.renderLoop();
    }
    setTouchHandler(handler) {
        this.touchHandler = handler;
    }
    isDragging() {
        var _a;
        return ((_a = this.touchHandler) === null || _a === void 0 ? void 0 : _a.isDragging()) || false;
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
    // Pass-through methods to the calculator
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
        // TODO: optimize this, It runs after every resize.
        let totalW = 0;
        for (let i = 1; i < this.model.cols; i++) {
            totalW += this.model.colWidths[i];
        }
        document.getElementById("hScrollContent").style.width = totalW + "px";
        let totalH = 0;
        for (let i = 1; i < this.model.rows; i++) {
            totalH += this.model.rowHeights[i];
        }
        document.getElementById("vScrollContent").style.height = totalH + "px";
    }
    /**
     * Grid behaviour on resizing the canvas
     * @returns {void} nothing
     */
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const dpr = this.calculator.getDPR();
        this.canvas.width = (container.clientWidth - 20) * dpr;
        this.canvas.height = (container.clientHeight - 20) * dpr;
        this.canvas.style.width = container.clientWidth - 20 + "px";
        this.canvas.style.height = container.clientHeight - 20 + "px";
        // Reset the transform and scale for the new DPR
        const ctx = this.canvas.getContext("2d");
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        this.updateScrollbarContentSize();
        this.requestRedraw();
    }
    renderLoop() {
        requestAnimationFrame(this.renderLoop.bind(this));
        if (this.needsRedraw) {
            this.renderer.drawGrid();
            this.needsRedraw = false;
        }
    }
    requestRedraw() {
        this.needsRedraw = true;
        // Update statistics whenever redraw is requested (which happens on selection changes)
        this.calculator.updateSelectionStats();
    }
}
