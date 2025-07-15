export class HistoryManager {
    constructor(grid) {
        this.grid = grid;
        this.undoStack = [];
        this.redoStack = [];
    }
    /**
     * Executes a command, adds it to the undo stack, and clears the redo stack.
     * This is for actions that have NOT been performed yet (e.g., cell editing).
     */
    execute(command) {
        command.execute(this.grid);
        this.grid.requestRedraw();
        this.record(command);
    }
    /**
     * Records a command that has already been performed (e.g., resizing via drag).
     */
    record(command) {
        this.undoStack.push(command);
        // A new action clears the redo history
        this.redoStack = [];
    }
    /**
     * Undoes the last action.
     */
    undo() {
        if (this.undoStack.length === 0)
            return;
        const command = this.undoStack.pop();
        command.undo(this.grid);
        this.grid.requestRedraw();
        this.redoStack.push(command);
    }
    /**
     * Redoes the last undone action.
     */
    redo() {
        if (this.redoStack.length === 0)
            return;
        const command = this.redoStack.pop();
        command.execute(this.grid); // Redoing is the same as executing
        this.grid.requestRedraw();
        this.undoStack.push(command);
    }
}
