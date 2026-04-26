const verifyBtn = document.getElementById("verifyBtn");
const newVerificationBtn = document.getElementById("newVerificationBtn");
const newsInput = document.getElementById("newsInput");
const gauge = document.getElementById("gauge");
const scoreText = document.getElementById("scoreText");
const explanationList = document.getElementById("explanationList");

function setResult(percent, explanations) {
  gauge.style.setProperty("--percent", percent);
  scoreText.textContent = `${percent}%`;

  explanationList.innerHTML = "";

  explanations.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    explanationList.appendChild(li);
  });
}

function saveVerification(type, result) {
  fetch("save_verification.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "type=" + type + "&result=" + result
  });
}

verifyBtn.addEventListener("click", async () => {
  const inputText = newsInput.value.trim();

  if (inputText === "") {
    alert("Please paste some text first / আগে কিছু টেক্সট পেস্ট করুন");
    return;
  }

  verifyBtn.innerHTML = "CHECKING...<br>যাচাই হচ্ছে";

  try {
    const formData = new FormData();
    formData.append("text", inputText);

    const response = await fetch("textverifyapi.php", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    setResult(data.score, data.explanations);

    
    let result = data.score > 50 ? "FAKE" : "REAL";
    saveVerification("TEXT", result);

  } catch (error) {
    alert("API error. Please check server/API key.");
    console.error(error);
  } finally {
    verifyBtn.innerHTML = "VERIFY<br>যাচাই";
  }
});

newVerificationBtn.addEventListener("click", () => {
  newsInput.value = "";

  setResult(0, [
    "নতুন টেক্সট পেস্ট করুন",
    "তারপর Verify বাটনে ক্লিক করুন"
  ]);
});