/* =====================================================
   AGILITY UNITED
   JADWAL - GOOGLE SHEET
   ===================================================== */


/* =====================================================
   GOOGLE SHEET
   ===================================================== */

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRYZD-UuIIvYNuWTeV9kAC0RfbsnwhA1pXhcPohfbY5EYD5G-65o8y8JhSqG1c_ZVyApZhKxwwEjoo2/pub?output=csv";


/* =====================================================
   ELEMENT
   ===================================================== */

const scheduleBody = document.getElementById("scheduleBody");
const scheduleMobile = document.getElementById("scheduleMobile");
const emptyState = document.getElementById("emptyState");


/* =====================================================
   SEARCH VARIABLE
   ===================================================== */

let allSchedules = [];
let scheduleSearchInput = null;


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

    // Double quote di dalam quote
    if (char === '"' && insideQuotes && nextChar === '"') {
      value += '"';
      i++;
      continue;
    }

    // Awal / akhir quote
    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    // Pemisah kolom
    if (char === "," && !insideQuotes) {
      row.push(value.trim());
      value = "";
      continue;
    }

    // Baris baru
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

  // Data terakhir
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

  return String(header || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/_/g, "");
}


/* =====================================================
   CREATE SEARCH BOX
   ===================================================== */

function createScheduleSearch() {

  const searchWrapper = document.createElement("div");

  searchWrapper.className = "schedule-search-wrapper";

  searchWrapper.innerHTML = `
    <div class="schedule-search">

      <span class="schedule-search-icon">
        🔍
      </span>

      <input
        type="text"
        id="scheduleSearch"
        placeholder="Cari squad, lawan, atau hari..."
        autocomplete="off"
      >

      <button
        type="button"
        id="clearScheduleSearch"
        class="clear-search"
        aria-label="Clear search"
      >
        ×
      </button>

    </div>
  `;


  /* =================================================
     CARI POSISI SECTION JADWAL
     ================================================= */

  const scheduleSection =
    document.querySelector(".schedule-section");


  if (scheduleSection) {

    const heading =
      scheduleSection.querySelector(".section-heading");


    if (heading) {

      heading.insertAdjacentElement(
        "afterend",
        searchWrapper
      );

    } else {

      scheduleSection.prepend(searchWrapper);

    }

  } else {

    /*
      Jika .schedule-section tidak ditemukan,
      coba cari tabel jadwal.
    */

    const table =
      document.querySelector(".schedule-table");


    if (table && table.parentElement) {

      table.parentElement.insertBefore(
        searchWrapper,
        table
      );

    } else {

      /*
        Jika semuanya tidak ditemukan,
        masukkan ke awal body.
      */

      document.body.prepend(searchWrapper);

    }
  }


  /* =================================================
     AMBIL ELEMENT SEARCH
     ================================================= */

  scheduleSearchInput =
    document.getElementById("scheduleSearch");

  const clearButton =
    document.getElementById("clearScheduleSearch");


  if (!scheduleSearchInput) {
    console.error("Search jadwal tidak ditemukan.");
    return;
  }


  /* =================================================
     EVENT SEARCH
     ================================================= */

  scheduleSearchInput.addEventListener(
    "input",
    function () {

      const keyword =
        this.value.trim().toLowerCase();


      // Tampilkan tombol X jika ada teks
      if (clearButton) {

        clearButton.style.display =
          keyword ? "block" : "none";

      }


      filterAndRenderSchedules(keyword);

    }
  );


  /* =================================================
     EVENT CLEAR
     ================================================= */

  if (clearButton) {

    clearButton.addEventListener(
      "click",
      function () {

        scheduleSearchInput.value = "";

        clearButton.style.display = "none";

        filterAndRenderSchedules("");

        scheduleSearchInput.focus();

      }
    );
  }
}


/* =====================================================
   FILTER SCHEDULE
   ===================================================== */

function filterAndRenderSchedules(keyword) {

  const filteredSchedules =
    allSchedules.filter(schedule => {

      const hari =
        String(schedule.hari || "")
          .toLowerCase();

      const squad =
        String(schedule.squad || "")
          .toLowerCase();

      const lawan =
        String(schedule.lawan || "")
          .toLowerCase();


      /*
        Search berdasarkan:
        - Hari
        - Squad
        - Lawan
      */

      return (
        hari.includes(keyword) ||
        squad.includes(keyword) ||
        lawan.includes(keyword)
      );

    });


  /* =================================================
     JIKA TIDAK ADA HASIL
     ================================================= */

  if (filteredSchedules.length === 0) {

    showSearchEmpty();

    return;
  }


  /* =================================================
     ADA HASIL
     ================================================= */

  if (emptyState) {
    emptyState.style.display = "none";
  }


  renderDesktop(filteredSchedules);

  renderMobile(filteredSchedules);
}


/* =====================================================
   LOAD SCHEDULE
   ===================================================== */

async function loadSchedule() {

  try {

    /* ===============================================
       CEK GOOGLE SHEET
       =============================================== */

    if (
      !SHEET_URL ||
      SHEET_URL ===
      "PASTE_LINK_GOOGLE_SHEET_DISINI"
    ) {

      showError(
        "Google Sheet belum dihubungkan."
      );

      return;
    }


    /* ===============================================
       FETCH GOOGLE SHEET
       =============================================== */

    const response =
      await fetch(
        SHEET_URL + "&t=" + Date.now()
      );


    if (!response.ok) {

      throw new Error(
        "Google Sheet tidak dapat diakses."
      );

    }


    const text =
      await response.text();


    /* ===============================================
       PARSE CSV
       =============================================== */

    const rows =
      parseCSV(text);


    if (rows.length <= 1) {

      showEmpty();

      return;
    }


    /* ===============================================
       HEADER
       =============================================== */

    const headers =
      rows[0].map(cleanHeader);


    console.log(
      "Schedule Headers:",
      headers
    );


    /* ===============================================
       BUAT DATA SCHEDULE
       =============================================== */

    const schedules = rows
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
          item.squad ||
          item.jenis ||
          item.lawan
        );

      });


    /* ===============================================
       CEK DATA
       =============================================== */

    if (schedules.length === 0) {

      showEmpty();

      return;
    }


    /* ===============================================
       SIMPAN DATA UNTUK SEARCH
       =============================================== */

    allSchedules = schedules;


    /* ===============================================
       RENDER AWAL
       =============================================== */

    filterAndRenderSchedules("");


  } catch (error) {

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

  if (!scheduleBody) {
    return;
  }


  scheduleBody.innerHTML = "";


  schedules.forEach(
    schedule => {

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

    }
  );
}


/* =====================================================
   MOBILE CARDS
   ===================================================== */

function renderMobile(schedules) {

  if (!scheduleMobile) {
    return;
  }


  scheduleMobile.innerHTML = "";


  schedules.forEach(
    schedule => {

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

    }
  );
}


/* =====================================================
   EMPTY DATA
   ===================================================== */

function showEmpty() {

  if (scheduleBody) {
    scheduleBody.innerHTML = "";
  }


  if (scheduleMobile) {
    scheduleMobile.innerHTML = "";
  }


  if (emptyState) {

    emptyState.innerHTML = `
      <div class="empty-message">
        Belum ada jadwal.
      </div>
    `;

    emptyState.style.display = "block";
  }
}


/* =====================================================
   EMPTY SEARCH RESULT
   ===================================================== */

function showSearchEmpty() {

  if (scheduleBody) {

    scheduleBody.innerHTML = `

      <tr>

        <td
          colspan="6"
          class="loading"
        >

          Jadwal tidak ditemukan.

        </td>

      </tr>

    `;
  }


  if (scheduleMobile) {

    scheduleMobile.innerHTML = `

      <div class="loading-card">

        Jadwal tidak ditemukan.

      </div>

    `;
  }


  if (emptyState) {

    emptyState.style.display = "none";

  }
}


/* =====================================================
   ERROR
   ===================================================== */

function showError(message) {

  if (scheduleBody) {

    scheduleBody.innerHTML = `

      <tr>

        <td
          colspan="6"
          class="loading"
        >

          ${escapeHTML(message)}

        </td>

      </tr>

    `;
  }


  if (scheduleMobile) {

    scheduleMobile.innerHTML = `

      <div class="loading-card">

        ${escapeHTML(message)}

      </div>

    `;
  }
}


/* =====================================================
   SECURITY
   ===================================================== */

function escapeHTML(value) {

  return String(value || "")

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );
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

      navMenu.classList.toggle(
        "show"
      );

    }
  );

}


/* =====================================================
   START
   ===================================================== */

createScheduleSearch();

loadSchedule();
