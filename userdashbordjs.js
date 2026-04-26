const videoInput = document.getElementById("videoInput");
const verifyBtn = document.getElementById("verifyBtn");

verifyBtn.addEventListener("click", async () => {
  const file = videoInput.files[0];

  if (!file) {
    alert("Upload video first!");
    return;
  }

  const formData = new FormData();
  formData.append("video", file);

  document.getElementById("scoreText").innerText = "Checking...";

  const res = await fetch("verify_video.php", {
    method: "POST",
    body: formData
  });

  const data = await res.json();

  
  document.getElementById("scoreText").innerText = data.score + "%";
  document.getElementById("gauge").style.setProperty("--percent", data.score);

  
  const list = document.getElementById("explanationList");
  list.innerHTML = "";

  data.explanations.slice(0, 4).forEach(text => {
    const li = document.createElement("li");
    li.textContent = text;
    list.appendChild(li);
  });
});