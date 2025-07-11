import { faker } from "@faker-js/faker";
export class DataManager {
    /**
     * Generates an array of synthetic data objects using faker.js.
     * @param {number} count - The number of data records (rows) to generate.
     */
    static generateData(count) {
        const data = [];
        // this faker.js library is cool
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
     * Generates a specified number of data records and then loads them into the provided grid.
     * @param {Grid} grid - The Grid instance to load data into.
     * @param {number} count - The number of data records to generate and load.
     */
    static generateAndLoadData(grid, count) {
        const data = this.generateData(count);
        this.loadJsonToGrid(data, grid);
    }
    /**
     * Handles the file load event, reads the selected JSON file, and attempts to load its data into the grid.
     * Shows an alert if the file is not valid JSON.
     * @param {Event} event - The event object from the file input.
     * @param {Grid} grid - The Grid instance to load data into.
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
     * @param {any[]} data - The array of JSON objects to load.
     * @param {Grid} grid - The Grid instance to load data into.
     */
    static loadJsonToGrid(data, grid) {
        // first, clear out any old data
        grid.clearAllCells();
        // Get the headers from the first object's keys
        const headers = Object.keys(data[0] || {});
        // Put the headers in the first row
        headers.forEach((header, index) => {
            grid.setCellValue(1, index + 1, header);
        });
        // Now loop through all the data and put it in the grid
        for (let i = 0; i < data.length; i++) {
            const row = i + 2; // Data starts from row 2 (after the header row)
            headers.forEach((header, j) => {
                const col = j + 1;
                grid.setCellValue(row, col, data[i][header]);
            });
        }
        // tell the grid to redraw itself
        grid.requestRedraw();
    }
}
