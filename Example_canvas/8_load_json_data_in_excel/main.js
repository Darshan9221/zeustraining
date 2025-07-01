import { faker } from "@faker-js/faker";

const canvas = document.getElementById("gridCanvas");
const ctx = canvas.getContext("2d");

// Grid dimensions - 1 lakh rows, 500 columns
const rows = 100000;
const cols = 500;
const cellWidth = 64;
const cellHeight = 20;

// Header dimensions
const headerWidth = cellWidth;
const headerHeight = cellHeight;

// Viewport variables
let scrollX = 0;
let scrollY = 0;
let viewportStartRow = 0;
let viewportEndRow = 0;
let viewportStartCol = 0;
let viewportEndCol = 0;

// Selection
let selectedRow = null;
let selectedCol = null;
// Row/Col header highlight state
let highlightedRowHeader = null;
let highlightedColHeader = null;

// Performance tracking
let lastRenderTime = 0;

// DPI scaling for crisp lines
function getDPR() {
  return window.devicePixelRatio || 1;
}

// *** FIX 1: New function to dynamically calculate and set scrollbar sizes ***
function updateScrollbarContentSize() {
  let totalGridWidth = 0;
  for (let i = 1; i < cols; i++) {
    totalGridWidth += colWidths[i];
  }
  document.getElementById("hScrollContent").style.width = totalGridWidth + "px";

  let totalGridHeight = 0;
  for (let i = 1; i < rows; i++) {
    totalGridHeight += rowHeights[i];
  }
  document.getElementById("vScrollContent").style.height =
    totalGridHeight + "px";
}

// Initialize canvas size
function resizeCanvas() {
  const container = canvas.parentElement;
  const dpr = getDPR();
  // Set canvas size in device pixels
  canvas.width = (container.clientWidth - 20) * dpr;
  canvas.height = (container.clientHeight - 20) * dpr;
  // Set canvas style size in CSS pixels
  canvas.style.width = container.clientWidth - 20 + "px";
  canvas.style.height = container.clientHeight - 20 + "px";
  ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
  ctx.scale(dpr, dpr); // Scale for crispness

  // *** FIX 1: Call the new function here ***
  updateScrollbarContentSize();

  drawGrid();
}

// Sparse data storage - only store non-empty cells
const cellData = new Map();

function setCellValue(row, col, value) {
  const key = `${row},${col}`;
  if (value === "" || value === null || value === undefined) {
    cellData.delete(key);
  } else {
    cellData.set(key, value);
  }
}

function getCellValue(row, col) {
  return cellData.get(`${row},${col}`) || "";
}

// Calculate which cells are visible
function calculateViewport() {
  // Find the first visible row
  let accY = 0;
  viewportStartRow = 1;
  for (let r = 1; r < rows; r++) {
    if (accY >= scrollY) {
      viewportStartRow = r;
      break;
    }
    accY += rowHeights[r];
  }
  // Find the last visible row
  let visibleH = canvas.height / getDPR() - headerHeight;
  let sumY = 0; // Start from 0 relative to the start row's position
  viewportEndRow = viewportStartRow;
  for (let r = viewportStartRow; r < rows; r++) {
    sumY += rowHeights[r];
    if (sumY > visibleH) break;
    viewportEndRow = r;
  }
  // Find the first visible col
  let accX = 0;
  viewportStartCol = 1;
  for (let c = 1; c < cols; c++) {
    if (accX >= scrollX) {
      viewportStartCol = c;
      break;
    }
    accX += colWidths[c];
  }
  // Find the last visible col
  let visibleW = canvas.width / getDPR() - headerWidth;
  let sumX = 0; // Start from 0 relative to the start col's position
  viewportEndCol = viewportStartCol;
  for (let c = viewportStartCol; c < cols; c++) {
    sumX += colWidths[c];
    if (sumX > visibleW) break;
    viewportEndCol = c;
  }
  document.getElementById(
    "visibleInfo"
  ).textContent = `${viewportStartRow}-${viewportEndRow}, ${viewportStartCol}-${viewportEndCol}`;
}

// Helper: Convert a 0-based column index to Excel-style label (A, B, ..., Z, AA, AB, ...)
function colToExcelLabel(col) {
  let label = "";
  col++; // Convert 0-based to 1-based
  while (col > 0) {
    let rem = (col - 1) % 26;
    label = String.fromCharCode(65 + rem) + label;
    col = Math.floor((col - 1) / 26);
  }
  return label;
}

// Per-column widths and per-row heights for resizing
const colWidths = Array(cols).fill(cellWidth);
const rowHeights = Array(rows).fill(cellHeight);

// Helper to get X position of a column (left edge)
function getColX(col) {
  let x = headerWidth;
  for (let c = 1; c < col; c++) x += colWidths[c];
  return x;
}
// Helper to get Y position of a row (top edge)
function getRowY(row) {
  let y = headerHeight;
  for (let r = 1; r < row; r++) y += rowHeights[r];
  return y;
}

// Helper to get column at a given X (returns col index or null)
function colAtX(x) {
  let px = headerWidth;
  for (let c = 1; c < cols; c++) {
    if (x < px + colWidths[c]) return c;
    px += colWidths[c];
  }
  return null;
}
// Helper to get row at a given Y (returns row index or null)
function rowAtY(y) {
  let py = headerHeight;
  for (let r = 1; r < rows; r++) {
    if (y < py + rowHeights[r]) return r;
    py += rowHeights[r];
  }
  return null;
}

// Resizing state
let resizingCol = null;
let resizingRow = null;
let resizeStartX = 0;
let resizeStartY = 0;
let resizeOrigWidth = 0;
let resizeOrigHeight = 0;

canvas.addEventListener("mousemove", handleResizeMouseMove);
canvas.addEventListener("mousedown", handleResizeMouseDown);
document.addEventListener("mouseup", handleResizeMouseUp);
document.addEventListener("mousemove", handleResizeMouseDrag);

function handleResizeMouseMove(e) {
  if (resizingCol !== null || resizingRow !== null) return;

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // *** FIX 2: Convert mouse coordinates to virtual grid coordinates by adding scroll offsets ***
  const virtualMouseX = mouseX + scrollX;
  const virtualMouseY = mouseY + scrollY;

  // Check for column border (vertical line)
  let colEdge = null;
  let currentX = headerWidth;
  for (let c = 1; c < cols; c++) {
    currentX += colWidths[c];
    if (Math.abs(virtualMouseX - currentX) < 5) {
      colEdge = c;
      break;
    }
    if (currentX > virtualMouseX + 5) break; // Optimization
  }

  // Check for row border (horizontal line)
  let rowEdge = null;
  let currentY = headerHeight;
  for (let r = 1; r < rows; r++) {
    currentY += rowHeights[r];
    if (Math.abs(virtualMouseY - currentY) < 5) {
      rowEdge = r;
      break;
    }
    if (currentY > virtualMouseY + 5) break; // Optimization
  }

  // Use screen coordinates (mouseX, mouseY) to check if in the header area
  if (colEdge !== null && mouseY < headerHeight) {
    canvas.style.cursor = "col-resize";
  } else if (rowEdge !== null && mouseX < headerWidth) {
    canvas.style.cursor = "row-resize";
  } else {
    canvas.style.cursor = "";
  }
}

function handleResizeMouseDown(e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // *** FIX 2: Convert mouse coordinates to virtual grid coordinates by adding scroll offsets ***
  const virtualMouseX = mouseX + scrollX;
  const virtualMouseY = mouseY + scrollY;

  // Column resize
  let currentX = headerWidth;
  for (let c = 1; c < cols; c++) {
    currentX += colWidths[c];
    if (Math.abs(virtualMouseX - currentX) < 5 && mouseY < headerHeight) {
      resizingCol = c;
      resizeStartX = mouseX; // Store the initial SCREEN coordinate for drag calculation
      resizeOrigWidth = colWidths[c];
      return;
    }
  }

  // Row resize
  let currentY = headerHeight;
  for (let r = 1; r < rows; r++) {
    currentY += rowHeights[r];
    if (Math.abs(virtualMouseY - currentY) < 5 && mouseX < headerWidth) {
      resizingRow = r;
      resizeStartY = mouseY; // Store the initial SCREEN coordinate for drag calculation
      resizeOrigHeight = rowHeights[r];
      return;
    }
  }
}

function handleResizeMouseDrag(e) {
  if (resizingCol !== null) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    let newWidth = Math.max(24, resizeOrigWidth + (mouseX - resizeStartX));
    colWidths[resizingCol] = newWidth;
    drawGrid(selectedRow, selectedCol);
  } else if (resizingRow !== null) {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    let newHeight = Math.max(12, resizeOrigHeight + (mouseY - resizeStartY));
    rowHeights[resizingRow] = newHeight;
    drawGrid(selectedRow, selectedCol);
  }
}

function handleResizeMouseUp(e) {
  // *** FIX 1: Update scrollbar sizes after resizing is complete ***
  if (resizingCol !== null || resizingRow !== null) {
    updateScrollbarContentSize();
  }
  resizingCol = null;
  resizingRow = null;
}

// Draw grid
function drawGrid(highlightedRow = null, highlightedCol = null) {
  calculateViewport();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(0, 0, canvas.width, headerHeight);
  ctx.fillRect(0, 0, headerWidth, canvas.height);

  if (highlightedRowHeader !== null) {
    ctx.fillStyle = "#e8f2ec";
    const y = getRowY(highlightedRowHeader) - scrollY;
    ctx.fillRect(
      headerWidth,
      y,
      canvas.width - headerWidth,
      rowHeights[highlightedRowHeader]
    );
    ctx.fillStyle = "#0f703b";
    ctx.fillRect(0, y, headerWidth, rowHeights[highlightedRowHeader]);
    ctx.font = "12px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      highlightedRowHeader.toString(),
      headerWidth / 2,
      y + rowHeights[highlightedRowHeader] / 2
    );
  }
  if (highlightedColHeader !== null) {
    ctx.fillStyle = "#e8f2ec";
    const x = getColX(highlightedColHeader) - scrollX;
    ctx.fillRect(
      x,
      headerHeight,
      colWidths[highlightedColHeader],
      canvas.height - headerHeight
    );
    ctx.fillStyle = "#0f703b";
    ctx.fillRect(x, 0, colWidths[highlightedColHeader], headerHeight);
    ctx.font = "12px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      colToExcelLabel(highlightedColHeader - 1),
      x + colWidths[highlightedColHeader] / 2,
      headerHeight / 2
    );
  }

  if (highlightedRow !== null && highlightedCol !== null) {
    if (highlightedCol > 0) {
      ctx.fillStyle = "#a0d8b9";
      ctx.fillRect(
        getColX(highlightedCol) - scrollX,
        0,
        colWidths[highlightedCol],
        headerHeight
      );
      ctx.beginPath();
      ctx.strokeStyle = "#107c41";
      ctx.moveTo(getColX(highlightedCol) - scrollX + 0.5, headerHeight - 0.5);
      ctx.lineTo(
        getColX(highlightedCol + 1) - scrollX + 0.5,
        headerHeight - 0.5
      );
      ctx.stroke();
    }
    if (highlightedRow > 0) {
      ctx.fillStyle = "#a0d8b9";
      ctx.fillRect(
        0,
        getRowY(highlightedRow) - scrollY,
        headerWidth,
        rowHeights[highlightedRow]
      );
      ctx.beginPath();
      ctx.strokeStyle = "#107c41";
      ctx.moveTo(headerWidth - 0.5, getRowY(highlightedRow) - scrollY + 0.5);
      ctx.lineTo(
        headerWidth - 0.5,
        getRowY(highlightedRow + 1) - scrollY + 0.5
      );
      ctx.stroke();
    }
  }

  ctx.beginPath();
  ctx.strokeStyle = "#ddd";
  for (let c = viewportStartCol; c <= viewportEndCol + 1; c++) {
    const x = getColX(c) - scrollX;
    if (x > canvas.width / getDPR()) break;
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, canvas.height);
  }
  for (let r = viewportStartRow; r <= viewportEndRow + 1; r++) {
    const y = getRowY(r) - scrollY;
    if (y > canvas.height / getDPR()) break;
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(canvas.width, y + 0.5);
  }
  ctx.moveTo(headerWidth + 0.5, 0);
  ctx.lineTo(headerWidth + 0.5, canvas.height);
  ctx.moveTo(0, headerHeight + 0.5);
  ctx.lineTo(canvas.width, headerHeight + 0.5);
  ctx.stroke();

  ctx.font = "14px Arial";
  ctx.fillStyle = "#333";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  for (let r = viewportStartRow; r <= viewportEndRow; r++) {
    for (let c = viewportStartCol; c <= viewportEndCol; c++) {
      const value = getCellValue(r, c);
      if (value) {
        const screenX = getColX(c) - scrollX;
        const screenY = getRowY(c) - scrollY;
        ctx.fillText(value, screenX + 4, screenY + rowHeights[r] / 2);
      }
    }
  }

  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  for (let r = viewportStartRow; r <= viewportEndRow; r++) {
    const screenY = getRowY(r) - scrollY;
    if (screenY > canvas.height / getDPR()) break;
    ctx.fillStyle =
      highlightedRowHeader === r
        ? "#fff"
        : highlightedRow === r
        ? "#0c8289"
        : "#666";
    ctx.fillText(r.toString(), headerWidth / 2, screenY + rowHeights[r] / 2);
  }
  for (let c = viewportStartCol; c <= viewportEndCol; c++) {
    const screenX = getColX(c) - scrollX;
    if (screenX > canvas.width / getDPR()) break;
    ctx.fillStyle =
      highlightedColHeader === c
        ? "#fff"
        : highlightedCol === c
        ? "#0c8289"
        : "#666";
    ctx.fillText(
      colToExcelLabel(c - 1),
      screenX + colWidths[c] / 2,
      headerHeight / 2
    );
  }

  ctx.fillStyle = "#333";
  ctx.fillText("", headerWidth / 2, headerHeight / 2);
}

// Handle scrolling
function handleScroll() {
  const hScrollbar = document.querySelector(".scrollbar-h");
  const vScrollbar = document.querySelector(".scrollbar-v");
  scrollX = hScrollbar.scrollLeft;
  scrollY = vScrollbar.scrollTop;
  drawGrid(selectedRow, selectedCol);
  if (currentInput && selectedRow !== null && selectedCol !== null) {
    updateInputPosition();
  }
}

// Handle mouse wheel scrolling
function handleWheel(event) {
  event.preventDefault();
  const hScrollbar = document.querySelector(".scrollbar-h");
  const vScrollbar = document.querySelector(".scrollbar-v");
  const SCROLL_STEP = cellHeight * 3;
  if (event.shiftKey) {
    hScrollbar.scrollLeft += Math.sign(event.deltaY) * SCROLL_STEP;
  } else {
    vScrollbar.scrollTop += Math.sign(event.deltaY) * SCROLL_STEP;
  }
}
// Handle cell clicks
function handleCellClick(event) {
  const rect = canvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;
  const virtualX = clickX + scrollX;
  const virtualY = clickY + scrollY;

  if (clickX < headerWidth && clickY >= headerHeight) {
    const row = rowAtY(virtualY);
    if (row > 0 && row < rows) {
      highlightedRowHeader = row;
      highlightedColHeader = null;
      selectedRow = null;
      selectedCol = null;
      drawGrid();
      return;
    }
  } else if (clickY < headerHeight && clickX >= headerWidth) {
    const col = colAtX(virtualX);
    if (col > 0 && col < cols) {
      highlightedColHeader = col;
      highlightedRowHeader = null;
      selectedRow = null;
      selectedCol = null;
      drawGrid();
      return;
    }
  }
  if (clickX < headerWidth || clickY < headerHeight) return;

  highlightedRowHeader = null;
  highlightedColHeader = null;
  const col = colAtX(virtualX);
  const row = rowAtY(virtualY);

  if (row > 0 && row < rows && col > 0 && col < cols) {
    selectedRow = row;
    selectedCol = col;
    document.getElementById("selectedInfo").textContent = `R${row}, C${col}`;
    drawGrid(row, col);
    showInputBox(row, col);
  }
}

let currentInput = null;
let isNavigating = false;

function showInputBox(row, col) {
  if (currentInput && currentInput.parentNode) {
    currentInput.parentNode.removeChild(currentInput);
    currentInput = null;
  }
  if (row === 0 || col === 0) return;

  const screenX = getColX(col) - scrollX;
  const screenY = getRowY(row) - scrollY;

  if (
    screenX < headerWidth ||
    screenY < headerHeight ||
    screenX > canvas.width / getDPR() ||
    screenY > canvas.height / getDPR()
  )
    return;

  const value = getCellValue(row, col);
  const input = document.createElement("input");
  input.type = "text";
  input.value = value;

  const canvasRect = canvas.getBoundingClientRect();
  input.style.position = "absolute";
  input.style.left = canvasRect.left + window.scrollX + screenX + "px";
  input.style.top = canvasRect.top + window.scrollY + screenY + "px";
  input.style.width = colWidths[col] + "px";
  input.style.height = rowHeights[row] + "px";
  input.style.fontSize = "14px";
  input.style.fontFamily = "Arial";
  input.style.paddingLeft = "4px";
  input.style.border = "2px solid #007acc";
  input.style.zIndex = 1000;
  input.style.outline = "none";
  input.style.boxSizing = "border-box";

  document.body.appendChild(input);
  input.focus();
  input.select();
  currentInput = input;

  input.addEventListener("blur", (e) => {
    if (isNavigating) return;
    setCellValue(row, col, input.value);
    if (input.parentNode) input.parentNode.removeChild(input);
    currentInput = null;
    drawGrid(selectedRow, selectedCol);
  });

  input.addEventListener("keydown", (e) => {
    let nextRow = row,
      nextCol = col,
      navigate = false;
    switch (e.key) {
      case "Enter":
      case "ArrowDown":
        nextRow = Math.min(rows - 1, row + 1);
        navigate = true;
        break;
      case "ArrowUp":
        nextRow = Math.max(1, row - 1);
        navigate = true;
        break;
      case "ArrowLeft":
        nextCol = Math.max(1, col - 1);
        navigate = true;
        break;
      case "ArrowRight":
      case "Tab":
        nextCol = Math.min(cols - 1, col + 1);
        navigate = true;
        break;
      case "Escape":
        if (input.parentNode) input.parentNode.removeChild(input);
        currentInput = null;
        return;
    }
    if (navigate) {
      e.preventDefault();
      isNavigating = true;
      setCellValue(row, col, input.value);
      if (input.parentNode) input.parentNode.removeChild(input);
      currentInput = null;
      selectedRow = nextRow;
      selectedCol = nextCol;
      ensureCellVisible(nextRow, nextCol);
      drawGrid(nextRow, nextCol);
      document.getElementById(
        "selectedInfo"
      ).textContent = `R${nextRow}, C${nextCol}`;
      setTimeout(() => {
        showInputBox(nextRow, nextCol);
        isNavigating = false;
      }, 0);
    }
  });
}

function updateInputPosition() {
  if (!currentInput || selectedRow === null || selectedCol === null) return;
  const screenX = getColX(selectedCol) - scrollX;
  const screenY = getRowY(selectedRow) - scrollY;
  const canvasRect = canvas.getBoundingClientRect();
  currentInput.style.left = canvasRect.left + window.scrollX + screenX + "px";
  currentInput.style.top = canvasRect.top + window.scrollY + screenY + "px";
  currentInput.style.width = colWidths[selectedCol] + "px";
  currentInput.style.height = rowHeights[selectedRow] + "px";
}

function ensureCellVisible(row, col) {
  const hScrollbar = document.querySelector(".scrollbar-h");
  const vScrollbar = document.querySelector(".scrollbar-v");
  const cellLeft = getColX(col) - headerWidth;
  const cellTop = getRowY(row) - headerHeight;
  const cellRight = cellLeft + colWidths[col];
  const cellBottom = cellTop + rowHeights[row];
  const visibleWidth = canvas.clientWidth - headerWidth;
  const visibleHeight = canvas.clientHeight - headerHeight;

  if (cellLeft < scrollX) hScrollbar.scrollLeft = cellLeft;
  else if (cellRight > scrollX + visibleWidth)
    hScrollbar.scrollLeft = cellRight - visibleWidth;
  if (cellTop < scrollY) vScrollbar.scrollTop = cellTop;
  else if (cellBottom > scrollY + visibleHeight)
    vScrollbar.scrollTop = cellBottom - visibleHeight;
}

function handleKeydown(e) {
  if (currentInput) return;
  if (selectedRow === null || selectedCol === null) return;
  let nextRow = selectedRow,
    nextCol = selectedCol,
    navigate = false;
  switch (e.key) {
    case "ArrowDown":
      nextRow = Math.min(rows - 1, selectedRow + 1);
      navigate = true;
      break;
    case "ArrowUp":
      nextRow = Math.max(1, selectedRow - 1);
      navigate = true;
      break;
    case "ArrowLeft":
      nextCol = Math.max(1, selectedCol - 1);
      navigate = true;
      break;
    case "ArrowRight":
      nextCol = Math.min(cols - 1, selectedCol + 1);
      navigate = true;
      break;
    case "Enter":
    case "F2":
      showInputBox(selectedRow, selectedCol);
      return;
  }
  if (navigate) {
    e.preventDefault();
    selectedRow = nextRow;
    selectedCol = nextCol;
    document.getElementById(
      "selectedInfo"
    ).textContent = `R${nextRow}, C${nextCol}`;
    ensureCellVisible(nextRow, nextCol);
    drawGrid(nextRow, nextCol);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("generateDataBtn")) {
    const btn = document.createElement("button");
    btn.id = "generateDataBtn";
    btn.textContent = "Generate 50,000 JSON Records";
    btn.style.margin = "8px";
    document.body.insertBefore(btn, document.body.firstChild);
    btn.addEventListener("click", generateAndDownloadData);
  }
  if (!document.getElementById("loadDataInput")) {
    const input = document.createElement("input");
    input.type = "file";
    input.id = "loadDataInput";
    input.accept = ".json,application/json";
    input.style.margin = "8px";
    document.body.insertBefore(input, document.body.firstChild);
    input.addEventListener("change", handleFileLoad);
  }
});

async function generateAndDownloadData() {
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

function handleFileLoad(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (evt) {
    try {
      const data = JSON.parse(evt.target.result);
      loadJsonToGrid(data);
    } catch (err) {
      alert("Invalid JSON file!");
    }
  };
  reader.readAsText(file);
}

function loadJsonToGrid(data) {
  cellData.clear();
  setCellValue(1, 1, "id");
  setCellValue(1, 2, "firstName");
  setCellValue(1, 3, "lastName");
  setCellValue(1, 4, "Age");
  setCellValue(1, 5, "Salary");
  for (let i = 0; i < data.length; i++) {
    const row = i + 2;
    setCellValue(row, 1, data[i].id);
    setCellValue(row, 2, data[i].firstName);
    setCellValue(row, 3, data[i].lastName);
    setCellValue(row, 4, data[i].Age);
    setCellValue(row, 5, data[i].Salary);
  }
  drawGrid();
}

window.addEventListener("resize", resizeCanvas);
canvas.addEventListener("click", handleCellClick);
canvas.addEventListener("wheel", handleWheel, { passive: false });
document.addEventListener("keydown", handleKeydown);
document.querySelector(".scrollbar-h").addEventListener("scroll", handleScroll);
document.querySelector(".scrollbar-v").addEventListener("scroll", handleScroll);

resizeCanvas();
drawGrid();
