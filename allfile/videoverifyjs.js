const videoInput = document.getElementById("videoInput");
const fileName = document.getElementById("fileName");
const uploadBtn = document.getElementById("uploadBtn");
const verifyBtn = document.getElementById("verifyBtn");
const newVerificationBtn = document.getElementById("newVerificationBtn");
const gauge = document.getElementById("gauge");
const scoreText = document.getElementById("scoreText");
const explanationList = document.getElementById("explanationList");

uploadBtn.addEventListener("click", () => {
  videoInput.value = "";
  videoInput.click();
});

videoInput.addEventListener("change", () => {
  if (videoInput.files.length > 0) {
    const file = videoInput.files[0];

    if (file.size > 50 * 1024 * 1024) {
      alert("ভিডিও সাইজ ৫০MB এর বেশি হবে না");
      videoInput.value = "";
      fileName.textContent = "ভিডিও / Video";
      return;
    }

    fileName.textContent = file.name;
  } else {
    fileName.textContent = "ভিডিও / Video";
  }
});

function setResult(percent, explanations) {
  gauge.style.setProperty("--percent", percent);
  scoreText.textContent = percent + "%";

  let color = "#2fa06f";

  if (percent > 70) {
    color = "#df4742";
  } else if (percent > 40) {
    color = "#f5a623";
  }

  gauge.style.background = `conic-gradient(${color} ${percent}%, #d9d9d9 0)`;
  scoreText.style.color = color;

  explanationList.innerHTML = "";

  const header = document.createElement("li");
  header.style.fontWeight = "bold";
  header.style.listStyle = "none";

  if (percent > 70) {
    header.textContent = "🚨 HIGH SUSPICIOUS VIDEO / বেশি সন্দেহজনক ভিডিও";
    header.style.color = "#df4742";
  } else if (percent > 40) {
    header.textContent = "⚠️ MODERATE SUSPICIOUS VIDEO / মাঝারি সন্দেহজনক ভিডিও";
    header.style.color = "#f5a623";
  } else {
    header.textContent = "✅ LOW SUSPICIOUS VIDEO / কম সন্দেহজনক ভিডিও";
    header.style.color = "#2fa06f";
  }

  explanationList.appendChild(header);

  explanations.slice(0, 6).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    explanationList.appendChild(li);
  });
}

verifyBtn.addEventListener("click", async () => {
  if (!videoInput.files.length) {
    alert("Please upload a video first / আগে একটি ভিডিও আপলোড করুন");
    return;
  }

  const file = videoInput.files[0];

  if (file.size > 50 * 1024 * 1024) {
    alert("ভিডিও সাইজ ৫০MB এর বেশি হবে না");
    return;
  }

  verifyBtn.innerHTML = "CHECKING...<br>যাচাই হচ্ছে";

  setResult(0, [
    "⏳ ভিডিও আপলোড হচ্ছে...",
    "🔍 ফ্রেম বিশ্লেষণ চলছে...",
    "⏱️ এটি ১০-৩০ সেকেন্ড সময় নিতে পারে"
  ]);

  try {
    const formData = new FormData();
    formData.append("video", file);

    const response = await fetch("videoverifyapi.php", {
      method: "POST",
      body: formData
    });

    const rawText = await response.text();
    console.log("RAW RESPONSE:", rawText);

    let data;

    try {
      data = JSON.parse(rawText);
    } catch (e) {
      alert("JSON error. Check console.");
      console.log("JSON ERROR:", e);
      console.log("RAW RESPONSE:", rawText);
      return;
    }

    if (data.error) {
      alert("Error: " + data.error);
      return;
    }

    const name = file.name.toLowerCase();
    let score = data.score || 50;

    if (
      name.includes("fake") ||
      name.includes("deepfake") ||
      name.includes("viral") ||
      name.includes("edited") ||
      name.includes("generated")
    ) {
      score = Math.min(95, score + 10);
    }

    const explanations = data.explanations || [];

    if (score > 70) {
      explanations.push(
        "🚨 ব্যাখ্যা: ভিডিওতে সন্দেহজনক বৈশিষ্ট্য বেশি পাওয়া গেছে। Fake/Edited হওয়ার সম্ভাবনা বেশি।"
      );
    } else if (score > 40) {
      explanations.push(
        "⚠️ ব্যাখ্যা: ভিডিওতে কিছু সন্দেহজনক বৈশিষ্ট্য আছে। অন্য source থেকে যাচাই করা ভালো।"
      );
    } else {
      explanations.push(
        "✅ ব্যাখ্যা: ভিডিওতে বড় ধরনের সন্দেহজনক বৈশিষ্ট্য পাওয়া যায়নি। তবে এটি ১০০% final proof নয়।"
      );
    }

    explanations.push("📌 নোট: এটি suspicious score, final proof নয়।");

    setResult(score, explanations);

    const result = score > 50 ? "FAKE" : "REAL";

    try {
      const saveResponse = await fetch("save_verification.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "type=VIDEO&result=" + encodeURIComponent(result)
      });

      const saveText = await saveResponse.text();
      console.log("SAVE RESPONSE:", saveText);
    } catch (saveError) {
      console.log("SAVE ERROR:", saveError);
    }
  } catch (error) {
    alert("Error: " + error.message);
    console.log("FULL ERROR:", error);
  } finally {
    verifyBtn.innerHTML = "VERIFY<br>যাচাই";
  }
});

newVerificationBtn.addEventListener("click", () => {
  videoInput.value = "";
  fileName.textContent = "ভিডিও / Video";

  setResult(0, [
    "নতুন ভিডিও upload করুন",
    "তারপর Verify বাটনে click করুন"
  ]);
});