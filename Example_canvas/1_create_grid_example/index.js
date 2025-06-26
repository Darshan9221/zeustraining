const canvas = document.getElementById("gridCanvas");

const ctx = canvas.getContext("2d");

const rows = 4;
const cols = 4;

const cellsWidth = canvas.width / cols;
const cellsHeight = canvas.height / rows;

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  for (let i = 0; i <= rows; i++) {
    ctx.moveTo(0, i * cellsHeight);
    ctx.lineTo(canvas.width, i * cellsHeight);
  }
  for (let i = 0; i <= rows; i++) {
    ctx.moveTo(i * cellsWidth, 0);
    ctx.lineTo(i * cellsWidth, canvas.height);
  }
  ctx.strokeStyle = "#000";
  ctx.stroke();
}

drawGrid();
