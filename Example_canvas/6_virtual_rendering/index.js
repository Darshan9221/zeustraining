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
  // Account for header row/column in calculations
  viewportStartRow = Math.max(1, Math.floor(scrollY / cellHeight) + 1);
  viewportEndRow = Math.min(
    rows - 1,
    viewportStartRow +
      Math.ceil((canvas.height - headerHeight) / cellHeight) +
      1
  );

  viewportStartCol = Math.max(1, Math.floor(scrollX / cellWidth) + 1);
  viewportEndCol = Math.min(
    cols - 1,
    viewportStartCol + Math.ceil((canvas.width - headerWidth) / cellWidth) + 1
  );

  // Update info display
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

// class Cell {
//   constructor(row, col, val = "") {
//     this.row = row;
//     this.col = col;
//     this.val = val;
//   }
//   setValue(val) {
//     this.val = val;
//   }

//   getValue() {
//     return this.val;
//   }
// }

// class Grid {
//   constructor(rows, cols) {
//     this.rows = rows;
//     this.cols = cols;
//     this.cells = this.createCells();
//   }
//   createCells() {
//     const cells = [];
//     for (let i = 0; i <= this.rows; i++) {
//       cells[i] = [];
//       for (let j = 0; j <= this.cols; j++) {
//         cells[i][j] = new Cell(i, j);
//       }
//     }
//     return cells;
//   }
//   getCell(row, col) {
//     return this.cells[row][col];
//   }
// }

// const grids = new Grid(rows, cols);

function drawGrid(highlightedRow = null, highlightedCol = null) {
  const startTime = performance.now();
  calculateViewport();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw frozen header background
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(0, 0, canvas.width, headerHeight); // Top header row
  ctx.fillRect(0, 0, headerWidth, canvas.height); // Left header column

  // Excel-like header highlight
  if (highlightedRow !== null && highlightedCol !== null) {
    // Highlight header row cell
    if (highlightedCol > 0) {
      ctx.fillStyle = "#a0d8b9";
      ctx.fillRect(
        highlightedCol * cellWidth - scrollX,
        0,
        cellWidth,
        headerHeight
      );
      // Underline
      ctx.beginPath();
      ctx.strokeStyle = "#107c41";
      ctx.moveTo(
        highlightedCol * cellWidth - scrollX + 0.5,
        headerHeight - 0.5
      );
      ctx.lineTo(
        (highlightedCol + 1) * cellWidth - scrollX + 0.5,
        headerHeight - 0.5
      );
      ctx.stroke();
    }
    // Highlight header column cell
    if (highlightedRow > 0) {
      ctx.fillStyle = "#a0d8b9";
      ctx.fillRect(
        0,
        highlightedRow * cellHeight - scrollY,
        headerWidth,
        cellHeight
      );
      // Side border
      ctx.beginPath();
      ctx.strokeStyle = "#107c41";
      ctx.moveTo(
        headerWidth - 0.5,
        highlightedRow * cellHeight - scrollY + 0.5
      );
      ctx.lineTo(
        headerWidth - 0.5,
        (highlightedRow + 1) * cellHeight - scrollY + 0.5
      );
      ctx.stroke();
    }
  }

  // Draw grid lines (crisp, 1px)
  ctx.beginPath();
  ctx.strokeStyle = "#ddd";
  // Vertical lines for data area
  for (let col = viewportStartCol; col <= viewportEndCol + 1; col++) {
    const x = col * cellWidth - scrollX + 0.5;
    if (x >= headerWidth && x <= canvas.width) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
    }
  }
  // Horizontal lines for data area
  for (let row = viewportStartRow; row <= viewportEndRow + 1; row++) {
    const y = row * cellHeight - scrollY + 0.5;
    if (y >= headerHeight && y <= canvas.height) {
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
    }
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
      const screenX = col * cellWidth - scrollX;
      const screenY = row * cellHeight - scrollY;
      if (
        screenX < headerWidth ||
        screenY < headerHeight ||
        screenX > canvas.width ||
        screenY > canvas.height
      )
        continue;
      const value = getCellValue(row, col);
      if (value) {
        const textX = screenX + cellWidth / 2;
        const textY = screenY + cellHeight / 2;
        ctx.fillText(value, textX, textY);
      }
    }
  }

  // Draw frozen row headers (left column) with Excel-style numbering
  ctx.font = "12px Arial";
  for (let row = viewportStartRow; row <= viewportEndRow; row++) {
    const screenY = row * cellHeight - scrollY;
    if (screenY >= headerHeight && screenY <= canvas.height) {
      // Highlighted header text color
      if (highlightedRow === row) {
        ctx.fillStyle = "#0c8289";
      } else {
        ctx.fillStyle = "#666";
      }
      ctx.fillText(row.toString(), headerWidth / 2, screenY + cellHeight / 2);
    }
  }

  // Draw frozen column headers (top row) with Excel-style labels
  for (let col = viewportStartCol; col <= viewportEndCol; col++) {
    const screenX = col * cellWidth - scrollX;
    if (screenX >= headerWidth && screenX <= canvas.width) {
      // Highlighted header text color
      if (highlightedCol === col) {
        ctx.fillStyle = "#0c8289";
      } else {
        ctx.fillStyle = "#666";
      }
      ctx.fillText(
        colToExcelLabel(col - 1),
        screenX + cellWidth / 2,
        headerHeight / 2
      );
    }
  }

  // Draw corner cell (leave blank)
  ctx.fillStyle = "#333";
  ctx.fillText("", headerWidth / 2, headerHeight / 2);

  ctx.fillStyle = "#333"; // Reset color

  const endTime = performance.now();
  lastRenderTime = endTime - startTime;
  document.getElementById("perfInfo").textContent = `${lastRenderTime.toFixed(
    1
  )}ms`;
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

  if (event.shiftKey) {
    // Horizontal scroll when shift is held
    const newScrollLeft = Math.max(0, hScrollbar.scrollLeft + event.deltaY);
    hScrollbar.scrollLeft = Math.min(
      newScrollLeft,
      hScrollbar.scrollWidth - hScrollbar.clientWidth
    );
  } else {
    // Vertical scroll
    const newScrollTop = Math.max(0, vScrollbar.scrollTop + event.deltaY);
    vScrollbar.scrollTop = Math.min(
      newScrollTop,
      vScrollbar.scrollHeight - vScrollbar.clientHeight
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

  const x = clickX + scrollX;
  const y = clickY + scrollY;

  const col = Math.floor(x / cellWidth);
  const row = Math.floor(y / cellHeight);

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

  const screenX = col * cellWidth - scrollX;
  const screenY = row * cellHeight - scrollY;

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
  input.style.position = "absolute";
  input.style.left = canvas.offsetLeft + screenX + "px";
  input.style.top = canvas.offsetTop + screenY + "px";
  input.style.width = cellWidth + "px";
  input.style.height = cellHeight + "px";
  input.style.fontSize = "16px";
  input.style.textAlign = "center";
  input.style.border = "2px solid #007acc";
  input.style.zIndex = 1000;
  input.style.outline = "none";
  input.style.boxSizing = "border-box";

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

  const screenX = selectedCol * cellWidth - scrollX;
  const screenY = selectedRow * cellHeight - scrollY;

  // Hide input if scrolled out of view or into header area
  // if (
  //   screenX < headerWidth ||
  //   screenY < headerHeight ||
  //   screenX > canvas.width ||
  //   screenY > canvas.height
  // ) {
  //   currentInput.style.display = "none";
  // } else {
  currentInput.style.display = "block";
  currentInput.style.left = canvas.offsetLeft + screenX + "px";
  currentInput.style.top = canvas.offsetTop + screenY + "px";
  // }
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

// canvas.addEventListener("click", handleCellClick);

// function handleCellClick(event) {
//   const col = Math.floor(event.offsetX / cellWidth);
//   const row = Math.floor(event.offsetY / cellHeight);
//   selectedRow = row;
//   selectedCol = col;
//   drawGrid(row, col);
//   showInputBox(row, col);
// }

// let navigating = false;

// function showInputBox(row, col) {
//   let oldInput = document.getElementById("cell-input");
//   if (oldInput) oldInput.remove();

//   let value = grids.getCell(row, col).getValue();
//   if (value === undefined) value = "";

//   const input = document.createElement("input");
//   input.type = "text";
//   input.id = "cell-input";
//   input.value = value;
//   input.style.position = "absolute";
//   input.style.left = canvas.offsetLeft + col * cellWidth + "px";
//   input.style.top = canvas.offsetTop + row * cellHeight + "px";
//   input.style.width = cellWidth + "px";
//   input.style.height = cellHeight + "px";
//   input.style.fontSize = "16px";
//   input.style.textAlign = "center";
//   input.style.zIndex = 10;
//   document.body.appendChild(input);
//   input.focus();
//   input.select();

//   // Save on blur
//   input.addEventListener("blur", () => {
//     if (navigating) return; // Don't remove input if navigating
//     grids.getCell(row, col).setValue(input.value);
//     input.remove();
//     drawGrid();
//   });
//   input.addEventListener("keydown", (e) => {
//     let nextRow = row;
//     let nextCol = col;
//     let nav = false;
//     if (e.key === "Enter" || e.key === "ArrowDown") {
//       nextRow = Math.min(rows - 1, row + 1);
//       nav = true;
//       e.preventDefault();
//     } else if (e.key === "ArrowUp") {
//       nextRow = Math.max(0, row - 1);
//       nav = true;
//       e.preventDefault();
//     } else if (e.key === "ArrowLeft") {
//       nextCol = Math.max(0, col - 1);
//       nav = true;
//       e.preventDefault();
//     } else if (e.key === "ArrowRight") {
//       nextCol = Math.min(cols - 1, col + 1);
//       nav = true;
//       e.preventDefault();
//     } else {
//       return;
//     }
//     if (nav) {
//       navigating = true;
//       grids.getCell(row, col).setValue(input.value);
//       input.remove();
//       selectedRow = nextRow;
//       selectedCol = nextCol;
//       drawGrid(nextRow, nextCol);
//       showInputBox(nextRow, nextCol);
//       navigating = false;
//     }
//   });
// }
