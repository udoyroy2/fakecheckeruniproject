document.addEventListener("DOMContentLoaded", function () {

  
  fetch("getuser.php")
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        document.getElementById("dashboardName").textContent = "Not logged in";
        document.getElementById("dashboardEmail").textContent = "Not logged in";
      } else {
        document.getElementById("dashboardName").textContent = data.full_name || "N/A";
        document.getElementById("dashboardEmail").textContent = data.email || "N/A";
      }
    })
    .catch(() => {
      document.getElementById("dashboardName").textContent = "Error loading";
      document.getElementById("dashboardEmail").textContent = "Error loading";
    });

  
  fetch("gethistory.php")
    .then(res => res.json())
    .then(data => {
      const tbody = document.getElementById("historyTableBody");
      tbody.innerHTML = "";

      let totalCount = 0;
      let fakeCount = 0;
      let realCount = 0;

      if (!data || data.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="4" style="text-align:center; padding:20px; color:#888;">
              কোনো verification history নেই
            </td>
          </tr>`;
        updateStats(0, 0, 0);
        return;
      }

      data.forEach((row, index) => {
        totalCount++;

        if (row.result === "FAKE") fakeCount++;
        else if (row.result === "REAL") realCount++;

       
        const date = new Date(row.created_at);
        const formattedDate = date.toLocaleDateString("en-GB") + " " +
          date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

        
        const resultColor = row.result === "FAKE" ? "#df4742" : "#2fa06f";
        const resultIcon = row.result === "FAKE" ? "🚨" : "✅";

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${row.content_type || "N/A"}</td>
          <td>${formattedDate}</td>
          <td>
            <span style="
              color: ${resultColor};
              font-weight: bold;
              background: ${resultColor}22;
              padding: 4px 10px;
              border-radius: 12px;
            ">
              ${resultIcon} ${row.result}
            </span>
          </td>
          <td>
            <button onclick="deleteRow(${row.id}, this)" style="
              background: #df4742;
              color: white;
              border: none;
              padding: 4px 12px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 12px;
            ">Delete</button>
          </td>
        `;

        tbody.appendChild(tr);
      });

      updateStats(totalCount, fakeCount, realCount);
    })
    .catch(() => {
      document.getElementById("historyTableBody").innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center; color:red;">
            History load failed
          </td>
        </tr>`;
    });

  
  function updateStats(total, fake, real) {
    document.getElementById("totalCount").textContent = total;
    document.getElementById("fakeCount").textContent = fake;
    document.getElementById("realCount").textContent = real;
  }

  
  window.deleteRow = function (id, btn) {
    if (!confirm("এই record মুছে ফেলবেন?")) return;

    fetch("deletehistory.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "id=" + id
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Remove row from table
          btn.closest("tr").remove();
        } else {
          alert("Delete failed!");
        }
      });
  };

 
  const newVerificationBtn = document.getElementById("newVerificationBtn");
  if (newVerificationBtn) {
    newVerificationBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }

  
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      fetch("logout.php")
        .then(() => {
          window.location.href = "index.html";
        });
    });
  }

});