/* =========================================
   GOOGLE SHEET CONFIGURATION
========================================= */

/*
    GOOGLE SHEET HARUS MEMPUNYAI KOLOM:

    Gambar
    Judul Kompetisi
    Keterangan
*/

const SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQwhYm4gTk3_3bhG0V87-wPBcY-0aCrutG61O36WPgZ1AJaNNGShvMiizLdKCm5kWDVVidjVuElZiCm/pub?output=csv";


/* =========================================
   VARIABLES
========================================= */

let achievements = [];


const achievementContainer =
    document.getElementById("achievementContainer");


const achievementDescription =
    document.getElementById("achievementDescription");


const menuToggle =
    document.getElementById("menuToggle");


const navMenu =
    document.getElementById("navMenu");


const modal =
    document.getElementById("achievementModal");


const modalImage =
    document.getElementById("modalImage");


const modalTitle =
    document.getElementById("modalTitle");


const modalDescription =
    document.getElementById("modalDescription");


const modalClose =
    document.getElementById("modalClose");


/* =========================================
   MOBILE NAVBAR
========================================= */

if (menuToggle && navMenu) {

    menuToggle.addEventListener(
        "click",
        function () {

            navMenu.classList.toggle("show");

        }
    );

}


/* =========================================
   NORMALIZE TEXT
========================================= */

function normalizeText(value) {

    if (!value) {

        return "";

    }

    return String(value)
        .trim()
        .replace(/\s+/g, " ");

}


/* =========================================
   GOOGLE DRIVE IMAGE URL
========================================= */

/*
    Fungsi ini mengubah link Google Drive biasa:

    https://drive.google.com/file/d/FILE_ID/view

    menjadi:

    https://drive.google.com/uc?export=view&id=FILE_ID
*/

function convertDriveImageURL(url) {

    if (!url) {

        return "";

    }


    url = String(url).trim();


    /*
        FORMAT 1

        https://drive.google.com/file/d/FILE_ID/view
    */

    let match = url.match(
        /drive\.google\.com\/file\/d\/([^/]+)/
    );


    if (match) {

        return `https://drive.google.com/uc?export=view&id=${match[1]}`;

    }


    /*
        FORMAT 2

        https://drive.google.com/open?id=FILE_ID
    */

    match = url.match(
        /drive\.google\.com\/open\?id=([^&]+)/
    );


    if (match) {

        return `https://drive.google.com/uc?export=view&id=${match[1]}`;

    }


    /*
        FORMAT 3

        Jika sudah menggunakan:

        uc?export=view&id=...
    */

    if (
        url.includes(
            "drive.google.com/uc"
        )
    ) {

        return url;

    }


    /*
        Bukan Google Drive

        Misalnya:

        https://example.com/image.jpg
    */

    return url;

}


/* =========================================
   FIND COLUMN
========================================= */

function findColumn(
    headers,
    possibleNames
) {

    for (
        const name of possibleNames
    ) {

        const index =
            headers.findIndex(

                header =>

                    normalizeText(header)
                        .toLowerCase()

                    ===

                    normalizeText(name)
                        .toLowerCase()

            );


        if (index !== -1) {

            return index;

        }

    }


    return -1;

}


/* =========================================
   CSV PARSER
========================================= */

function parseCSV(text) {

    const rows = [];

    let row = [];

    let value = "";

    let insideQuotes = false;


    for (
        let i = 0;
        i < text.length;
        i++
    ) {

        const char =
            text[i];

        const next =
            text[i + 1];


        /* =========================
           QUOTES
        ========================= */

        if (char === '"') {

            if (
                insideQuotes &&
                next === '"'
            ) {

                value += '"';

                i++;

            }

            else {

                insideQuotes =
                    !insideQuotes;

            }

        }


        /* =========================
           COMMA
        ========================= */

        else if (
            char === "," &&
            !insideQuotes
        ) {

            row.push(value);

            value = "";

        }


        /* =========================
           NEW LINE
        ========================= */

        else if (

            (
                char === "\n" ||
                char === "\r"
            )

            &&

            !insideQuotes

        ) {

            if (
                char === "\r" &&
                next === "\n"
            ) {

                i++;

            }


            row.push(value);


            if (row.length > 0) {

                rows.push(row);

            }


            row = [];

            value = "";

        }


        else {

            value += char;

        }

    }


    /* =========================
       LAST ROW
    ========================= */

    if (
        value ||
        row.length
    ) {

        row.push(value);

        rows.push(row);

    }


    return rows;

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(text) {

    return String(text || "")

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


/* =========================================
   LOAD GOOGLE SHEET
========================================= */

async function loadAchievements() {

    try {

        /* =========================
           LOADING
        ========================= */

        achievementContainer.innerHTML = `

            <div class="loading">

                Memuat data achievement...

            </div>

        `;


        /* =========================
           FETCH GOOGLE SHEET
        ========================= */

        const response =
            await fetch(
                SHEET_URL +
                "&t=" +
                Date.now()
            );


        if (!response.ok) {

            throw new Error(
                "Google Sheet tidak dapat diakses."
            );

        }


        /* =========================
           GET CSV
        ========================= */

        const csv =
            await response.text();


        /* =========================
           PARSE CSV
        ========================= */

        const rows =
            parseCSV(csv);


        if (rows.length < 2) {

            throw new Error(
                "Data Google Sheet kosong."
            );

        }


        /* =========================
           HEADER
        ========================= */

        const headers =
            rows[0];


        /* =========================
           FIND COLUMNS
        ========================= */

        const imageIndex =
            findColumn(

                headers,

                [
                    "Gambar",
                    "Image",
                    "Foto"
                ]

            );


        const titleIndex =
            findColumn(

                headers,

                [
                    "Judul Kompetisi",
                    "Judul",
                    "Competition"
                ]

            );


        const descriptionIndex =
            findColumn(

                headers,

                [
                    "Keterangan",
                    "Description",
                    "Deskripsi"
                ]

            );


        /* =========================
           VALIDATION
        ========================= */

        if (
            imageIndex === -1 ||
            titleIndex === -1 ||
            descriptionIndex === -1
        ) {

            throw new Error(

                "Kolom Google Sheet harus berisi: Gambar, Judul Kompetisi, dan Keterangan."

            );

        }


        /* =========================
           RESET DATA
        ========================= */

        achievements = [];


        /* =========================
           READ DATA
        ========================= */

        for (
            let i = 1;
            i < rows.length;
            i++
        ) {

            const row =
                rows[i];


            /* =========================
               IMAGE
            ========================= */

            const rawImage =
                normalizeText(
                    row[imageIndex]
                );


            const image =
                convertDriveImageURL(
                    rawImage
                );


            /* =========================
               TITLE
            ========================= */

            const title =
                normalizeText(
                    row[titleIndex]
                );


            /* =========================
               DESCRIPTION
            ========================= */

            const description =
                normalizeText(
                    row[descriptionIndex]
                );


            /* =========================
               IGNORE EMPTY ROW
            ========================= */

            if (!title) {

                continue;

            }


            /* =========================
               SAVE DATA
            ========================= */

            achievements.push({

                image: image,

                title: title,

                description: description

            });

        }


        /* =========================
           RENDER
        ========================= */

        renderAchievements();


    }

    catch (error) {

        console.error(
            "Achievement Error:",
            error
        );


        achievementContainer.innerHTML = `

            <div class="loading">

                Gagal memuat data Google Sheet.

                <br><br>

                ${escapeHTML(
                    error.message
                )}

            </div>

        `;

    }

}


/* =========================================
   RENDER ACHIEVEMENTS
========================================= */

function renderAchievements() {

    achievementContainer.innerHTML =
        "";


    /* =========================
       DESCRIPTION
    ========================= */

    if (
        achievementDescription
    ) {

        achievementDescription.textContent =

            `${achievements.length} achievement tercatat`;

    }


    /* =========================
       EMPTY DATA
    ========================= */

    if (
        achievements.length === 0
    ) {

        achievementContainer.innerHTML = `

            <div class="loading">

                Belum ada achievement.

            </div>

        `;

        return;

    }


    /* =========================
       LOOP
    ========================= */

    achievements.forEach(

        function (
            achievement,
            index
        ) {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "achievement-card";


            /* =========================
               IMAGE
            ========================= */

            let imageHTML;


            if (
                achievement.image
            ) {

                imageHTML = `

                    <div
                        class="achievement-image"
                        data-index="${index}"
                    >

                        <img

                            src="${escapeHTML(
                                achievement.image
                            )}"

                            alt="${escapeHTML(
                                achievement.title
                            )}"

                            loading="lazy"

                            onerror="
                                this.onerror=null;
                                this.src='assets/logo.png';
                            "

                        >

                    </div>

                `;

            }

            else {

                imageHTML = `

                    <div
                        class="achievement-image"
                        data-index="${index}"
                    >

                        <img

                            src="assets/logo.png"

                            alt="Agility United"

                        >

                    </div>

                `;

            }


            /* =========================
               CARD
            ========================= */

            card.innerHTML = `

                ${imageHTML}


                <div
                    class="achievement-content"
                >

                    <div
                        class="achievement-number"
                    >

                        ACHIEVEMENT
                        ${String(
                            index + 1
                        ).padStart(
                            2,
                            "0"
                        )}

                    </div>


                    <h3
                        class="achievement-title"
                    >

                        ${escapeHTML(
                            achievement.title
                        )}

                    </h3>


                    <p
                        class="achievement-description"
                    >

                        ${escapeHTML(
                            achievement.description
                        )}

                    </p>


                    <div
                        class="achievement-view"
                        data-index="${index}"
                    >

                        VIEW ACHIEVEMENT

                        <span>
                            →
                        </span>

                    </div>

                </div>

            `;


            achievementContainer.appendChild(
                card
            );

        }

    );


    /* =========================
       EVENTS
    ========================= */

    setupAchievementEvents();

}


/* =========================================
   ACHIEVEMENT EVENTS
========================================= */

function setupAchievementEvents() {

    const clickableImages =
        document.querySelectorAll(
            ".achievement-image"
        );


    const viewButtons =
        document.querySelectorAll(
            ".achievement-view"
        );


    /* =========================
       IMAGE CLICK
    ========================= */

    clickableImages.forEach(

        function (
            element
        ) {

            element.addEventListener(

                "click",

                function () {

                    openModal(
                        element.dataset.index
                    );

                }

            );

        }

    );


    /* =========================
       VIEW BUTTON CLICK
    ========================= */

    viewButtons.forEach(

        function (
            element
        ) {

            element.addEventListener(

                "click",

                function () {

                    openModal(
                        element.dataset.index
                    );

                }

            );

        }

    );

}


/* =========================================
   OPEN MODAL
========================================= */

function openModal(index) {

    const achievement =
        achievements[index];


    if (!achievement) {

        return;

    }


    /* =========================
       IMAGE
    ========================= */

    modalImage.src =
        achievement.image ||
        "assets/logo.png";


    modalImage.alt =
        achievement.title;


    /* =========================
       TEXT
    ========================= */

    modalTitle.textContent =
        achievement.title;


    modalDescription.textContent =
        achievement.description;


    /* =========================
       SHOW MODAL
    ========================= */

    modal.classList.add(
        "show"
    );


    document.body.style.overflow =
        "hidden";

}


/* =========================================
   CLOSE MODAL
========================================= */

function closeModal() {

    if (!modal) {

        return;

    }


    modal.classList.remove(
        "show"
    );


    document.body.style.overflow =
        "";

}


/* =========================================
   CLOSE BUTTON
========================================= */

if (modalClose) {

    modalClose.addEventListener(
        "click",
        closeModal
    );

}


/* =========================================
   CLICK OUTSIDE MODAL
========================================= */

if (modal) {

    modal.addEventListener(

        "click",

        function (event) {

            if (

                event.target === modal ||

                event.target.classList.contains(
                    "modal-overlay"
                )

            ) {

                closeModal();

            }

        }

    );

}


/* =========================================
   ESCAPE KEY
========================================= */

document.addEventListener(

    "keydown",

    function (event) {

        if (
            event.key === "Escape"
        ) {

            closeModal();

        }

    }

);


/* =========================================
   START
========================================= */

loadAchievements();
