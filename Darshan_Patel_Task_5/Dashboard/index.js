const cardData = [
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
    start: "21-Jan-2020",
    end: "21-Aug-2020",
    starred: true,
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
  },
  {
    image: "../images/imageMask-3.png",
    title: "Introduction to Biology: Micro organisms and how they affect...",
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
    start: "14-Oct-2019",
    end: "20-Oct-2020",
    starred: false,
    expired: true,
  },
];

function createCard(card) {
  return `
    <div class="card">
      <div class="card-header">
        <img class="card-image" src="${card.image}" alt="Card image" />
        <div>
          <p class="card-title">${card.title}</p>
          <div class="card-meta">
            ${card.subject} | <span>${card.grade}</span>
            <span class="card-grade">${card.gradePlus}</span>
          </div>
          <div class="card-units">
            <b>${card.units}</b> Units <b>${card.lessons}</b> Lessons <b>${
    card.topics
  }</b> Topics
          </div>
        </div>
        ${
          card.starred
            ? `<img class="card-star" src="../icons/favourite.svg" alt="star" />`
            : ""
        }
      </div>
      <div class="card-dropdown">
        ${
          card.teacher
        } <img src="../icons/arrow-down.svg" style="width:16px;vertical-align:middle;" />
      </div>
      <div class="card-meta">
        ${card.students} Students | ${card.start} - ${card.end}
      </div>
      <div class="card-footer">
        <img class="card-footer-icon" src="../icons/preview.svg" alt="eye" />
        <img class="card-footer-icon" src="../icons/calendar.svg" alt="calendar" />
        <img class="card-footer-icon" src="../icons/grade.svg" alt="star" />
        <img class="card-footer-icon" src="../icons/reports.svg" alt="chart" />
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("cards-container").innerHTML = cardData
    .map(createCard)
    .join("");
});
