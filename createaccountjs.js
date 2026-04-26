const createForm = document.getElementById("createForm");

createForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

  if (name === "" || email === "" || password === "" || confirmPassword === "") {
    alert("Please fill in all fields / সব ঘর পূরণ করুন");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match / পাসওয়ার্ড মিলছে না");
    return;
  }

  alert("Account created successfully / অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে");
});