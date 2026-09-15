/* =====================================================
   AGILITY UNITED
   JADWAL - GOOGLE SHEET
   ===================================================== */


/* ================= GOOGLE SHEET ================= */

/*
   Ganti URL di bawah dengan
   Published CSV Google Sheet kamu.
*/

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRYZD-UuIIvYNuWTeV9kAC0RfbsnwhA1pXhcPohfbY5EYD5G-65o8y8JhSqG1c_ZVyApZhKxwwEjoo2/pub?output=csv";


/* ================= ELEMENT ================= */

const scheduleBody =
  document.getElementById("scheduleBody");

const scheduleMobile =
  document.getElementById("scheduleMobile");

const emptyState =
  document.getElementById("emptyState");


/* =====================================================
   CSV PARSER
   ===================================================== */

function parseCSV(text) {

  const rows = [];

  let row = [];

  let value = "";

  let insideQuotes = false;


  for (let i = 0; i < text.length; i++) {

    const char = text[i];

    const nextChar = text[i + 1];


    /* Quote */

    if (char === '"' && insideQuotes && nextChar === '"') {

      value += '"';

      i++;

      continue;

    }


    if (char === '"') {

      insideQuotes = !insideQuotes;

      continue;

    }


    /* Comma */

    if (char === "," && !insideQuotes) {

      row.push(value.trim());

      value = "";

      continue;

    }


    /* New line */

    if (
      (char === "\n" || char === "\r") &&
      !insideQuotes
    ) {

      if (value !== "" || row.length > 0) {

        row.push(value.trim());

        rows.push(row);

        row = [];

        value = "";

      }

      continue;

    }


    value += char;

  }


  /* Last row */

  if (value !== "" || row.length > 0) {

    row.push(value.trim());

    rows.push(row);

  }


  return rows;

}


/* =====================================================
   CLEAN HEADER
   ===================================================== */

function cleanHeader(header) {

  return header
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/_/g, "");

}


/* =====================================================
   LOAD SCHEDULE
   ===================================================== */

async function loadSchedule() {

  try {

    if (
      !SHEET_URL ||
      SHEET_URL === "PASTE_LINK_GOOGLE_SHEET_DISINI"
    ) {

      showError(
        "Google Sheet belum dihubungkan."
      );

      return;

    }


    const response =
      await fetch(SHEET_URL);


    if (!response.ok) {

      throw new Error(
        "Google Sheet tidak dapat diakses."
      );

    }


    const text =
      await response.text();


    const rows =
      parseCSV(text);


    if (rows.length <= 1) {

      showEmpty();

      return;

    }


    /* Header */

    const headers =
      rows[0].map(cleanHeader);


    /* Convert rows */

    const schedules =
      rows
        .slice(1)
        .map(row => {

          const data = {};

          headers.forEach(
            (header, index) => {

              data[header] =
                row[index] || "";

            }
          );

          return data;

        })
        .filter(item => {

          return (
            item.hari ||
            item.tanggal ||
            item.jam ||
            item.squad
          );

        });


    if (schedules.length === 0) {

      showEmpty();

      return;

    }


    renderDesktop(schedules);

    renderMobile(schedules);

  }

  catch (error) {

    console.error(
      "Schedule Error:",
      error
    );

    showError(
      "Gagal mengambil data jadwal dari Google Sheet."
    );

  }

}


/* =====================================================
   DESKTOP TABLE
   ===================================================== */

function renderDesktop(schedules) {

  scheduleBody.innerHTML = "";


  schedules.forEach(schedule => {

    const row =
      document.createElement("tr");


    row.innerHTML = `

      <td>
        ${escapeHTML(schedule.hari)}
      </td>

      <td>
        ${escapeHTML(schedule.tanggal)}
      </td>

      <td>
        <span class="match-time">
          ${escapeHTML(schedule.jam)}
        </span>
      </td>

      <td>
        <span class="squad-name">
          ${escapeHTML(schedule.squad)}
        </span>
      </td>

      <td>
        <span class="match-type">
          ${escapeHTML(schedule.jenis)}
        </span>
      </td>

      <td>
        <span class="opponent">
          ${escapeHTML(schedule.lawan)}
        </span>
      </td>

    `;


    scheduleBody.appendChild(row);

  });

}


/* =====================================================
   MOBILE CARDS
   ===================================================== */

function renderMobile(schedules) {

  scheduleMobile.innerHTML = "";


  schedules.forEach(schedule => {

    const card =
      document.createElement("div");


    card.className =
      "schedule-card";


    card.innerHTML = `

      <div class="schedule-card-top">

        <span class="card-date">

          ${escapeHTML(schedule.hari)}
          ·
          ${escapeHTML(schedule.tanggal)}

        </span>

        <span class="match-type">

          ${escapeHTML(schedule.jenis)}

        </span>

      </div>


      <div class="match-versus">

        <div class="team">

          ${escapeHTML(schedule.squad)}

        </div>


        <div class="vs">

          VS

        </div>


        <div class="team">

          ${escapeHTML(schedule.lawan)}

        </div>

      </div>


      <div class="schedule-card-bottom">

        <span>

          🕒 ${escapeHTML(schedule.jam)}

        </span>

        <span>

          ${escapeHTML(schedule.jenis)}

        </span>

      </div>

    `;


    scheduleMobile.appendChild(card);

  });

}


/* =====================================================
   EMPTY
   ===================================================== */

function showEmpty() {

  scheduleBody.innerHTML = "";

  scheduleMobile.innerHTML = "";

  emptyState.style.display =
    "block";

}


/* =====================================================
   ERROR
   ===================================================== */

function showError(message) {

  scheduleBody.innerHTML = `

    <tr>

      <td colspan="6" class="loading">

        ${message}

      </td>

    </tr>

  `;


  scheduleMobile.innerHTML = `

    <div class="loading-card">

      ${message}

    </div>

  `;

}


/* =====================================================
   SECURITY
   ===================================================== */

function escapeHTML(value) {

  return String(value || "")

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");

}


/* =====================================================
   MOBILE NAVBAR
   ===================================================== */

const menuToggle =
  document.getElementById("menuToggle");

const navMenu =
  document.getElementById("navMenu");


if (menuToggle && navMenu) {

  menuToggle.addEventListener(
    "click",
    () => {

      navMenu.classList.toggle("show");

    }
  );

}


/* =====================================================
   START
   ===================================================== */

loadSchedule();
