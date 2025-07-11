export class GridRenderer {
    constructor(model, calculator, grid, canvas) {
        this.model = model;
        this.calculator = calculator;
        this.grid = grid;
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
    }
    /**
     * Converts a column index to its to excel style alphabets
     * @param {number} col - The zero-based column index.
     */
    colToExcelLabel(col) {
        // Found this online, seems to work
        let label = "";
        col++; // Adjust to 1-based index
        while (col > 0) {
            let rem = (col - 1) % 26;
            label = String.fromCharCode(65 + rem) + label;
            col = Math.floor((col - 1) / 26);
        }
        return label;
    }
    drawGrid() {
        this.calculator.calculateViewport();
        const ctx = this.context; // alias for convenience
        // clear the whole canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const hasSelection = this.model.selectionStartRow !== null;
        let minRow = -1, maxRow = -1, minCol = -1, maxCol = -1;
        if (hasSelection) {
            minRow = Math.min(this.model.selectionStartRow, this.model.selectionEndRow);
            maxRow = Math.max(this.model.selectionStartRow, this.model.selectionEndRow);
            minCol = Math.min(this.model.selectionStartCol, this.model.selectionEndCol);
            maxCol = Math.max(this.model.selectionStartCol, this.model.selectionEndCol);
        }
        // Check if the user selected a full row or column
        const isFullRowSelection = hasSelection && minCol === 1 && maxCol === this.model.cols - 1;
        const isFullColSelection = hasSelection && minRow === 1 && maxRow === this.model.rows - 1;
        // Drawing the cells
        // Use save/restore and clip to make sure we don't draw cell stuff over the headers
        ctx.save();
        ctx.beginPath();
        ctx.rect(this.model.headerWidth, this.model.headerHeight, this.canvas.width - this.model.headerWidth, this.canvas.height - this.model.headerHeight);
        ctx.clip();
        // Draw the light blue selection background
        if (hasSelection) {
            const selectionX = this.calculator.getColX(minCol) - this.model.scrollX;
            const selectionY = this.calculator.getRowY(minRow) - this.model.scrollY;
            const selectionEndGutterX = this.calculator.getColX(maxCol + 1) - this.model.scrollX;
            const selectionEndGutterY = this.calculator.getRowY(maxRow + 1) - this.model.scrollY;
            const selectionWidth = selectionEndGutterX - selectionX;
            const selectionHeight = selectionEndGutterY - selectionY;
            ctx.fillStyle = "#e8f2ec"; // a light green/blue color
            ctx.fillRect(selectionX, selectionY, selectionWidth, selectionHeight);
            // The active cell needs a white background so you can see it inside the selection
            if (this.model.selectedRow !== null && this.model.selectedCol !== null) {
                ctx.fillStyle = "#ffffff";
                const activeCellX = this.calculator.getColX(this.model.selectedCol) - this.model.scrollX;
                const activeCellY = this.calculator.getRowY(this.model.selectedRow) - this.model.scrollY;
                ctx.fillRect(activeCellX, activeCellY, this.model.colWidths[this.model.selectedCol], this.model.rowHeights[this.model.selectedRow]);
            }
        }
        // Draw the grid lines (the faint gray ones)
        ctx.beginPath();
        ctx.strokeStyle = "#ddd";
        for (let c = this.model.viewportStartCol; c <= this.model.viewportEndCol + 1; c++) {
            const x = this.calculator.getColX(c) - this.model.scrollX;
            ctx.moveTo(x + 0.5, this.model.headerHeight);
            ctx.lineTo(x + 0.5, this.canvas.height);
        }
        for (let r = this.model.viewportStartRow; r <= this.model.viewportEndRow + 1; r++) {
            const y = this.calculator.getRowY(r) - this.model.scrollY;
            ctx.moveTo(this.model.headerWidth, y + 0.5);
            ctx.lineTo(this.canvas.width, y + 0.5);
        }
        ctx.stroke();
        // Draw the actual cell text
        ctx.font = "14px Arial";
        ctx.fillStyle = "#333";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (let r = this.model.viewportStartRow; r <= this.model.viewportEndRow; r++) {
            for (let c = this.model.viewportStartCol; c <= this.model.viewportEndCol; c++) {
                const value = this.model.getCellValue(r, c);
                if (value) {
                    const screenX = this.calculator.getColX(c) - this.model.scrollX;
                    const screenY = this.calculator.getRowY(r) - this.model.scrollY;
                    // console.log('drawing text', value);
                    ctx.fillText(value, screenX + this.model.colWidths[c] / 2, screenY + this.model.rowHeights[r] / 2);
                }
            }
        }
        // Draw the thick green border around the selection
        if (hasSelection) {
            const rangeX = this.calculator.getColX(minCol) - this.model.scrollX;
            const rangeY = this.calculator.getRowY(minRow) - this.model.scrollY;
            const rangeEndGutterX = this.calculator.getColX(maxCol + 1) - this.model.scrollX;
            const rangeEndGutterY = this.calculator.getRowY(maxRow + 1) - this.model.scrollY;
            const rangeWidth = rangeEndGutterX - rangeX;
            const rangeHeight = rangeEndGutterY - rangeY;
            ctx.strokeStyle = "#107c41";
            ctx.lineWidth = 2;
            ctx.strokeRect(rangeX + 1, rangeY + 1, rangeWidth - 2, rangeHeight - 2);
        }
        ctx.restore(); // Done with the clipped area
        // Drawing headers and overlays
        // This part draws on the full canvas, not the clipped area
        // Header backgrounds
        ctx.fillStyle = "#f5f5f5";
        ctx.fillRect(0, 0, this.canvas.width, this.model.headerHeight);
        ctx.fillRect(0, 0, this.model.headerWidth, this.canvas.height);
        // Header grid lines
        ctx.beginPath();
        ctx.strokeStyle = "#ddd";
        for (let c = this.model.viewportStartCol; c <= this.model.viewportEndCol; c++) {
            const x = this.calculator.getColX(c) - this.model.scrollX;
            ctx.moveTo(x + 0.5, 0);
            ctx.lineTo(x + 0.5, this.model.headerHeight);
        }
        for (let r = this.model.viewportStartRow; r <= this.model.viewportEndRow; r++) {
            const y = this.calculator.getRowY(r) - this.model.scrollY;
            ctx.moveTo(0, y + 0.5);
            ctx.lineTo(this.model.headerWidth, y + 0.5);
        }
        ctx.stroke();
        // Draw highlights on the headers for selected rows/cols
        if (hasSelection) {
            // Use a darker green for full selections
            let rowHeaderColor = isFullRowSelection ? "#0f703b" : "#a0d8b9";
            ctx.fillStyle = rowHeaderColor;
            for (let r = Math.max(minRow, this.model.viewportStartRow); r <= Math.min(maxRow, this.model.viewportEndRow); r++) {
                const screenY = this.calculator.getRowY(r) - this.model.scrollY;
                ctx.fillRect(0, screenY, this.model.headerWidth, this.model.rowHeights[r]);
            }
            let colHeaderColor = isFullColSelection ? "#0f703b" : "#a0d8b9";
            ctx.fillStyle = colHeaderColor;
            for (let c = Math.max(minCol, this.model.viewportStartCol); c <= Math.min(maxCol, this.model.viewportEndCol); c++) {
                const screenX = this.calculator.getColX(c) - this.model.scrollX;
                ctx.fillRect(screenX, 0, this.model.colWidths[c], this.model.headerHeight);
            }
        }
        // Draw header text (row numbers and column letters)
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        // Row numbers
        for (let r = this.model.viewportStartRow; r <= this.model.viewportEndRow; r++) {
            const screenY = this.calculator.getRowY(r) - this.model.scrollY;
            const isRowInRange = hasSelection && r >= minRow && r <= maxRow;
            if (isRowInRange) {
                // Use white text if it's a full row selection so it's readable
                ctx.fillStyle = isFullRowSelection ? "#ffffff" : "#0f703b";
            }
            else {
                ctx.fillStyle = "#666";
            }
            ctx.fillText(r.toString(), this.model.headerWidth / 2, screenY + this.model.rowHeights[r] / 2);
        }
        // Column letters
        for (let c = this.model.viewportStartCol; c <= this.model.viewportEndCol; c++) {
            const screenX = this.calculator.getColX(c) - this.model.scrollX;
            const isColInRange = hasSelection && c >= minCol && c <= maxCol;
            if (isColInRange) {
                // Use white text if it's a full col selection
                ctx.fillStyle = isFullColSelection ? "#ffffff" : "#0f703b";
            }
            else {
                ctx.fillStyle = "#666";
            }
            ctx.fillText(this.colToExcelLabel(c - 1), screenX + this.model.colWidths[c] / 2, this.model.headerHeight / 2);
        }
        // Draw the main borders between headers and the grid
        ctx.beginPath();
        ctx.strokeStyle = "#ccc"; // a bit darker than grid lines
        ctx.moveTo(this.model.headerWidth + 0.5, 0);
        ctx.lineTo(this.model.headerWidth + 0.5, this.canvas.height);
        ctx.moveTo(0, this.model.headerHeight + 0.5);
        ctx.lineTo(this.canvas.width, this.model.headerHeight + 0.5);
        ctx.stroke();
        // Draw the thin green lines on the headers themselves
        if (hasSelection) {
            ctx.beginPath();
            ctx.strokeStyle = "#107c41";
            ctx.lineWidth = 1;
            for (let c = Math.max(minCol, this.model.viewportStartCol); c <= Math.min(maxCol, this.model.viewportEndCol); c++) {
                const x = this.calculator.getColX(c) - this.model.scrollX;
                const w = this.model.colWidths[c];
                const y = this.model.headerHeight - 0.5;
                ctx.moveTo(x, y);
                ctx.lineTo(x + w, y);
            }
            for (let r = Math.max(minRow, this.model.viewportStartRow); r <= Math.min(maxRow, this.model.viewportEndRow); r++) {
                const y = this.calculator.getRowY(r) - this.model.scrollY;
                const h = this.model.rowHeights[r];
                const x = this.model.headerWidth - 0.5;
                ctx.moveTo(x, y);
                ctx.lineTo(x, y + h);
            }
            ctx.stroke();
        }
        // The little square fill handle on the active cell
        const isSingleCellSelection = this.model.selectionStartRow === this.model.selectionEndRow &&
            this.model.selectionStartCol === this.model.selectionEndCol;
        const isNotDragging = !this.grid.isDragging();
        if (this.model.selectedRow !== null &&
            this.model.selectedCol !== null &&
            isNotDragging &&
            isSingleCellSelection) {
            const activeCellX = this.calculator.getColX(this.model.selectedCol) - this.model.scrollX;
            const activeCellY = this.calculator.getRowY(this.model.selectedRow) - this.model.scrollY;
            const cellWidth = this.model.colWidths[this.model.selectedCol];
            const cellHeight = this.model.rowHeights[this.model.selectedRow];
            const handleSize = 6;
            const handleX = activeCellX + cellWidth - handleSize / 2 - 1;
            const handleY = activeCellY + cellHeight - handleSize / 2 - 1;
            // draw a white box behind the handle to make it pop
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(handleX - 1, handleY - 1, handleSize + 2, handleSize + 2);
            // now draw the green handle on top
            ctx.fillStyle = "#107c41";
            ctx.fillRect(handleX, handleY, handleSize, handleSize);
        }
    }
}
