class BackgroundDiv {
  constructor() {
    this.element = document.createElement("div");
    this.init();
  }

  init() {
    Object.assign(this.element.style, {
      width: "100vw",
      height: "100vh",
      backgroundColor: "#f0f0f0",
      position: "fixed",
      top: "0",
      left: "0",
      overflow: "hidden",
    });

    document.body.appendChild(this.element);
  }

  getBounds() {
    return this.element.getBoundingClientRect();
  }
}

class DraggableDiv {
  constructor(parent) {
    this.element = document.createElement("div");
    this.parent = parent;
    this.isDragging = false;
    this.currentX = 0;
    this.currentY = 0;
    this.initialX = 0;
    this.initialY = 0;
    this.xOffset = 0;
    this.yOffset = 0;

    this.init();
    this.attachEventListeners();
  }

  init() {
    Object.assign(this.element.style, {
      width: "50px",
      height: "50px",
      backgroundColor: "#3498db",
      position: "absolute",
      cursor: "grab",
      borderRadius: "4px",
      touchAction: "none",
      userSelect: "none",
      transform: "translate(0px, 0px)",
    });

    this.parent.element.appendChild(this.element);
  }

  attachEventListeners() {
    this.element.addEventListener(
      "pointerdown",
      this.handlePointerDown.bind(this)
    );
    document.addEventListener("pointermove", this.handlePointerMove.bind(this));
    document.addEventListener("pointerup", this.handlePointerUp.bind(this));
    this.element.addEventListener(
      "lostpointercapture",
      this.handlePointerUp.bind(this)
    );
    window.addEventListener("resize", this.handleResize.bind(this));
  }

  handlePointerDown(e) {
    this.isDragging = true;
    this.element.style.cursor = "grabbing";

    this.element.setPointerCapture(e.pointerId);

    this.initialX = e.clientX - this.xOffset;
    this.initialY = e.clientY - this.yOffset;
  }

  handlePointerMove(e) {
    if (!this.isDragging) return;

    e.preventDefault();

    this.currentX = e.clientX - this.initialX;
    this.currentY = e.clientY - this.initialY;

    const bounds = this.parent.getBounds();
    const maxX = bounds.width - this.element.offsetWidth;
    const maxY = bounds.height - this.element.offsetHeight;

    this.xOffset = this.currentX = Math.min(Math.max(this.currentX, 0), maxX);
    this.yOffset = this.currentY = Math.min(Math.max(this.currentY, 0), maxY);

    this.updatePosition();
  }

  handlePointerUp() {
    this.isDragging = false;
    this.element.style.cursor = "grab";
  }

  handleResize() {
    const bounds = this.parent.getBounds();
    const maxX = bounds.width - this.element.offsetWidth;
    const maxY = bounds.height - this.element.offsetHeight;

    this.xOffset = this.currentX = Math.min(Math.max(this.currentX, 0), maxX);
    this.yOffset = this.currentY = Math.min(Math.max(this.currentY, 0), maxY);

    this.updatePosition();
  }

  updatePosition() {
    this.element.style.transform = `translate(${this.currentX}px, ${this.currentY}px)`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.style.margin = "0";
  document.body.style.padding = "0";

  const backgroundDiv = new BackgroundDiv();
  const draggableDiv = new DraggableDiv(backgroundDiv);
});
