const sourceInput = document.getElementById("sourceInput");
const verifyBtn = document.getElementById("verifyBtn");
const searchBtn = document.getElementById("searchBtn");
const newVerificationBtn = document.getElementById("newVerificationBtn");

const trustedBar = document.getElementById("trustedBar");
const suspiciousBar = document.getElementById("suspiciousBar");
const unknownBar = document.getElementById("unknownBar");
const sourceList = document.getElementById("sourceList");

function updateBar(bar, value) {
  bar.style.height = value + "%";
  bar.textContent = value + "%";
}

function updateSources(items) {
  sourceList.innerHTML = "";

  items.forEach(function (item) {
    const li = document.createElement("li");
    li.textContent = item;
    sourceList.appendChild(li);
  });
}

async function runVerification() {
  const input = sourceInput.value.trim();

  if (input === "") {
    alert("Please paste a news link first / আগে একটি নিউজ লিংক দিন");
    return;
  }

  verifyBtn.innerHTML = "CHECKING...<br>যাচাই হচ্ছে";

  try {
    const formData = new FormData();
    formData.append("source", input);


    const response = await fetch("/fakecheckeruniproject/allfile/sourceveifyapi.php", {
      method: "POST",
      body: formData
    });


    const rawText = await response.text();
    console.log("PHP RAW RESPONSE:", rawText);

    let data;

    try {
      data = JSON.parse(rawText);
    } catch (jsonError) {
      alert("PHP JSON error. Check console.");
      console.log("JSON ERROR:", jsonError);
      console.log("RAW RESPONSE:", rawText);
      return;
    }

    if (data.error) {
      alert(data.error);
      return;
    }

    updateBar(trustedBar, data.trusted);
    updateBar(suspiciousBar, data.suspicious);
    updateBar(unknownBar, data.unknown);
    updateSources(data.sources);


   
    let result;

    if (data.suspicious > data.trusted) {
      result = "FAKE";
    } else {
      result = "REAL";
    }

    
    fetch("save_verification.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "type=SOURCE&result=" + result
    });








  } catch (error) {
    alert("Real error: " + error.message);
    console.log("FULL ERROR:", error);
  } finally {
    verifyBtn.innerHTML = "VERIFY<br>যাচাই";
  }
}

verifyBtn.addEventListener("click", runVerification);

if (searchBtn) {
  searchBtn.addEventListener("click", runVerification);
}

newVerificationBtn.addEventListener("click", function () {
  sourceInput.value = "";

  updateBar(trustedBar, 40);
  updateBar(suspiciousBar, 60);
  updateBar(unknownBar, 80);

  updateSources([
    "নতুন source link দিন",
    "তারপর Verify বাটনে ক্লিক করুন"
  ]);


});