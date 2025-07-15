import { Grid } from "../Grid";
import { ICommand } from "./commands";

export class HistoryManager {
  private undoStack: ICommand[] = [];
  private redoStack: ICommand[] = [];

  constructor(private grid: Grid) {}

  /**
   * Executes a command, adds it to the undo stack, and clears the redo stack.
   * This is for actions that have NOT been performed yet (e.g., cell editing).
   */
  public execute(command: ICommand): void {
    command.execute(this.grid);
    this.grid.requestRedraw();
    this.record(command);
  }

  /**
   * Records a command that has already been performed (e.g., resizing via drag).
   */
  public record(command: ICommand): void {
    this.undoStack.push(command);
    // A new action clears the redo history
    this.redoStack = [];
  }

  /**
   * Undoes the last action.
   */
  public undo(): void {
    if (this.undoStack.length === 0) return;

    const command = this.undoStack.pop()!;
    command.undo(this.grid);
    this.grid.requestRedraw();
    this.redoStack.push(command);
  }

  /**
   * Redoes the last undone action.
   */
  public redo(): void {
    if (this.redoStack.length === 0) return;

    const command = this.redoStack.pop()!;
    command.execute(this.grid); // Redoing is the same as executing
    this.grid.requestRedraw();
    this.undoStack.push(command);
  }
}
