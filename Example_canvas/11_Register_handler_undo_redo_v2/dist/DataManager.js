import { faker } from "@faker-js/faker";
export class DataManager {
    /**
     * Generates data using faker.js
     * @param {number} count - The number of data
     */
    static generateData(count) {
        const data = [];
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
    static generateAndLoadData(grid, count) {
        const data = this.generateData(count);
        this.loadJsonToGrid(data, grid);
    }
    /**
     * File read and load on grid
     * @param {Event} event - File event input object
     * @param {Grid} grid
     */
    static handleFileLoad(event, grid) {
        var _a;
        const file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = function (evt) {
            try {
                const data = JSON.parse(evt.target.result);
                DataManager.loadJsonToGrid(data, grid);
            }
            catch (err) {
                alert("Whoa! That doesn't look like a valid JSON file. Please try again.");
            }
        };
        reader.readAsText(file);
    }
    /**
     * Loads an array of JSON objects into the grid.
     * @param {any[]} data - The array of JSON objects
     * @param {Grid} grid
     */
    static loadJsonToGrid(data, grid) {
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
