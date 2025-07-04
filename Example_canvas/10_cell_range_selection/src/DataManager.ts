// src/DataManager.ts
import { faker } from "@faker-js/faker";
import { Grid } from "./Grid";

export class DataManager {
  private static generateData(count: number): object[] {
    const data: object[] = [];
    for (let i = 1; i <= count; i++) {
      data.push({
        id: i,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        Age: faker.number.int({ min: 18, max: 65 }),
        Salary: faker.number.int({ min: 20000, max: 2000000 }),
      });
    }
    return data;
  }

  public static generateAndLoadData(grid: Grid, count: number): void {
    const data = this.generateData(count);
    this.loadJsonToGrid(data, grid);
  }

  public static handleFileLoad(e: Event, grid: Grid): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (evt: ProgressEvent<FileReader>) {
      try {
        const data = JSON.parse(evt.target!.result as string);
        DataManager.loadJsonToGrid(data, grid);
      } catch (err) {
        alert("Invalid JSON file!");
      }
    };
    reader.readAsText(file);
  }

  private static loadJsonToGrid(data: any[], grid: Grid): void {
    grid.clearAllCells();
    const headers = Object.keys(data[0] || {});
    headers.forEach((header, index) => {
      grid.setCellValue(1, index + 1, header);
    });
    for (let i = 0; i < data.length; i++) {
      const row = i + 2;
      headers.forEach((header, index) => {
        grid.setCellValue(row, index + 1, data[i][header]);
      });
    }
    grid.requestRedraw(); // CHANGED
  }
}
