export class HistoryManager {
    constructor(grid) {
        this.grid = grid;
        this.undoStack = [];
        this.redoStack = [];
    }
    execute(command) {
        command.execute(this.grid);
        this.grid.requestRedraw();
        this.record(command);
    }
    record(command) {
        this.undoStack.push(command);
        // A new action clears the redo history
        this.redoStack = [];
    }
    undo() {
        if (this.undoStack.length === 0)
            return;
        const command = this.undoStack.pop();
        command.undo(this.grid);
        this.grid.requestRedraw();
        this.redoStack.push(command);
    }
    redo() {
        if (this.redoStack.length === 0)
            return;
        const command = this.redoStack.pop();
        command.execute(this.grid); // Redoing is the same as executing
        this.grid.requestRedraw();
        this.undoStack.push(command);
    }
}
