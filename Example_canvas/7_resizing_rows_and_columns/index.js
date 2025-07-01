const canvas = document.getElementById("gridCanvas");
const ctx = canvas.getContext("2d");

// Grid dimensions - 1 lakh rows, 500 columns
const rows = 100002;
const cols = 502;
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

  // Update scrollbar content sizes - account for headers
  document.getElementById("hScrollContent").style.width =
    (cols - 1) * cellWidth + "px";
  document.getElementById("vScrollContent").style.height =
    (rows - 1) * cellHeight + "px";

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
  let y = headerHeight;
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
  let sumY = accY;
  viewportEndRow = viewportStartRow;
  for (let r = viewportStartRow; r < rows; r++) {
    sumY += rowHeights[r];
    if (sumY - scrollY > visibleH) break;
    viewportEndRow = r;
  }
  // Find the first visible col
  let x = headerWidth;
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
  let sumX = accX;
  viewportEndCol = viewportStartCol;
  for (let c = viewportStartCol; c < cols; c++) {
    sumX += colWidths[c];
    if (sumX - scrollX > visibleW) break;
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
  // const startTime = performance.now();
  calculateViewport();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw frozen header background
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(0, 0, canvas.width, headerHeight); // Top header row
  ctx.fillRect(0, 0, headerWidth, canvas.height); // Left header column

  // Excel-style row/col selection highlight
  if (highlightedRowHeader !== null) {
    // Highlight entire row
    ctx.fillStyle = "#e8f2ec";
    const y = getRowY(highlightedRowHeader) - scrollY;
    ctx.fillRect(
      headerWidth,
      y,
      canvas.width - headerWidth,
      rowHeights[highlightedRowHeader]
    );
    // Row header
    ctx.fillStyle = "#0f703b";
    ctx.fillRect(0, y, headerWidth, rowHeights[highlightedRowHeader]);
    // Row header text (always white)
    ctx.font = "12px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      highlightedRowHeader.toString(),
      headerWidth / 2,
      y + rowHeights[highlightedRowHeader] / 2
    );
    // No border for highlighted row
  }
  if (highlightedColHeader !== null) {
    // Highlight entire column
    ctx.fillStyle = "#e8f2ec";
    const x = getColX(highlightedColHeader) - scrollX;
    ctx.fillRect(
      x,
      headerHeight,
      colWidths[highlightedColHeader],
      canvas.height - headerHeight
    );
    // Col header
    ctx.fillStyle = "#0f703b";
    ctx.fillRect(x, 0, colWidths[highlightedColHeader], headerHeight);
    // Col header text (always white)
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

  // Excel-like header highlight
  if (highlightedRow !== null && highlightedCol !== null) {
    // Highlight header row cell
    if (highlightedCol > 0) {
      ctx.fillStyle = "#a0d8b9";
      ctx.fillRect(
        getColX(highlightedCol) - scrollX,
        0,
        colWidths[highlightedCol],
        headerHeight
      );
      // Underline
      ctx.beginPath();
      ctx.strokeStyle = "#107c41";
      ctx.moveTo(getColX(highlightedCol) - scrollX + 0.5, headerHeight - 0.5);
      ctx.lineTo(
        getColX(highlightedCol + 1) - scrollX + 0.5,
        headerHeight - 0.5
      );
      ctx.stroke();
    }
    // Highlight header column cell
    if (highlightedRow > 0) {
      ctx.fillStyle = "#a0d8b9";
      ctx.fillRect(
        0,
        getRowY(highlightedRow) - scrollY,
        headerWidth,
        rowHeights[highlightedRow]
      );
      // Side border
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

  // Draw grid lines (crisp, 1px)
  ctx.beginPath();
  ctx.strokeStyle = "#ddd";
  // Vertical lines for data area
  let x = headerWidth - scrollX;
  for (let col = viewportStartCol; col <= viewportEndCol + 1; col++) {
    ctx.moveTo(getColX(col) - scrollX + 0.5, 0);
    ctx.lineTo(getColX(col) - scrollX + 0.5, canvas.height);
  }
  // Horizontal lines for data area
  let y = headerHeight - scrollY;
  for (let row = viewportStartRow; row <= viewportEndRow + 1; row++) {
    ctx.moveTo(0, getRowY(row) - scrollY + 0.5);
    ctx.lineTo(canvas.width, getRowY(row) - scrollY + 0.5);
  }
  // Lines for frozen headers
  ctx.moveTo(headerWidth + 0.5, 0);
  ctx.lineTo(headerWidth + 0.5, canvas.height);
  ctx.moveTo(0, headerHeight + 0.5);
  ctx.lineTo(canvas.width, headerHeight + 0.5);
  ctx.stroke();

  // Draw cell content
  ctx.font = "14px Arial";
  ctx.fillStyle = "#333";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Draw data cells
  for (let row = viewportStartRow; row <= viewportEndRow; row++) {
    for (let col = viewportStartCol; col <= viewportEndCol; col++) {
      const screenX = getColX(col) - scrollX;
      const screenY = getRowY(row) - scrollY;
      if (
        screenX < headerWidth ||
        screenY < headerHeight ||
        screenX > canvas.width ||
        screenY > canvas.height
      )
        continue;
      const value = getCellValue(row, col);
      if (value) {
        const textX = screenX + colWidths[col] / 2;
        const textY = screenY + rowHeights[row] / 2;
        ctx.fillText(value, textX, textY);
      }
    }
  }

  // Draw frozen row headers (left column) with Excel-style numbering
  ctx.font = "12px Arial";
  for (let row = viewportStartRow; row <= viewportEndRow; row++) {
    const screenY = getRowY(row) - scrollY;
    if (screenY >= headerHeight && screenY <= canvas.height) {
      // Highlighted header text color
      if (highlightedRowHeader === row) {
        ctx.fillStyle = "#fff";
      } else if (highlightedRow === row) {
        ctx.fillStyle = "#0c8289";
      } else {
        ctx.fillStyle = "#666";
      }
      ctx.fillText(
        row.toString(),
        headerWidth / 2,
        screenY + rowHeights[row] / 2
      );
    }
  }

  // Draw frozen column headers (top row) with Excel-style labels
  for (let col = viewportStartCol; col <= viewportEndCol; col++) {
    const screenX = getColX(col) - scrollX;
    if (screenX >= headerWidth && screenX <= canvas.width) {
      // Highlighted header text color
      if (highlightedColHeader === col) {
        ctx.fillStyle = "#fff";
      } else if (highlightedCol === col) {
        ctx.fillStyle = "#0c8289";
      } else {
        ctx.fillStyle = "#666";
      }
      ctx.fillText(
        colToExcelLabel(col - 1),
        screenX + colWidths[col] / 2,
        headerHeight / 2
      );
    }
  }

  // Draw corner cell (leave blank)
  ctx.fillStyle = "#333";
  ctx.fillText("", headerWidth / 2, headerHeight / 2);

  ctx.fillStyle = "#333"; // Reset color

  // const endTime = performance.now();
  // lastRenderTime = endTime - startTime;
  // document.getElementById("perfInfo").textContent = `${lastRenderTime.toFixed(
  //   1
  // )}ms`;
}

// Handle scrolling
function handleScroll() {
  const hScrollbar = document.querySelector(".scrollbar-h");
  const vScrollbar = document.querySelector(".scrollbar-v");

  scrollX = hScrollbar.scrollLeft;
  scrollY = vScrollbar.scrollTop;

  drawGrid(selectedRow, selectedCol);

  // Update input position if visible
  if (currentInput && selectedRow !== null && selectedCol !== null) {
    updateInputPosition();
  }
}

// Handle mouse wheel scrolling
function handleWheel(event) {
  event.preventDefault();

  const hScrollbar = document.querySelector(".scrollbar-h");
  const vScrollbar = document.querySelector(".scrollbar-v");

  // Use a smaller scroll step for smoothness
  const SCROLL_STEP = cellHeight; // or try cellHeight / 2 for even smoother

  if (event.shiftKey) {
    // Horizontal scroll when shift is held
    const delta = Math.sign(event.deltaY) * SCROLL_STEP;
    hScrollbar.scrollLeft = Math.max(
      0,
      Math.min(
        hScrollbar.scrollLeft,
        hScrollbar.scrollWidth - hScrollbar.clientWidth
      )
    );
  } else {
    // Vertical scroll
    const delta = Math.sign(event.deltaY) * SCROLL_STEP;
    vScrollbar.scrollTop = Math.max(
      0,
      Math.min(
        vScrollbar.scrollTop + delta,
        vScrollbar.scrollHeight - vScrollbar.clientHeight
      )
    );
  }
}
// Handle cell clicks
function handleCellClick(event) {
  const rect = canvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  // Don't allow selection in header areas
  if (clickX < headerWidth || clickY < headerHeight) return;

  // On cell click, clear row/col highlight
  highlightedRowHeader = null;
  highlightedColHeader = null;

  const x = clickX + scrollX;
  const y = clickY + scrollY;

  const col = colAtX(x);
  const row = rowAtY(y);

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
  // Remove existing input safely
  if (currentInput && currentInput.parentNode) {
    currentInput.parentNode.removeChild(currentInput);
    currentInput = null;
  }

  // Do not show input if cell is in header row or header col
  if (row === 0 || col === 0) return;

  const screenX = getColX(col) - scrollX;
  const screenY = getRowY(row) - scrollY;
  const dpr = getDPR();

  if (
    screenX < headerWidth ||
    screenY < headerHeight ||
    screenX > canvas.width ||
    screenY > canvas.height
  )
    return;

  const value = getCellValue(row, col);

  const input = document.createElement("input");
  input.type = "text";
  input.value = value;
  // --- AFTER (Correct & More Robust) ---
  const canvasRect = canvas.getBoundingClientRect();
  input.style.position = "absolute";
  input.style.left = canvasRect.left + window.scrollX + screenX + 0.5 + "px";
  input.style.top = canvasRect.top + window.scrollY + screenY + 0.5 + "px";
  input.style.width = colWidths[col] + "px";
  input.style.height = rowHeights[row] + "px";
  input.style.fontSize = "16px";
  input.style.textAlign = "left"; // Align text to left
  input.style.paddingLeft = "4px"; // Add left padding
  input.style.overflow = "hidden"; // Prevent overflow to left
  input.style.textOverflow = "ellipsis"; // Show ellipsis if overflow
  input.style.border = "2px solid #007acc";
  input.style.zIndex = 1000;
  input.style.outline = "none";
  input.style.boxSizing = "border-box";
  input.style.overflow = "hidden";
  input.style.textOverflow = "ellipsis";

  document.body.appendChild(input);
  input.focus();
  input.select();
  currentInput = input;

  // Handle input events
  input.addEventListener("blur", (e) => {
    if (isNavigating) return; // Don't process blur during navigation

    setCellValue(row, col, input.value);
    if (input.parentNode) {
      input.parentNode.removeChild(input);
    }
    currentInput = null;
    highlightedRowHeader = null;
    highlightedColHeader = null;
    drawGrid(selectedRow, selectedCol);
  });

  input.addEventListener("keydown", (e) => {
    let nextRow = row;
    let nextCol = col;
    let navigate = false;

    switch (e.key) {
      case "Enter":
      case "ArrowDown":
        nextRow = Math.min(rows - 2, row + 1);
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
        nextCol = Math.min(cols - 2, col + 1);
        navigate = true;
        break;
      case "Escape":
        if (input.parentNode) {
          input.parentNode.removeChild(input);
        }
        currentInput = null;
        return;
    }

    if (navigate) {
      e.preventDefault();
      isNavigating = true;

      setCellValue(row, col, input.value);
      if (input.parentNode) {
        input.parentNode.removeChild(input);
      }
      currentInput = null;
      highlightedRowHeader = null;
      highlightedColHeader = null;

      selectedRow = nextRow;
      selectedCol = nextCol;

      // Auto-scroll to keep selected cell visible
      ensureCellVisible(nextRow, nextCol);

      drawGrid(nextRow, nextCol);
      document.getElementById(
        "selectedInfo"
      ).textContent = `R${nextRow}, C${nextCol}`;

      setTimeout(() => {
        showInputBox(nextRow, nextCol);
        isNavigating = false;
      }, 10);
    }
  });
}

function updateInputPosition() {
  if (!currentInput || selectedRow === null || selectedCol === null) return;

  const screenX = getColX(selectedCol) - scrollX;
  const screenY = getRowY(selectedRow) - scrollY;
  const dpr = getDPR();

  currentInput.style.display = "block";
  // --- AFTER (Correct & More Robust) ---
  const canvasRect = canvas.getBoundingClientRect();
  currentInput.style.left =
    canvasRect.left + window.scrollX + screenX + 0.5 + "px";
  currentInput.style.top =
    canvasRect.top + window.scrollY + screenY + 0.5 + "px";
  currentInput.style.width = colWidths[selectedCol] + "px";
  currentInput.style.height = rowHeights[selectedRow] + "px";
}

function ensureCellVisible(row, col) {
  const hScrollbar = document.querySelector(".scrollbar-h");
  const vScrollbar = document.querySelector(".scrollbar-v");

  const cellLeft = (col - 1) * cellWidth; // Adjust for header
  const cellTop = (row - 1) * cellHeight; // Adjust for header
  const cellRight = cellLeft + cellWidth;
  const cellBottom = cellTop + cellHeight;

  const visibleWidth = canvas.width - headerWidth;
  const visibleHeight = canvas.height - headerHeight;

  // Horizontal scrolling
  if (cellLeft < scrollX) {
    hScrollbar.scrollLeft = cellLeft;
  } else if (cellRight > scrollX + visibleWidth) {
    hScrollbar.scrollLeft = cellRight - visibleWidth;
  }

  // Vertical scrolling
  if (cellTop < scrollY) {
    vScrollbar.scrollTop = cellTop;
  } else if (cellBottom > scrollY + visibleHeight) {
    vScrollbar.scrollTop = cellBottom - visibleHeight;
  }
}

// Handle keyboard navigation without input box
function handleKeydown(e) {
  if (currentInput) return; // Let input handle its own keys

  if (selectedRow === null || selectedCol === null) return;

  let nextRow = selectedRow;
  let nextCol = selectedCol;
  let navigate = false;

  switch (e.key) {
    case "ArrowDown":
      nextRow = Math.min(rows - 1, selectedRow);
      navigate = true;
      break;
    case "ArrowUp":
      nextRow = Math.max(1, selectedRow);
      navigate = true;
      break;
    case "ArrowLeft":
      nextCol = Math.max(1, selectedCol);
      navigate = true;
      break;
    case "ArrowRight":
      nextCol = Math.min(cols - 1, selectedCol);
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

// Event listeners
window.addEventListener("resize", resizeCanvas);
canvas.addEventListener("click", handleCellClick);
canvas.addEventListener("wheel", handleWheel, { passive: false });
document.addEventListener("keydown", handleKeydown);

document.querySelector(".scrollbar-h").addEventListener("scroll", handleScroll);
document.querySelector(".scrollbar-v").addEventListener("scroll", handleScroll);

// Initialize
resizeCanvas();
drawGrid();
