// src/DataManager.ts
import { faker } from "@faker-js/faker";
export class DataManager {
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
    static generateAndLoadData(grid, count) {
        const data = this.generateData(count);
        this.loadJsonToGrid(data, grid);
    }
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
        grid.requestRedraw(); // CHANGED
    }
}
