/* =========================
   FIND MY TABLE
========================= */

async function findTable() {
  const firstInput = document.getElementById("firstName").value.trim().toLowerCase();
  const lastInput  = document.getElementById("lastName").value.trim().toLowerCase();
  const out = document.getElementById("tableResult");
  out.parentElement.style.display = "block";

  if (!firstInput && !lastInput) {
    out.innerHTML = "Please enter at least a first or last name.";
    return;
  }

  const SHEET_ID = "1ADmvt0LnQuTcGZkcs4I8hFmMePy5Ze9vwE9m8OL9-Bo";
  const SHEET_NAME = "Sheet1";
  const url = `https://opensheet.elk.sh/${SHEET_ID}/${SHEET_NAME}`;

  try {
    const response = await fetch(url);
    const rows = await response.json();

    const guests = rows.map(r => ({
      first: (r["First Name"] || "").trim().toLowerCase(),
      last:  (r["Last Name"]  || "").trim().toLowerCase(),
      table: (r["Table #"]    || "").trim()
    }));

    let match = null;

    if (firstInput && lastInput) {
      match = guests.find(g => g.first === firstInput && g.last === lastInput);
    }

    if (!match && lastInput) {
      match = guests.find(g => g.last === lastInput);
    }

    if (match) {
      out.innerHTML = `You are seated at <b>Table ${match.table}</b>.`;
    } else {
      out.innerHTML = `
        Sorry — we couldn’t find that name.<br>
        Please check spelling or see a host.
      `;
    }

  } catch (err) {
    out.innerHTML = "Error loading seating data. Please try again.";
    console.error(err);
  }
}


/* =========================
   DIGITAL GUESTBOOK
========================= */

async function submitGuestbook() {
  const name = document.getElementById("gbName").value.trim();
  const message = document.getElementById("gbMessage").value.trim();
  const out = document.getElementById("gbResult");
  out.parentElement.style.display = "block";

  if (!message) {
    out.innerHTML = "Please write a message before submitting.";
    return;
  }

  const GUESTBOOK_URL =
    "https://script.google.com/macros/s/AKfycbxOpOc8PAmRvxHK3vQTCGbcIDkRc3_hNYTJ6YGKpuunKIm_xr3vdvFaPmm-XwWkRDmS/exec";

  try {
    await fetch(GUESTBOOK_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, message })
    });

    out.innerHTML = "Thank you for your message! 💌";
    document.getElementById("gbName").value = "";
    document.getElementById("gbMessage").value = "";

  } catch (err) {
    out.innerHTML = "Error submitting message. Please try again.";
    console.error(err);
  }
}


/* =========================
   UPLOAD COUNTER (PHOTOS)
========================= */

const PHOTO_UPLOAD_WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycby7xx90tUy6-X0kKx6cXtBlTL99Ie7z_32n9-ss_ln9DBJmE-i3FRqmKZbgcLp6odP4/exec";

async function loadUploadCounter() {
  try {
    const el = document.getElementById("uploadCounter");
    if (!el) return;

    const res = await fetch(PHOTO_UPLOAD_WEBAPP_URL);
    const data = await res.json();

    const n = Number(data.count ?? 0);
    el.innerHTML = `📸 <b>${n}</b> ${n === 1 ? "photo" : "photos"} shared so far!`;
  } catch (err) {
    console.error("Counter load failed", err);
  }
}


/* =========================
   PHOTO UPLOADS
========================= */

document.addEventListener("DOMContentLoaded", () => {
  // Only affects pages that have the counter element
  loadUploadCounter();

  const form = document.getElementById("photoForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById("photoInput");
    const resultBox = document.getElementById("photoResult");
    const container = document.getElementById("photoResultContainer");

    container.style.display = "block";
    resultBox.innerHTML = "Uploading… ⏳";

    const file = fileInput.files[0];
    if (!file) {
      resultBox.innerHTML = "Please select a file.";
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result.split(",")[1];

      try {
        await fetch(PHOTO_UPLOAD_WEBAPP_URL, {
          method: "POST",
          mode: "no-cors",
          body: new URLSearchParams({
            file: base64,
            filename: `${Date.now()}_${file.name}`,
            mimeType: file.type
          })
        });

        resultBox.innerHTML = "Upload successful! 📸 Thank you!";
        fileInput.value = "";

        // Refresh counter after each upload
        loadUploadCounter();

      } catch (err) {
        resultBox.innerHTML = "Upload failed. Please try again.";
        console.error(err);
      }
    };

    reader.readAsDataURL(file);
  });
});

