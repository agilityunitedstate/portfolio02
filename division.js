/* =====================================================
   GOOGLE SHEET
   ===================================================== */

const SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSuS37uZb3K0Slrt7W1EaUc6Ev2vNbcf0uX6gGxcwm3mPFkKXvduHTE1p_2o_nEjLiSLaUJc7BXtjGu/pub?output=csv";


/* =====================================================
   ELEMENTS
   ===================================================== */

const divisionContainer =
    document.getElementById("divisionContainer");

const emptyState =
    document.getElementById("emptyState");

const menuToggle =
    document.getElementById("menuToggle");

const navMenu =
    document.getElementById("navMenu");


let members = [];


/* =====================================================
   NORMALIZE
   ===================================================== */

function normalize(value) {

    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

}


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
        const next = text[i + 1];


        if (
            char === '"' &&
            insideQuotes &&
            next === '"'
        ) {

            value += '"';

            i++;

            continue;

        }


        if (char === '"') {

            insideQuotes =
                !insideQuotes;

            continue;

        }


        if (
            char === "," &&
            !insideQuotes
        ) {

            row.push(
                value.trim()
            );

            value = "";

            continue;

        }


        if (
            (char === "\n" ||
             char === "\r") &&
            !insideQuotes
        ) {

            if (
                char === "\r" &&
                next === "\n"
            ) {

                i++;

            }


            row.push(
                value.trim()
            );

            value = "";


            if (
                row.some(
                    item =>
                        item !== ""
                )
            ) {

                rows.push(row);

            }


            row = [];

            continue;

        }


        value += char;

    }


    if (
        value !== "" ||
        row.length
    ) {

        row.push(
            value.trim()
        );


        if (
            row.some(
                item =>
                    item !== ""
            )
        ) {

            rows.push(row);

        }

    }


    return rows;

}


/* =====================================================
   LOAD DATA
   ===================================================== */

async function loadDivisions() {

    try {

        divisionContainer.innerHTML = `
            <div class="loading">
                Loading divisions...
            </div>
        `;


        const response =
            await fetch(
                SHEET_URL +
                "&t=" +
                Date.now()
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load Google Sheet."
            );

        }


        const csv =
            await response.text();


        const rows =
            parseCSV(csv);


        if (!rows.length) {

            throw new Error(
                "Google Sheet is empty."
            );

        }


        /* HEADERS */

        const headers =
            rows[0].map(header =>

                header
                    .replace(/^\uFEFF/, "")
                    .trim()
                    .toLowerCase()

            );


        const nicknameIndex =
            headers.indexOf("nickname");

        const idIndex =
            headers.indexOf("id");

        const divisionIndex =
            headers.indexOf("division");

        const roleIndex =
            headers.indexOf("role");

        const statusIndex =
            headers.indexOf("status");


        /* CHECK COLUMN */

        if (
            nicknameIndex === -1 ||
            idIndex === -1 ||
            divisionIndex === -1 ||
            roleIndex === -1 ||
            statusIndex === -1
        ) {

            throw new Error(
                "Kolom harus: nickname, ID, Division, ROLE, status"
            );

        }


        /* DATA */

        members =
            rows
                .slice(1)
                .map(row => ({

                    nickname:
                        row[nicknameIndex] || "",

                    id:
                        row[idIndex] || "",

                    division:
                        row[divisionIndex] || "",

                    role:
                        row[roleIndex] || "",

                    status:
                        row[statusIndex] || ""

                }))
                .filter(member =>

                    member.nickname &&
                    member.division

                );


        renderDivisions();

    }


    catch (error) {

        console.error(error);

        divisionContainer.innerHTML = `
            <div class="loading">
                Gagal memuat data division.
            </div>
        `;

    }

}


/* =====================================================
   RENDER DIVISIONS
   ===================================================== */

function renderDivisions() {

    divisionContainer.innerHTML = "";


    if (!members.length) {

        emptyState.style.display =
            "block";

        return;

    }


    emptyState.style.display =
        "none";


    /*
        Ambil semua nama division
    */

    const divisionNames =
        [
            ...new Set(
                members.map(
                    member =>
                        member.division
                )
            )
        ];


    divisionNames.forEach(
        (division, index) => {

            const divisionMembers =
                members.filter(
                    member =>
                        member.division ===
                        division
                );


            createDivisionCard(
                division,
                divisionMembers,
                index
            );

        }
    );

}


/* =====================================================
   CREATE DIVISION CARD
   ===================================================== */

function createDivisionCard(
    division,
    divisionMembers,
    index
) {

    const card =
        document.createElement("article");


    card.className =
        "division-card";


    /*
        KETUA DIVISI

        Status harus persis:
        "ketua divisi"
    */

    const leader =
        divisionMembers.find(
            member =>
                normalize(member.status)
                === "ketua divisi"
        );


    /*
        MEMBER PERDIVISI

        Status:
        "member perdivisi"
    */

    const regularMembers =
        divisionMembers.filter(
            member =>
                normalize(member.status)
                === "member perdivisi"
        );


    /* =================================================
       HEADER
       ================================================= */

    const header =
        document.createElement("div");


    header.className =
        "division-header";


    header.innerHTML = `

        <div class="division-info">

            <div class="division-number-box">
                ${String(index + 1).padStart(2, "0")}
            </div>


            <div class="division-text">

                <span class="division-label">
                    DIVISION ${String(index + 1).padStart(2, "0")}
                </span>


                <div class="division-name">
                    ${escapeHTML(division)}
                </div>


                <div class="division-count-text">
                    ${divisionMembers.length} MEMBERS
                </div>

            </div>

        </div>


        <div class="division-actions">

            <div class="member-count">
                <span>♟</span>
                ${divisionMembers.length} MEMBERS
            </div>


            <button
                type="button"
                class="division-toggle"
                aria-label="Open division"
            ></button>

        </div>

    `;


    /* =================================================
       CONTENT
       ================================================= */

    const content =
        document.createElement("div");


    content.className =
        "division-content";


    /* =================================================
       KETUA DIVISI
       ================================================= */

    if (leader) {

        const leaderSection =
            document.createElement("section");


        leaderSection.className =
            "member-section";


        leaderSection.innerHTML = `

            <div class="member-section-title">
                KETUA DIVISI
            </div>


            <div class="leader-row">

                <div>

                    <div class="leader-name">
                        ${escapeHTML(
                            leader.nickname
                        )}
                    </div>


                    <div class="leader-id">
                        ID: ${escapeHTML(
                            leader.id
                        )}
                    </div>

                </div>


                <div class="leader-role">
                    ${escapeHTML(
                        leader.role
                    )}
                </div>


                <div class="leader-status">
                    ♛ KETUA
                </div>

            </div>

        `;


        content.appendChild(
            leaderSection
        );

    }


    /* =================================================
       TEAM MEMBERS
       ================================================= */

    if (regularMembers.length) {

        const memberSection =
            document.createElement("section");


        memberSection.className =
            "member-section";


        memberSection.innerHTML = `

            <div class="member-section-title">
                TEAM MEMBERS
            </div>

        `;


        /* HEADER */

        const tableHeader =
            document.createElement("div");


        tableHeader.className =
            "member-table-header";


        tableHeader.innerHTML = `

            <div>#</div>

            <div>NICKNAME</div>

            <div>GAME ID</div>

            <div>ROLE</div>

            <div>STATUS</div>

        `;


        memberSection.appendChild(
            tableHeader
        );


        /* MEMBER ROWS */

        regularMembers.forEach(
            (member, memberIndex) => {

                const row =
                    document.createElement("div");


                row.className =
                    "member-row";


                row.innerHTML = `

                    <div class="member-index">
                        ${String(
                            memberIndex + 1
                        ).padStart(2, "0")}
                    </div>


                    <div class="member-name">
                        ${escapeHTML(
                            member.nickname
                        )}
                    </div>


                    <div class="member-game-id">
                        ${escapeHTML(
                            member.id
                        )}
                    </div>


                    <div class="member-role">
                        ${escapeHTML(
                            member.role
                        )}
                    </div>


                    <div class="member-status">
                        MEMBER
                    </div>

                `;


                memberSection.appendChild(
                    row
                );

            }
        );


        content.appendChild(
            memberSection
        );

    }


    /* =================================================
       APPEND
       ================================================= */

    card.appendChild(header);

    card.appendChild(content);

    divisionContainer.appendChild(card);


    /* =================================================
       OPEN / CLOSE
       ================================================= */

    header.addEventListener(
        "click",
        () => {

            card.classList.toggle(
                "open"
            );


            const toggle =
                header.querySelector(
                    ".division-toggle"
                );


            if (
                card.classList.contains(
                    "open"
                )
            ) {

                toggle.setAttribute(
                    "aria-label",
                    "Close division"
                );

            } else {

                toggle.setAttribute(
                    "aria-label",
                    "Open division"
                );

            }

        }
    );

}


/* =====================================================
   ESCAPE HTML
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

if (menuToggle && navMenu) {

    menuToggle.addEventListener(
        "click",
        () => {

            navMenu.classList.toggle(
                "show"
            );

        }
    );


    navMenu
        .querySelectorAll("a")
        .forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    navMenu.classList.remove(
                        "show"
                    );

                }
            );

        });

}


/* =====================================================
   START
   ===================================================== */

loadDivisions();
