const logoutBtn = document.getElementById("logoutBtn");
const menuItems = document.querySelectorAll(".dash-item");

logoutBtn.addEventListener("click", () => {
  alert("Admin logged out / অ্যাডমিন লগআউট হয়েছে");
});

menuItems.forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();

    menuItems.forEach((link) => link.classList.remove("active"));
    item.classList.add("active");
  });
});