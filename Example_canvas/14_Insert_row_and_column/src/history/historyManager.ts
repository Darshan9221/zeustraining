import { Grid } from "../Grid";
import { ICommand } from "./commands";

export class HistoryManager {
  private undoStack: ICommand[] = [];
  private redoStack: ICommand[] = [];

  constructor(private grid: Grid) {}

  public execute(command: ICommand): void {
    command.execute(this.grid);
    this.grid.requestRedraw();
    this.record(command);
  }

  public record(command: ICommand): void {
    this.undoStack.push(command);
    // A new action clears the redo history
    this.redoStack = [];
  }

  public undo(): void {
    if (this.undoStack.length === 0) return;

    const command = this.undoStack.pop()!;
    command.undo(this.grid);
    this.grid.requestRedraw();
    this.redoStack.push(command);
  }

  public redo(): void {
    if (this.redoStack.length === 0) return;

    const command = this.redoStack.pop()!;
    command.execute(this.grid); // Redoing is the same as executing
    this.grid.requestRedraw();
    this.undoStack.push(command);
  }
}
