interface CardOptions {
  preview: boolean;
  calendar: boolean;
  grade: boolean;
  charts: boolean;
}

interface CardData {
  image: string;
  title: string;
  subject: string;
  grade: string;
  gradePlus: string;
  units: number | string;
  lessons: number | string;
  topics: number | string;
  teacher: string;
  students: number | string;
  start: string;
  end: string;
  starred: boolean;
  expired?: boolean;
  dropdown_disabled: boolean;
  options: CardOptions;
}

interface AnnouncementData {
  pa: string;
  message: string;
  course: string | null;
  files: number;
  date: string;
  time: string;
  tick: boolean;
}

interface AlertData {
  message: string;
  tick: boolean;
  class?: boolean;
  course?: string;
  files?: number;
  date: string;
  time: string;
}

const cardData: CardData[] = [
  {
    image: "../images/imageMask-1.png",
    title: "Acceleration",
    subject: "Physics",
    grade: "Grade 7",
    gradePlus: "+2",
    units: 4,
    lessons: 18,
    topics: 24,
    teacher: "Mr. Frank's Class B",
    students: 50,
    start: "&nbsp&nbsp21-Jan-2020",
    end: "21-Aug-2020",
    starred: true,
    dropdown_disabled: false,
    options: {
      preview: false,
      calendar: false,
      grade: false,
      charts: false,
    },
  },
  {
    image: "../images/imageMask-2.png",
    title: "Displacement, Velocity and Speed",
    subject: "Physics 2",
    grade: "Grade 6",
    gradePlus: "+3",
    units: 2,
    lessons: 15,
    topics: 20,
    teacher: "No Classes",
    students: "",
    start: "",
    end: "",
    starred: true,
    dropdown_disabled: true,
    options: {
      preview: false,
      calendar: true,
      grade: true,
      charts: false,
    },
  },
  {
    image: "../images/imageMask-3.png",
    title:
      "Introduction to Biology: Micro organisms and how they affect Life Systems in Engineering Sciences",
    subject: "Biology",
    grade: "Grade 4",
    gradePlus: "+1",
    units: 5,
    lessons: 16,
    topics: 22,
    teacher: "All Classes",
    students: 300,
    start: "",
    end: "",
    starred: true,
    dropdown_disabled: false,
    options: {
      preview: false,
      calendar: true,
      grade: true,
      charts: false,
    },
  },
  {
    image: "../images/imageMask.png",
    title: "Introduction to High School Mathematics",
    subject: "Mathematics",
    grade: "Grade 8",
    gradePlus: "+3",
    units: "",
    lessons: "",
    topics: "",
    teacher: "Mr. Frank's Class A",
    students: 44,
    start: "&nbsp&nbsp14-Oct-2019",
    end: "20-Oct-2020",
    starred: false,
    expired: true,
    dropdown_disabled: false,
    options: {
      preview: false,
      calendar: false,
      grade: false,
      charts: false,
    },
  },
];

function createCard(card: CardData): string {
  return `
    <div class="card">
    ${card.expired ? `<div class="expired-tag">EXPIRED</div>` : ""}
      <div class="card-header">
      <div class="card-image-container">
        <img class="card-image" src="${card.image}" alt="Card image" />
      </div>
        <div>
          <p class="card-title" style="font-weight: 600">${card.title}</p>
          <div class="card-meta" style="font-weight: 400">
            <span style="font-weight: 600;margin-right: 5px;">${
              card.subject
            }</span> | <span style="font-weight: 600;margin-left: 5px;">${
    card.grade
  }</span>
            <span class="card-grade" style="font-weight: 600;margin-left:0;">${
              card.gradePlus
            }</span>
          </div>
          ${
            card.units && card.topics && card.lessons
              ? `<div class="card-units" style="font-weight: 600;color:#666666">
            <b style="color:#222222;font-weight: 600;">${card.units}</b> Units <b style="color:#222222;font-weight: 600;">${card.lessons}</b> Lessons <b style="color:#222222;font-weight: 600;">${card.topics}</b> Topics
          </div>`
              : ""
          }
          ${
            card.starred
              ? `<img class="card-star" src="../icons/favourite.svg" alt="star" />`
              : `<img class="card-star disabled" src="../icons/favourite.svg" alt="star" />`
          }
       <div class="dropdown_input_2">
                <div class="dropdown_options_2">
                  <select
                    style="font-weight: 600;"
                    name="teacher"
                    id="teacher"
                    ${card.dropdown_disabled && "disabled"}
                  >
                    <option value="course name">${card.teacher}</option>
                    <option value="duration">Test</option>
                  </select>
                  <img src="../icons/arrow-down.svg" style="bottom:0;" alt="" />
                </div>
              </div>        <div class="card-meta" style="font-weight: 600;color:#666666;font-size:12px">
        ${card.students ? `${card.students} Students&nbsp&nbsp` : ""} ${
    card.start && card.end ? ` |  ${card.start} - ${card.end}` : ""
  }
        </div>
        </div>
        </div>
      <div class="card-footer" style=" width: 428px;">
        <img class="card-footer-icon ${
          card.options.preview && "disabled"
        }" style="margin-left:24px" src="../icons/preview.svg" alt="eye" />
        <img class="card-footer-icon ${
          card.options.calendar && "disabled"
        }" style="width:18px;height:20px;" src="../icons/calendar.svg" alt="calendar" />
        <img class="card-footer-icon ${
          card.options.grade && "disabled"
        }" style="width:18px;height:20px;" src="../icons/grade.svg" alt="star" />
        <img class="card-footer-icon ${
          card.options.charts && "disabled"
        }" style="margin-right:24px" src="../icons/reports.svg" alt="chart" />
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", function () {
  const hoverItems = document.querySelectorAll<HTMLElement>(
    ".hover-content-items"
  );
  hoverItems.forEach((item) => {
    const trigger = item.querySelector<HTMLElement>(
      ".hover-content-item-contents"
    );
    if (trigger) {
      trigger.addEventListener("click", function (e) {
        e.stopPropagation();
        const isExpanded = item.classList.contains("expanded");
        hoverItems.forEach((i) => {
          i.classList.remove("expanded");
          const innerContent = i.querySelector<HTMLElement>(
            ".inner-hover-content"
          );
          if (innerContent) innerContent.style.display = "none";
        });
        if (!isExpanded) {
          item.classList.add("expanded");
          const inner = item.querySelector<HTMLElement>(".inner-hover-content");
          if (inner) inner.style.display = "block";
        }
      });
      const inner = item.querySelector<HTMLElement>(".inner-hover-content");
      if (inner) inner.style.display = "none";
    }
  });

  // Handle navbar active states
  const navItems = document.querySelectorAll<HTMLElement>(
    ".nav-content-text-container"
  );
  const boxItems = document.querySelectorAll<HTMLElement>(".box_content");

  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      navItems.forEach((nav) => nav.classList.remove("active"));
      item.classList.add("active");
    });
  });

  boxItems.forEach((item) => {
    item.addEventListener("click", () => {
      boxItems.forEach((box) => box.classList.remove("active"));
      item.classList.add("active");
    });
  });

  // Render cards
  const cardsContainer = document.getElementById("cards-container");
  if (cardsContainer) {
    cardsContainer.innerHTML = cardData.map(createCard).join("");
  }

  // Handle star clicks
  const stars = document.querySelectorAll<HTMLImageElement>(".card-star");
  stars.forEach((star, index) => {
    star.addEventListener("click", () => {
      cardData[index].starred = !cardData[index].starred;
      star.classList.toggle("disabled");
    });
  });

  // Add rotation toggle to up_arrow
  const upArrow = document.querySelector<HTMLDivElement>(".up_arrow");
  if (upArrow) {
    const img = upArrow.querySelector<HTMLImageElement>("img");
    let rotated = false;
    upArrow.addEventListener("click", () => {
      rotated = !rotated;
      if (img) {
        img.style.transition = "transform 0.3s";
        img.style.transform = rotated ? "rotate(180deg)" : "rotate(0deg)";
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const navIcon2 = document.querySelector<HTMLElement>(".nav-icon-content-2");
  const modal2 = navIcon2
    ? navIcon2.querySelector<HTMLElement>(".announcements-modal")
    : null;
  const icon2 = navIcon2
    ? navIcon2.querySelector<HTMLImageElement>("img")
    : null;
  if (navIcon2 && modal2 && icon2) {
    function setActive() {
      navIcon2?.classList.add("modal-hover");
    }
    function unsetActive() {
      navIcon2?.classList.remove("modal-hover");
    }
    navIcon2.addEventListener("mouseenter", setActive);
    navIcon2.addEventListener("mouseleave", function (e) {
      if (!modal2.matches(":hover")) unsetActive();
    });
    modal2.addEventListener("mouseenter", setActive);
    modal2.addEventListener("mouseleave", function (e) {
      if (!navIcon2.matches(":hover")) unsetActive();
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.querySelector<HTMLElement>(".hamburger-menu");
  const hoverContainer = hamburger
    ? hamburger.querySelector<HTMLElement>(".hover-container")
    : null;
  const icon = hamburger
    ? hamburger.querySelector<HTMLImageElement>("img")
    : null;
  if (hamburger && hoverContainer && icon) {
    function setActive() {
      hamburger?.classList.add("menu-hover");
    }
    function unsetActive() {
      hamburger?.classList.remove("menu-hover");
    }
    hamburger.addEventListener("mouseenter", setActive);
    hamburger.addEventListener("mouseleave", function () {
      if (!hoverContainer.matches(":hover")) unsetActive();
    });
    hoverContainer.addEventListener("mouseenter", setActive);
    hoverContainer.addEventListener("mouseleave", function () {
      if (!hamburger.matches(":hover")) unsetActive();
    });
  }
});

const data: AnnouncementData[] = [
  {
    pa: "Wilson Kumar",
    message: "No classes will be held on 21st Nov",
    course: null,
    files: 2,
    date: "15-Sept-2018",
    time: "07:21 pm",
    tick: false,
  },
  {
    pa: "Samson White",
    message: "Guest lecture on Geometry on 20th September",
    course: null,
    files: 2,
    date: "15-Sept-2018",
    time: "07:21 pm",
    tick: false,
  },
  {
    pa: "Wilson Kumar",
    message: "Additional course materials available on request",
    course: "Mathematics 101",
    files: 0,
    date: "15-Sept-2018",
    time: "07:21 pm",
    tick: false,
  },
  {
    pa: "Wilson Kumar",
    message: "No classes will be held on 25th Dec",
    course: null,
    files: 0,
    date: "15-Sept-2018",
    time: "07:21 pm",
    tick: false,
  },
  {
    pa: "Wilson Kumar",
    message: "Additional course materials available on request",
    course: "Mathematics 101",
    files: 0,
    date: "15-Sept-2018",
    time: "07:21 pm",
    tick: false,
  },
  {
    pa: "Wilson Kumar",
    message: "Additional course materials available on request",
    course: "Mathematics 101",
    files: 0,
    date: "15-Sept-2018",
    time: "07:21 pm",
    tick: false,
  },
  {
    pa: "Wilson Kumar",
    message: "No classes will be held on 25th Dec",
    course: null,
    files: 0,
    date: "15-Sept-2018",
    time: "07:21 pm",
    tick: false,
  },
  {
    pa: "Wilson Kumar",
    message: "Additional course materials available on request",
    course: "Mathematics 101",
    files: 0,
    date: "15-Sept-2018",
    time: "07:21 pm",
    tick: false,
  },
];

function renderCard(entry: AnnouncementData): HTMLElement {
  const container = document.createElement("div");
  container.className = "card-item-element-container";
  container.innerHTML = `
    <div class="card-item-header">
      <div class="card-item-author">
        <span class="card-pa">PA: </span>
        <p class="author-name">${entry.pa}</p>
      </div>
      <img src="${
        entry.tick ? "../icons/green-tick.svg" : "../icons/minus-circle.svg"
      }" alt="tick" />
    </div>
    <div class="card-item-main-text-container">
      <p class="card-item-main-text">${entry.message}</p>
    </div>
    ${
      entry.course
        ? `<div class="course-container">
        <div class="course-text-static">Course:</div>
        <div class="course-text-dynamic">${entry.course}</div>
      </div>`
        : ""
    }
    <div class="card-item-footer">
      <div class="files-attached">
        ${
          entry.files > 0
            ? `<div class="pin-img-container"><img src="../icons/clip.png" alt="clip" /></div>
        <div class="pin-files-dynamic" style="margin-right: 5px">${entry.files}</div>
        <div class="pin-files-static">files are attached</div>`
            : ""
        }
      </div>
      <div class="card-item-date">
        <div class="dynamic-date" style="margin-right: 5px">${entry.date}</div>
        <div class="static-at" style="margin-right: 5px">at</div>
        <div class="dynamic-time">${entry.time}</div>
      </div>
    </div>
  `;
  return container;
}

function updateNotificationCount(type: "alert" | "announcement"): void {
  const topCircle =
    type === "alert"
      ? document.querySelector<HTMLElement>(".top-circle")
      : document.querySelector<HTMLElement>(".top-circle-2");
  const container =
    type === "alert"
      ? document.getElementById("alert-card-list")
      : document.getElementById("card-list");
  if (!container || !topCircle) return;
  const unmarkedCount = container.querySelectorAll(
    ".card-item-element-container:not(.marked)"
  ).length;
  topCircle.textContent = unmarkedCount.toString();
}

function loadCards(): void {
  const list = document.getElementById("card-list");
  if (!list) return;
  data.forEach((entry, idx) => {
    const card = renderCard(entry);
    const tickIcon = card.querySelector<HTMLImageElement>(
      'img[src*="green-tick.svg"], img[src*="minus-circle.svg"]'
    );
    if (tickIcon) {
      tickIcon.addEventListener("click", function () {
        const currentlyShowingMinusCircle =
          this.src.includes("minus-circle.svg");
        this.src = currentlyShowingMinusCircle
          ? "../icons/green-tick.svg"
          : "../icons/minus-circle.svg";
        card.classList.toggle("marked", currentlyShowingMinusCircle);
        updateNotificationCount("announcement");
      });
    }
    list.appendChild(card);
  });
  updateNotificationCount("announcement");
}

function loadAlertCards(): void {
  const list = document.getElementById("alert-card-list");
  if (!list) return;
  alertData.forEach((entry) => {
    const card = renderAlertsCard(entry);
    const tickIcon = card.querySelector<HTMLImageElement>(
      'img[src*="green-tick.svg"], img[src*="minus-circle.svg"]'
    );
    if (tickIcon) {
      tickIcon.addEventListener("click", function () {
        const currentlyShowingMinusCircle =
          this.src.includes("minus-circle.svg");
        this.src = currentlyShowingMinusCircle
          ? "../icons/green-tick.svg"
          : "../icons/minus-circle.svg";
        card.classList.toggle("marked", currentlyShowingMinusCircle);
        updateNotificationCount("alert");
      });
    }
    list.appendChild(card);
  });
  updateNotificationCount("alert");
}

function showAll(): void {
  alert("Show all clicked");
}

function createNew(): void {
  alert("Create new clicked");
}

const alertData: AlertData[] = [
  {
    message:
      "License for Introduction to Algebra has been assigned to your school",
    tick: false,
    class: false,
    date: "15-Sep-2018",
    time: "07:21 pm",
  },
  {
    message: "Lesson 3 Practice Worksheet overdue for Amy Santiago",
    tick: false,
    course: "Advanced Mathematics",
    class: false,
    date: "15-Sep-2018",
    time: "05:21 pm",
  },
  {
    message: "23 new students created",
    tick: false,
    class: false,
    date: "14-Sep-2018",
    time: "01:21 pm",
  },
  {
    message: "15 submissions ready for evaluation",
    tick: false,
    class: true,
    course: "Basics of Algebra",
    date: "13-Sep-2018",
    time: "01:15 pm",
  },
  {
    message:
      "License for Basic Concepts in Geometry has been assigned to your workspace",
    tick: false,
    class: false,
    date: "15-Sep-2018",
    time: "07:21 pm",
  },
  {
    message: "Lesson 3 Practice Worksheet overdue for Sam Diego",
    tick: false,
    class: false,
    course: "Advanced Mathematics",
    date: "15-Sep-2018",
    time: "05:21 pm",
  },
  {
    message: "15 submissions ready for evaluation",
    tick: false,
    class: true,
    course: "Basics of Algebra",
    date: "13-Sep-2018",
    time: "01:15 pm",
  },
  {
    message:
      "License for Basic Concepts in Geometry has been assigned to your workspace",
    tick: false,
    class: false,
    date: "15-Sep-2018",
    time: "07:21 pm",
  },
  {
    message: "Lesson 3 Practice Worksheet overdue for Sam Diego",
    tick: false,
    class: false,
    course: "Advanced Mathematics",
    date: "15-Sep-2018",
    time: "05:21 pm",
  },
];

function renderAlertsCard(entry: AlertData): HTMLElement {
  const container = document.createElement("div");
  container.className = "card-item-element-container";
  container.innerHTML = `
    <div class="card-item-header">
      <div class="card-item-main-text-container">
        <p class="card-item-main-text">${entry.message}</p>
      </div>
      <div class="tick-container">
        <img src="${
          entry.tick ? "../icons/green-tick.svg" : "../icons/minus-circle.svg"
        }" alt="tick" />
      </div>
    </div>
    ${
      entry.course
        ? `<div class="course-container">
        ${
          entry.class
            ? `<div class="course-text-static">Class:</div>`
            : `<div class="course-text-static">Course:</div>`
        }
        
        <div class="course-text-dynamic" style="color:#222222;font-weight:600;">${
          entry.course
        }</div>
      </div>`
        : ""
    }
    <div class="card-item-footer">
      <div class="files-attached">
        ${
          entry.files && entry.files > 0
            ? `<div class="pin-img-container"><img src="../icons/clip.png" alt="clip" /></div>
        <div class="pin-files-dynamic" style="margin-right: 5px">${entry.files}</div>
        <div class="pin-files-static">files are attached</div>`
            : ""
        }
      </div>
      <div class="card-item-date">
        <div class="dynamic-date" style="margin-right: 5px">${entry.date}</div>
        <div class="static-at" style="margin-right: 5px">at</div>
        <div class="dynamic-time">${entry.time}</div>
      </div>
    </div>
  `;
  return container;
}

window.onload = function () {
  loadCards();
  loadAlertCards();
};
