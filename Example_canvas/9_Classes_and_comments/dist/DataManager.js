// src/DataManager.ts
import { faker } from "@faker-js/faker";
/**
 * Provides static methods for handling data operations like generating and loading.
 */
export class DataManager {
    /**
     * Generates 50,000 fake records using faker.js and initiates a download.
     */
    static generateAndDownloadData() {
        const data = [];
        for (let i = 1; i <= 50000; i++) {
            data.push({
                id: i,
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                Age: faker.number.int({ min: 18, max: 65 }),
                Salary: faker.number.int({ min: 20000, max: 2000000 }),
            });
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "data.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    /**
     * Handles the file input change event, reading the selected JSON file.
     * @param {Event} e The change event from the file input.
     * @param {Grid} grid The Grid instance to load the data into.
     */
    static handleFileLoad(e, grid) {
        var _a;
        const file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = function (evt) {
            try {
                const data = JSON.parse(evt.target.result);
                DataManager.loadJsonToGrid(data, grid);
            }
            catch (err) {
                alert("Invalid JSON file!");
            }
        };
        reader.readAsText(file);
    }
    /**
     * Populates the grid with data from a JSON object array.
     * @param {any[]} data An array of data objects.
     * @param {Grid} grid The Grid instance to load the data into.
     */
    static loadJsonToGrid(data, grid) {
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
        grid.drawGrid();
    }
}
