document.addEventListener("DOMContentLoaded", function () {
  console.log("FakeChecker Image Verify Loaded");

  const imageInput = document.getElementById("imageInput");
  const fileName = document.getElementById("fileName");
  const uploadBtn = document.getElementById("uploadBtn");
  const verifyBtn = document.getElementById("verifyBtn");
  const newVerificationBtn = document.getElementById("newVerificationBtn");
  const gauge = document.getElementById("gauge");
  const scoreText = document.getElementById("scoreText");
  const resultsList = document.getElementById("resultsList");

  let currentImageBlob = null;

  uploadBtn.addEventListener("click", () => {
    imageInput.value = "";
    imageInput.click();
  });

  imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      currentImageBlob = file;
      fileName.textContent = file.name;
      showNotification("✅ Image uploaded! Click VERIFY", "#2fa06f");
    }
  });

  function setResult(percent, items) {
    gauge.style.setProperty("--percent", percent);
    scoreText.textContent = percent + "%";

    let color = "#2fa06f";
    if (percent > 70) color = "#df4742";
    else if (percent > 40) color = "#f5a623";

    gauge.style.background = `conic-gradient(${color} ${percent}%, #d9d9d9 0)`;
    scoreText.style.color = color;

    resultsList.innerHTML = "";

    let header = document.createElement("li");
    header.style.fontWeight = "bold";
    header.style.listStyle = "none";

    if (percent > 70) {
      header.textContent = "🚨 HIGH SUSPICIOUS IMAGE";
      header.style.color = "#df4742";
    } else if (percent > 40) {
      header.textContent = "⚠️ MODERATE SUSPICIOUS IMAGE";
      header.style.color = "#f5a623";
    } else {
      header.textContent = "✅ LOW SUSPICIOUS IMAGE";
      header.style.color = "#2fa06f";
    }

    resultsList.appendChild(header);
    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      resultsList.appendChild(li);
    });
  }

  verifyBtn.addEventListener("click", async () => {
    if (!currentImageBlob) {
      alert("Please upload an image first / আগে একটি ছবি আপলোড করুন");
      return;
    }

    verifyBtn.innerHTML = "CHECKING...<br>যাচাই হচ্ছে";
    showNotification("🔍 Analyzing image...", "#2f4256");

    try {
      const formData = new FormData();
      formData.append("image", currentImageBlob);

      fetch("imageverifyapi.php",  {
        method: "POST",
        body: formData
      });

      const rawText = await response.text();
      console.log("RAW RESPONSE:", rawText);

      let apiData;
      try {
        apiData = JSON.parse(rawText);
      } catch (e) {
        alert("JSON error. Check console.");
        console.log("JSON ERROR:", e);
        return;
      }

      if (apiData.error) {
        alert(apiData.error);
        return;
      }

      const labels = apiData.labels || [];
      const highConfidenceLabels = apiData.highConfidenceLabels || [];
      const lowerLabels = labels.map((l) => l.toLowerCase());
      const fileNameLower = currentImageBlob.name ? currentImageBlob.name.toLowerCase() : "";

      
      let percent = await analyzeRealImage(currentImageBlob);

     
      percent += (apiData.aiScore || 0);
      percent -= (apiData.realScore || 0);

      let resultItems = [];

      
      if (highConfidenceLabels.length > 0) {
        resultItems.push("🏷️ Detected: " + highConfidenceLabels.slice(0, 6).join(", "));
      } else if (labels.length > 0) {
        resultItems.push("🏷️ Detected (low confidence): " + labels.slice(0, 5).join(", "));
      } else {
        resultItems.push("❓ No strong labels detected from image.");
      }

      
      if (apiData.lowConfidenceCount > apiData.totalTags * 0.6) {
        percent += 10;
        resultItems.push("⚠️ ছবির অধিকাংশ বৈশিষ্ট্য অস্পষ্ট - সম্পাদিত হতে পারে");
      }

      
      if (
        fileNameLower.includes("fake") ||
        fileNameLower.includes("ai") ||
        fileNameLower.includes("edited") ||
        fileNameLower.includes("viral") ||
        fileNameLower.includes("generated") ||
        fileNameLower.includes("breaking")
      ) {
        percent += 25;
        resultItems.push("⚠️ File name contains suspicious words like fake/AI/edited/viral.");
      }

      
      if (
        lowerLabels.includes("text") ||
        lowerLabels.includes("poster") ||
        lowerLabels.includes("advertisement") ||
        lowerLabels.includes("flyer") ||
        lowerLabels.includes("screenshot") ||
        lowerLabels.includes("document")
      ) {
        percent += 20;
        resultItems.push("⚠️ ছবিতে text/poster/screenshot type content পাওয়া গেছে।");
      }

      if (
        lowerLabels.includes("cgi") ||
        lowerLabels.includes("render") ||
        lowerLabels.includes("3d") ||
        lowerLabels.includes("illustration") ||
        lowerLabels.includes("digital art")
      ) {
        percent += 25;
        resultItems.push("🚨 CGI/3D/Digital art বৈশিষ্ট্য পাওয়া গেছে - AI generated হতে পারে");
      }

      if (
        lowerLabels.includes("logo") ||
        lowerLabels.includes("newspaper") ||
        lowerLabels.includes("news")
      ) {
        percent -= 15;
        resultItems.push("✅ Logo/news type element পাওয়া গেছে।");
      }

      if (
        lowerLabels.includes("person") ||
        lowerLabels.includes("human") ||
        lowerLabels.includes("face") ||
        lowerLabels.includes("building") ||
        lowerLabels.includes("sky") ||
        lowerLabels.includes("nature")
      ) {
        percent += 5;
        resultItems.push("📷 ছবিটি normal photo type মনে হচ্ছে, তবে source ছাড়া নিশ্চিত নয়।");
      }

      percent = Math.min(95, Math.max(10, Math.floor(percent)));

      resultItems.push("🔧 API used: Imagga Image Recognition.");
      resultItems.push("📌 Note: This gives suspicious score, not 100% final proof.");

      setResult(percent, resultItems);
      showNotification("✅ Image analysis complete", "#2fa06f");

      let result = percent > 50 ? "FAKE" : "REAL";
      fetch("save_verification.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "type=IMAGE&result=" + result
      });

    } catch (error) {
      alert("Image verification error: " + error.message);
      console.log("FULL ERROR:", error);
    } finally {
      verifyBtn.innerHTML = "VERIFY<br>যাচাই";
    }
  });

  async function analyzeRealImage(blob) {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        URL.revokeObjectURL(url);

        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let colorVariety = 0;
        for (let i = 0; i < data.length; i += 1000) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          colorVariety += Math.abs(r - g) + Math.abs(g - b);
        }

        let percent = 25;
        if (colorVariety < 30000) percent += 20;
        if (blob.size < 20000) percent += 15;
        if (Math.abs(img.width - img.height) < 50) percent += 5;

        resolve(percent);
      };

      img.onerror = () => resolve(60);
      img.src = url;
    });
  }

  newVerificationBtn.addEventListener("click", () => {
    currentImageBlob = null;
    imageInput.value = "";
    fileName.textContent = "ছবি / image";
    setResult(0, ["নতুন ছবি upload করুন", "তারপর Verify বাটনে click করুন"]);
    showNotification("🔄 Ready for new image", "#2f4256");
  });

  const shareBtn = document.querySelector(".pill-btn:first-child");
  if (shareBtn) {
    shareBtn.addEventListener("click", () => {
      const score = scoreText.textContent;
      alert("📢 FAKECHECKER RESULT\n\nImage suspicious score: " + score + "\n\nVerify before sharing.");
    });
  }

  function showNotification(message, bgColor) {
    const oldNotif = document.querySelector(".custom-notification");
    if (oldNotif) oldNotif.remove();

    const notif = document.createElement("div");
    notif.className = "custom-notification";
    notif.textContent = message;
    notif.style.cssText = `
      position: fixed; bottom: 20px; right: 20px;
      background: ${bgColor}; color: white;
      padding: 12px 24px; border-radius: 8px;
      font-weight: bold; z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2); font-size: 14px;
    `;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
  }
});

