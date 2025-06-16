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
    ${card.expired ? `<div class="expired-tag">EXPIRED</div>` : ""}
      <div class="card-header">
      <div class="card-image-container">
    
        <img class="card-image" src="${card.image}" alt="Card image" />
      </div>
        <div>
          <p class="card-title" style="font-weight: 600">${card.title}</p>
          <div class="card-meta" style="font-weight: 600">
            ${card.subject} | <span style="font-weight: 600">${
    card.grade
  }</span>
            <span class="card-grade" style="font-weight: 600">${
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
              : ""
          }
       <div class="dropdown_input_2">
                <div class="dropdown_options_2">
                  <select
                    style="font-weight: 600;"
                    name="teacher"
                    id="teacher"
                  >
                    <option value="course name">${card.teacher}</option>
                    <option value="duration">Test</option>
                  </select>
                  <img src="../icons/arrow-down.svg" alt="" />
                </div>
              </div>        <div class="card-meta" style="font-weight: 600;color:#666666;font-size:12px">
        ${card.students ? `${card.students} Students` : ""} ${
    card.start && card.end ? `| ${card.start} - ${card.end}` : ""
  }
        </div>
        </div>
        </div>
      <div class="card-footer" style=" width: 428px;">
        <img class="card-footer-icon" style="margin-left:24px" src="../icons/preview.svg" alt="eye" />
        <img class="card-footer-icon" style="width:18px;height:20px;" src="../icons/calendar.svg" alt="calendar" />
        <img class="card-footer-icon" style="width:18px;height:20px;" src="../icons/grade.svg" alt="star" />
        <img class="card-footer-icon" style="margin-right:24px" src="../icons/reports.svg" alt="chart" />
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("cards-container").innerHTML = cardData
    .map(createCard)
    .join("");
});
