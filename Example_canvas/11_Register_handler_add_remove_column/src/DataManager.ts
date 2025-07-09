// src/DataManager.ts
import { faker } from "@faker-js/faker";
import { Grid } from "./Grid";

/**
 * @class DataManager
 * @description Handles the generation and loading of data into the grid.
 * It provides methods to create synthetic data and to load data from JSON files.
 */
export class DataManager {
  /**
   * @private
   * @method generateData
   * @description Generates an array of synthetic data objects using faker.js.
   * Each object represents a row with 'id', 'firstName', 'lastName', 'Age', and 'Salary' fields.
   * @param {number} count - The number of data records (rows) to generate.
   * @returns {object[]} An array of generated data objects.
   */
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

  /**
   * @public
   * @method generateAndLoadData
   * @description Generates a specified number of data records and then loads them into the provided grid.
   * @param {Grid} grid - The Grid instance to load data into.
   * @param {number} count - The number of data records to generate and load.
   */
  public static generateAndLoadData(grid: Grid, count: number): void {
    const data = this.generateData(count);
    this.loadJsonToGrid(data, grid);
  }

  /**
   * @public
   * @method handleFileLoad
   * @description Handles the file load event, reads the selected JSON file, and attempts to load its data into the grid.
   * Shows an alert if the file is not valid JSON.
   * @param {Event} e - The event object from the file input.
   * @param {Grid} grid - The Grid instance to load data into.
   */
  public static handleFileLoad(e: Event, grid: Grid): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return; // Exit if no file is selected

    const reader = new FileReader();
    // Callback function executed when the file is successfully read
    reader.onload = function (evt: ProgressEvent<FileReader>) {
      try {
        // Parses the file content as JSON
        const data = JSON.parse(evt.target!.result as string);
        DataManager.loadJsonToGrid(data, grid);
      } catch (err) {
        alert("Invalid JSON file!"); // Alert if JSON parsing fails
      }
    };
    reader.readAsText(file); // Reads the file content as text
  }

  /**
   * @private
   * @method loadJsonToGrid
   * @description Loads an array of JSON objects into the grid.
   * It sets the object keys as column headers and populates cells with corresponding values.
   * @param {any[]} data - The array of JSON objects to load.
   * @param {Grid} grid - The Grid instance to load data into.
   */
  private static loadJsonToGrid(data: any[], grid: Grid): void {
    grid.clearAllCells(); // Clears any existing data in the grid
    // Extracts headers from the keys of the first data object
    const headers = Object.keys(data[0] || {});
    // Sets column headers in the first row of the grid
    headers.forEach((header, index) => {
      grid.setCellValue(1, index + 1, header);
    });
    // Populates the grid with data from the JSON objects, starting from the second row
    for (let i = 0; i < data.length; i++) {
      const row = i + 2; // Data starts from row 2
      headers.forEach((header, index) => {
        grid.setCellValue(row, index + 1, data[i][header]);
      });
    }
    grid.requestRedraw(); // Requests the grid to redraw to display the new data
  }
}
