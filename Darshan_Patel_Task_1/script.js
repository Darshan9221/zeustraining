document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    let errors = [];
    let firstErrorInput = null;
    const nameInput = form.querySelector(".name__container input");
    const commentsInput = form.querySelector(".comments__container textarea");
    const genderInputs = form.querySelectorAll('input[name="gender"]');
    const name = nameInput.value.trim();
    const comments = commentsInput.value.trim();
    const genderChecked = form.querySelector('input[name="gender"]:checked');

    if (!name) {
      errors.push("Name is required.");
      if (!firstErrorInput) firstErrorInput = nameInput;
    }
    if (!comments) {
      errors.push("Comments are required.");
      if (!firstErrorInput) firstErrorInput = commentsInput;
    }
    if (!genderChecked) {
      errors.push("Please select your gender.");
      if (!firstErrorInput) firstErrorInput = genderInputs[0];
    }

    if (errors.length > 0) {
      alert(errors.join("\n"));
      if (firstErrorInput)
        firstErrorInput.focus({
          focusVisible: true,
        });
    }
    if (errors.length === 0) {
      alert("Form submitted successfully!");
      location.reload();
    }
  });
});
