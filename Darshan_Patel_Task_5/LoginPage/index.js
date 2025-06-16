// RADIO BUTTONS
const radioOptions = document.querySelectorAll(".radio_option");
radioOptions.forEach((option, idx) => {
  option.addEventListener("click", () => {
    radioOptions.forEach((opt, i) => {
      const img = opt.querySelector(".radio_img");
      img.src = "../icons/radio-button-" + (i === idx ? "on" : "off") + ".svg";
    });
  });
});

// CHECKBOX
const checkbox = document.querySelector(".checkbox_img");
checkbox.addEventListener("click", () => {
  if (checkbox.src.includes("checkbox-unchecked.svg")) {
    checkbox.src = "../icons/checkbox-checked.svg";
  } else {
    checkbox.src = "../icons/checkbox-unchecked.svg";
  }
});

// PASSWORD PREVIEW
const passwordInput = document.querySelector(".password_input input");
const previewIcon = document.querySelector(".password_input img");
previewIcon.addEventListener("click", () => {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    previewIcon.src = "../icons/preview.svg"; // Optionally change icon if you have a "hide" icon
  } else {
    passwordInput.type = "password";
    previewIcon.src = "../icons/preview.svg";
  }
});
