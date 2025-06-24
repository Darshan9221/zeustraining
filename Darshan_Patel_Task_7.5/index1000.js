class SectionDiv {
  constructor(parent, x, y, width, height) {
    this.element = document.createElement("div");
    this.parent = parent;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.init();
  }

  init() {
    Object.assign(this.element.style, {
      position: "absolute",
      left: `${this.x}px`,
      top: `${this.y}px`,
      width: `${this.width}px`,
      height: `${this.height}px`,
      boxSizing: "border-box",
      border: "1px solid #e0e0e0",
      background: "#fff",
    });
    this.parent.element.appendChild(this.element);
  }

  getBounds() {
    return this.element.getBoundingClientRect();
  }
}

class BackgroundDiv {
  constructor() {
    this.element = document.createElement("div");
    this.sections = [];
    this.init();
    window.addEventListener("resize", this.createSections.bind(this));
  }

  init() {
    Object.assign(this.element.style, {
      width: "100vw",
      height: "100vh",
      backgroundColor: "#f0f0f0",
      position: "fixed",
      top: "0",
      left: "0",
      overflow: "auto",
    });
    document.body.appendChild(this.element);
    this.createSections();
  }

  createSections() {
    this.sections.forEach((sec) => this.element.removeChild(sec.element));
    this.sections = [];
    document.querySelectorAll(".draggable").forEach((el) => el.remove());

    const sectionHeight = 500;
    const sectionWidth = 300;
    const totalBoxes = 1000;
    const viewportWidth = window.innerWidth;
    const cols = Math.max(1, Math.floor(viewportWidth / sectionWidth));
    const rows = Math.ceil(totalBoxes / cols);
    this.element.style.width = "100vw";
    this.element.style.height = "100vh";
    this.element.style.position = "fixed";
    this.element.style.overflow = "auto";
    this.element.style.backgroundColor = "#f0f0f0";
    if (!this.inner) {
      this.inner = document.createElement("div");
      this.element.appendChild(this.inner);
    }
    this.inner.style.position = "relative";
    this.inner.style.width = `${cols * sectionWidth}px`;
    this.inner.style.height = `${rows * sectionHeight}px`;
    while (this.inner.firstChild) this.inner.removeChild(this.inner.firstChild);
    this.sections = [];
    for (let i = 0; i < totalBoxes; i++) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      const x = c * sectionWidth;
      const y = r * sectionHeight;
      const section = new SectionDiv(
        { element: this.inner },
        x,
        y,
        sectionWidth,
        sectionHeight
      );
      this.sections.push(section);
    }
    this.sections.forEach((section) => {
      new DraggableDiv(section, true);
    });
  }

  getBounds() {
    return this.element.getBoundingClientRect();
  }
}

class DraggableDiv {
  constructor(parent, constrainToSection = false) {
    this.element = document.createElement("div");
    this.parent = parent;
    this.isDragging = false;
    this.currentX = 0;
    this.currentY = 0;
    this.initialX = 0;
    this.initialY = 0;
    this.xOffset = 0;
    this.yOffset = 0;
    this.constrainToSection = constrainToSection;
    this.init();
    this.attachEventListeners();
    this.centerInSection();
  }

  init() {
    Object.assign(this.element.style, {
      width: "40px",
      height: "40px",
      backgroundColor: "#3498db",
      position: "absolute",
      cursor: "grab",
      borderRadius: "4px",
      touchAction: "none",
      userSelect: "none",
      transform: "translate(0px, 0px)",
      zIndex: 2,
    });
    this.element.classList.add("draggable");
    this.parent.element.appendChild(this.element);
  }

  centerInSection() {
    const bounds = this.parent.getBounds();
    const centerX = (bounds.width - this.element.offsetWidth) / 2;
    const centerY = (bounds.height - this.element.offsetHeight) / 2;
    this.currentX = this.xOffset = centerX;
    this.currentY = this.yOffset = centerY;
    this.updatePosition();
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
    let bounds = this.parent.getBounds();
    let maxX = bounds.width - this.element.offsetWidth;
    let maxY = bounds.height - this.element.offsetHeight;
    this.xOffset = this.currentX = Math.min(Math.max(this.currentX, 0), maxX);
    this.yOffset = this.currentY = Math.min(Math.max(this.currentY, 0), maxY);
    this.updatePosition();
  }

  handlePointerUp() {
    this.isDragging = false;
    this.element.style.cursor = "grab";
  }

  handleResize() {
    let bounds = this.parent.getBounds();
    let maxX = bounds.width - this.element.offsetWidth;
    let maxY = bounds.height - this.element.offsetHeight;
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
  new BackgroundDiv();
});
