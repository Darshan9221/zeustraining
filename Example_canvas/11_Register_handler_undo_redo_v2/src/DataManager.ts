import { faker } from "@faker-js/faker";
import { Grid } from "./Grid";

export class DataManager {
    /**
     * Generates data using faker.js
     * @param {number} count - The number of data
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
     * Generates a number of records from input
     * @param {Grid} grid 
     * @param {number} count - The number of data records
     */
    public static generateAndLoadData(grid: Grid, count: number): void {
        const data = this.generateData(count);
        this.loadJsonToGrid(data, grid);
    }

    /**
     * File read and load on grid
     * @param {Event} event - File event input object
     * @param {Grid} grid
     */
    public static handleFileLoad(event: Event, grid: Grid): void {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (evt: ProgressEvent<FileReader>) {
            try {
                const data = JSON.parse(evt.target!.result as string);
                DataManager.loadJsonToGrid(data, grid);
            } catch (err) {
                alert(
                    "Whoa! That doesn't look like a valid JSON file. Please try again."
                );
            }
        };
        reader.readAsText(file);
    }

    /**
     * Loads an array of JSON objects into the grid.
     * @param {any[]} data - The array of JSON objects 
     * @param {Grid} grid
     */
    private static loadJsonToGrid(data: any[], grid: Grid): void {
        grid.clearAllCells();

        const headers = Object.keys(data[0] || {});

        headers.forEach((header, index) => {
            grid.setCellValue(1, index + 1, header);
        });

        for (let i = 0; i < data.length; i++) {
            const row = i + 2;
            headers.forEach((header, j) => {
                const col = j + 1;
                grid.setCellValue(row, col, data[i][header]);
            });
        }
        grid.requestRedraw();
    }
}