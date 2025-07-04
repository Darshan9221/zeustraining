// src/Grid.ts
/**
 * Manages the core state and rendering of the spreadsheet grid.
 * Handles drawing, viewport calculation, scrolling, data, and selection.
 */
export class Grid {
    constructor(canvas, rows, cols, defaultCellWidth, defaultCellHeight) {
        this.cellData = new Map();
        this.scrollX = 0;
        this.scrollY = 0;
        this.viewportStartRow = 0;
        this.viewportEndRow = 0;
        this.viewportStartCol = 0;
        this.viewportEndCol = 0;
        this.selectedRow = null;
        this.selectedCol = null;
        this.selectionStartRow = null;
        this.selectionStartCol = null;
        this.selectionEndRow = null;
        this.selectionEndCol = null;
        this.highlightedRowHeader = null;
        this.highlightedColHeader = null;
        /** @type {boolean} A flag to indicate if a redraw is required on the next frame. */
        this.needsRedraw = false;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.rows = rows;
        this.cols = cols;
        this.headerWidth = defaultCellWidth;
        this.headerHeight = defaultCellHeight;
        this.colWidths = Array(cols).fill(defaultCellWidth);
        this.rowHeights = Array(rows).fill(defaultCellHeight);
        // Start the render loop.
        this.renderLoop();
    }
    getDPR() {
        return window.devicePixelRatio || 1;
    }
    updateScrollbarContentSize() {
        let totalGridWidth = 0;
        for (let i = 1; i < this.cols; i++) {
            totalGridWidth += this.colWidths[i];
        }
        document.getElementById("hScrollContent").style.width =
            totalGridWidth + "px";
        let totalGridHeight = 0;
        for (let i = 1; i < this.rows; i++) {
            totalGridHeight += this.rowHeights[i];
        }
        document.getElementById("vScrollContent").style.height =
            totalGridHeight + "px";
    }
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const dpr = this.getDPR();
        this.canvas.width = (container.clientWidth - 20) * dpr;
        this.canvas.height = (container.clientHeight - 20) * dpr;
        this.canvas.style.width = container.clientWidth - 20 + "px";
        this.canvas.style.height = container.clientHeight - 20 + "px";
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);
        this.updateScrollbarContentSize();
        this.requestRedraw();
    }
    setCellValue(row, col, value) {
        const key = `${row},${col}`;
        if (value === "" || value === null || value === undefined) {
            this.cellData.delete(key);
        }
        else {
            this.cellData.set(key, value);
        }
    }
    getCellValue(row, col) {
        return this.cellData.get(`${row},${col}`) || "";
    }
    clearAllCells() {
        this.cellData.clear();
    }
    calculateViewport() {
        let accY = 0;
        this.viewportStartRow = 1;
        for (let r = 1; r < this.rows; r++) {
            if (accY >= this.scrollY) {
                this.viewportStartRow = r;
                break;
            }
            accY += this.rowHeights[r];
        }
        const visibleH = this.canvas.height / this.getDPR() - this.headerHeight;
        let sumY = 0;
        this.viewportEndRow = this.viewportStartRow;
        for (let r = this.viewportStartRow; r < this.rows; r++) {
            if (r >= this.rowHeights.length)
                break;
            sumY += this.rowHeights[r];
            if (sumY > visibleH)
                break;
            this.viewportEndRow = r;
        }
        let accX = 0;
        this.viewportStartCol = 1;
        for (let c = 1; c < this.cols; c++) {
            if (accX >= this.scrollX) {
                this.viewportStartCol = c;
                break;
            }
            accX += this.colWidths[c];
        }
        const visibleW = this.canvas.width / this.getDPR() - this.headerWidth;
        let sumX = 0;
        this.viewportEndCol = this.viewportStartCol;
        for (let c = this.viewportStartCol; c < this.cols; c++) {
            if (c >= this.colWidths.length)
                break;
            sumX += this.colWidths[c];
            if (sumX > visibleW)
                break;
            this.viewportEndCol = c;
        }
        document.getElementById("visibleInfo").textContent = `${this.viewportStartRow}-${this.viewportEndRow}, ${this.viewportStartCol}-${this.viewportEndCol}`;
    }
    colToExcelLabel(col) {
        let label = "";
        col++;
        while (col > 0) {
            let rem = (col - 1) % 26;
            label = String.fromCharCode(65 + rem) + label;
            col = Math.floor((col - 1) / 26);
        }
        return label;
    }
    getColX(col) {
        let x = this.headerWidth;
        for (let c = 1; c < col; c++)
            x += this.colWidths[c];
        return x;
    }
    getRowY(row) {
        let y = this.headerHeight;
        for (let r = 1; r < row; r++)
            y += this.rowHeights[r];
        return y;
    }
    colAtX(x) {
        let px = this.headerWidth;
        for (let c = 1; c < this.cols; c++) {
            if (x < px + this.colWidths[c])
                return c;
            px += this.colWidths[c];
        }
        return null;
    }
    rowAtY(y) {
        let py = this.headerHeight;
        for (let r = 1; r < this.rows; r++) {
            if (y < py + this.rowHeights[r])
                return r;
            py += this.rowHeights[r];
        }
        return null;
    }
    renderLoop() {
        requestAnimationFrame(this.renderLoop.bind(this));
        if (this.needsRedraw) {
            this.drawGrid();
            this.needsRedraw = false;
        }
    }
    requestRedraw() {
        this.needsRedraw = true;
    }
    drawGrid() {
        this.calculateViewport();
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = "#f5f5f5";
        ctx.fillRect(0, 0, this.canvas.width, this.headerHeight);
        ctx.fillRect(0, 0, this.headerWidth, this.canvas.height);
        const hasSelection = this.selectionStartRow !== null;
        const minRow = hasSelection
            ? Math.min(this.selectionStartRow, this.selectionEndRow)
            : -1;
        const maxRow = hasSelection
            ? Math.max(this.selectionStartRow, this.selectionEndRow)
            : -1;
        const minCol = hasSelection
            ? Math.min(this.selectionStartCol, this.selectionEndCol)
            : -1;
        const maxCol = hasSelection
            ? Math.max(this.selectionStartCol, this.selectionEndCol)
            : -1;
        // Draw header highlights from selection range (only for visible headers)
        if (hasSelection) {
            ctx.fillStyle = "#a0d8b9";
            for (let r = Math.max(minRow, this.viewportStartRow); r <= Math.min(maxRow, this.viewportEndRow); r++) {
                const screenY = this.getRowY(r) - this.scrollY;
                ctx.fillRect(0, screenY, this.headerWidth, this.rowHeights[r]);
            }
            for (let c = Math.max(minCol, this.viewportStartCol); c <= Math.min(maxCol, this.viewportEndCol); c++) {
                const screenX = this.getColX(c) - this.scrollX;
                ctx.fillRect(screenX, 0, this.colWidths[c], this.headerHeight);
            }
        }
        // Draw selection range fill
        if (hasSelection) {
            const selectionX = this.getColX(minCol) - this.scrollX;
            const selectionY = this.getRowY(minRow) - this.scrollY;
            const selectionEndGutterX = this.getColX(maxCol + 1) - this.scrollX;
            const selectionEndGutterY = this.getRowY(maxRow + 1) - this.scrollY;
            const selectionWidth = selectionEndGutterX - selectionX;
            const selectionHeight = selectionEndGutterY - selectionY;
            ctx.fillStyle = "#e8f2ec";
            ctx.fillRect(selectionX, selectionY, selectionWidth, selectionHeight);
            if (this.selectedRow !== null && this.selectedCol !== null) {
                ctx.fillStyle = "#ffffff";
                const activeCellX = this.getColX(this.selectedCol) - this.scrollX;
                const activeCellY = this.getRowY(this.selectedRow) - this.scrollY;
                ctx.fillRect(activeCellX, activeCellY, this.colWidths[this.selectedCol], this.rowHeights[this.selectedRow]);
            }
        }
        // Draw grid lines
        ctx.beginPath();
        ctx.strokeStyle = "#ddd";
        for (let c = this.viewportStartCol; c <= this.viewportEndCol + 1; c++) {
            const x = this.getColX(c) - this.scrollX;
            ctx.moveTo(x + 0.5, 0);
            ctx.lineTo(x + 0.5, this.canvas.height);
        }
        for (let r = this.viewportStartRow; r <= this.viewportEndRow + 1; r++) {
            const y = this.getRowY(r) - this.scrollY;
            ctx.moveTo(0, y + 0.5);
            ctx.lineTo(this.canvas.width, y + 0.5);
        }
        ctx.stroke();
        // Draw active cell border on top of everything
        if (this.selectedRow !== null && this.selectedCol !== null) {
            ctx.strokeStyle = "#107c41";
            ctx.lineWidth = 2;
            const activeCellX = this.getColX(this.selectedCol) - this.scrollX;
            const activeCellY = this.getRowY(this.selectedRow) - this.scrollY;
            ctx.strokeRect(activeCellX + 1, activeCellY + 1, this.colWidths[this.selectedCol] - 2, this.rowHeights[this.selectedRow] - 2);
            ctx.lineWidth = 1;
        }
        // Draw cell data
        ctx.font = "14px Arial";
        ctx.fillStyle = "#333";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (let r = this.viewportStartRow; r <= this.viewportEndRow; r++) {
            for (let c = this.viewportStartCol; c <= this.viewportEndCol; c++) {
                const value = this.getCellValue(r, c);
                if (value) {
                    const screenX = this.getColX(c) - this.scrollX;
                    const screenY = this.getRowY(r) - this.scrollY;
                    ctx.fillText(value, screenX + this.colWidths[c] / 2, screenY + this.rowHeights[r] / 2);
                }
            }
        }
        // Draw header text
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        for (let r = this.viewportStartRow; r <= this.viewportEndRow; r++) {
            const screenY = this.getRowY(r) - this.scrollY;
            const isRowInRange = hasSelection && r >= minRow && r <= maxRow;
            ctx.fillStyle = isRowInRange ? "#0f703b" : "#666";
            ctx.fillText(r.toString(), this.headerWidth / 2, screenY + this.rowHeights[r] / 2);
        }
        for (let c = this.viewportStartCol; c <= this.viewportEndCol; c++) {
            const screenX = this.getColX(c) - this.scrollX;
            const isColInRange = hasSelection && c >= minCol && c <= maxCol;
            ctx.fillStyle = isColInRange ? "#0f703b" : "#666";
            ctx.fillText(this.colToExcelLabel(c - 1), screenX + this.colWidths[c] / 2, this.headerHeight / 2);
        }
        // Draw top-left corner and its borders
        ctx.fillStyle = "#f5f5f5";
        ctx.fillRect(0, 0, this.headerWidth, this.headerHeight);
        ctx.beginPath();
        ctx.strokeStyle = "#ddd";
        ctx.moveTo(this.headerWidth + 0.5, 0);
        ctx.lineTo(this.headerWidth + 0.5, this.canvas.height);
        ctx.moveTo(0, this.headerHeight + 0.5);
        ctx.lineTo(this.canvas.width, this.headerHeight + 0.5);
        ctx.stroke();
        // Re-draw header borders for the entire visible selection range
        if (hasSelection) {
            ctx.beginPath();
            ctx.strokeStyle = "#107c41";
            ctx.lineWidth = 1;
            // Bottom border for all selected and visible column headers
            for (let c = Math.max(minCol, this.viewportStartCol); c <= Math.min(maxCol, this.viewportEndCol); c++) {
                const x = this.getColX(c) - this.scrollX;
                const w = this.colWidths[c];
                const y = this.headerHeight - 0.5;
                ctx.moveTo(x, y);
                ctx.lineTo(x + w, y);
            }
            // Right border for all selected and visible row headers
            for (let r = Math.max(minRow, this.viewportStartRow); r <= Math.min(maxRow, this.viewportEndRow); r++) {
                const y = this.getRowY(r) - this.scrollY;
                const h = this.rowHeights[r];
                const x = this.headerWidth - 0.5;
                ctx.moveTo(x, y);
                ctx.lineTo(x, y + h);
            }
            ctx.stroke();
        }
    }
}
