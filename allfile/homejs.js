const textBtn = document.getElementById("textBtn");
const imageBtn = document.getElementById("imageBtn");
const videoBtn = document.getElementById("videoBtn");
const sourceBtn = document.getElementById("sourceBtn");
const loginBtn = document.getElementById("loginBtn");
const createBtn = document.getElementById("createBtn");

if (textBtn) {
  textBtn.addEventListener("click", () => {
    window.location.href = "textverify.html";
  });
}

if (imageBtn) {
  imageBtn.addEventListener("click", () => {
    window.location.href = "imageverify.html";
  });
}

if (videoBtn) {
  videoBtn.addEventListener("click", () => {
    window.location.href = "videoverify.html";
  });
}

if (sourceBtn) {
  sourceBtn.addEventListener("click", () => {
    window.location.href = "sourcefind.html";
  });
}

if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    window.location.href = "login.html";
  });
}

if (createBtn) {
  createBtn.addEventListener("click", () => {
    window.location.href = "createaccount.html";
  });
}