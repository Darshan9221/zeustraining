// Create new file: src/ContextMenu.ts
import { InsertColumnCommand, InsertRowCommand } from "../history/commands";
export class ContextMenu {
    constructor(grid, historyManager) {
        this.grid = grid;
        this.historyManager = historyManager;
        this.menu = document.createElement("div");
        this.menu.style.position = "absolute";
        this.menu.style.display = "none";
        this.menu.style.background = "#fff";
        this.menu.style.border = "1px solid #ccc";
        this.menu.style.boxShadow = "2px 2px 5px rgba(0,0,0,0.2)";
        this.menu.style.padding = "4px 0";
        this.menu.style.zIndex = "2000";
        document.body.appendChild(this.menu);
        // Hide the menu if the user clicks elsewhere
        window.addEventListener("click", () => this.hide());
        window.addEventListener("resize", () => this.hide());
    }
    show(x, y, row, col) {
        this.menu.innerHTML = ""; // Clear previous items
        this.menu.style.left = `${x}px`;
        this.menu.style.top = `${y}px`;
        if (col !== null) {
            const insertColBtn = this.createMenuItem("Insert column", () => this.handleInsertColumn(col));
            this.menu.appendChild(insertColBtn);
        }
        if (row !== null) {
            const insertRowBtn = this.createMenuItem("Insert row", () => this.handleInsertRow(row));
            this.menu.appendChild(insertRowBtn);
        }
        if (this.menu.children.length > 0) {
            this.menu.style.display = "block";
        }
    }
    hide() {
        this.menu.style.display = "none";
    }
    createMenuItem(label, onClick) {
        const item = document.createElement("div");
        item.textContent = label;
        item.style.padding = "6px 12px";
        item.style.cursor = "pointer";
        item.addEventListener("mouseenter", () => (item.style.background = "#f0f0f0"));
        item.addEventListener("mouseleave", () => (item.style.background = "#fff"));
        item.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent window click from immediately hiding menu
            onClick();
            this.hide();
        });
        return item;
    }
    handleInsertColumn(col) {
        // Check if the last column has data
        for (let r = 1; r < this.grid.rows; r++) {
            if (this.grid.getCellValue(r, this.grid.cols - 1)) {
                alert("Cannot insert column: The last column contains data that would be lost.");
                return;
            }
        }
        const command = new InsertColumnCommand(col);
        this.historyManager.execute(command);
    }
    handleInsertRow(row) {
        // Check if the last row has data
        for (let c = 1; c < this.grid.cols; c++) {
            if (this.grid.getCellValue(this.grid.rows - 1, c)) {
                alert("Cannot insert row: The last row contains data that would be lost.");
                return;
            }
        }
        const command = new InsertRowCommand(row);
        this.historyManager.execute(command);
    }
}
