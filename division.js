/* =========================================================
   AGILITY UNITED
   DIVISION SYSTEM
   =========================================================

   GOOGLE SHEETS COLUMNS:

   nickname | ID | Division | ROLE | status | logo

   STATUS:

   ketua klub
   ketua divisi
   member perdivisi

   ========================================================= */


/* =========================================================
   GOOGLE SHEETS
   ========================================================= */

const SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSuS37uZb3K0Slrt7W1EaUc6Ev2vNbcf0uX6gGxcwm3mPFkKXvduHTE1p_2o_nEjLiSLaUJc7BXtjGu/pub?output=csv";


/* =========================================================
   GLOBAL
   ========================================================= */

let divisionContainer = null;

let clubLeaderContainer = null;


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        divisionContainer =
            document.getElementById(
                "divisions-container"
            );


        clubLeaderContainer =
            document.getElementById(
                "clubLeaderContainer"
            );


        initMobileMenu();


        if (!divisionContainer) {

            console.error(
                "#divisions-container tidak ditemukan."
            );

            return;

        }


        loadDivisions();

    }
);


/* =========================================================
   MOBILE NAVBAR
   ========================================================= */

function initMobileMenu() {

    const menuToggle =
        document.getElementById(
            "menuToggle"
        );


    const navMenu =
        document.getElementById(
            "navMenu"
        );


    if (
        !menuToggle ||
        !navMenu
    ) {

        return;

    }


    menuToggle.addEventListener(
        "click",
        event => {

            event.stopPropagation();


            const isOpen =
                navMenu.classList.toggle(
                    "show"
                );


            menuToggle.setAttribute(
                "aria-expanded",
                String(
                    isOpen
                )
            );

        }
    );


    /* CLOSE AFTER CLICK LINK */

    navMenu
        .querySelectorAll(
            ".nav-link"
        )
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    () => {

                        navMenu.classList.remove(
                            "show"
                        );


                        menuToggle.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                    }
                );

            }
        );


    /* CLOSE WHEN CLICK OUTSIDE */

    document.addEventListener(
        "click",
        event => {

            if (
                !navMenu.contains(
                    event.target
                ) &&
                !menuToggle.contains(
                    event.target
                )
            ) {

                navMenu.classList.remove(
                    "show"
                );


                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        }
    );

}


/* =========================================================
   LOAD DIVISIONS
   ========================================================= */

async function loadDivisions() {

    try {

        showLoading();


        const response =
            await fetch(
                SHEET_URL +
                "&t=" +
                Date.now(),
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const csv =
            await response.text();


        console.log(
            "GOOGLE SHEETS RAW DATA:",
            csv
        );


        const rows =
            parseCSV(
                csv
            );


        if (
            !rows ||
            rows.length < 2
        ) {

            throw new Error(
                "Google Sheets tidak memiliki data."
            );

        }


        /* =================================================
           HEADER
           ================================================= */

        const headers =
            rows[0].map(
                normalizeHeader
            );


        console.log(
            "SHEET HEADERS:",
            headers
        );


        /* =================================================
           FIND COLUMNS
           ================================================= */

        const nicknameColumn =
            findColumn(
                headers,
                [
                    "nickname",
                    "name"
                ]
            );


        const idColumn =
            findColumn(
                headers,
                [
                    "id",
                    "game id",
                    "gameid"
                ]
            );


        const divisionColumn =
            findColumn(
                headers,
                [
                    "division"
                ]
            );


        const roleColumn =
            findColumn(
                headers,
                [
                    "role",
                    "position"
                ]
            );


        const statusColumn =
            findColumn(
                headers,
                [
                    "status"
                ]
            );


        const logoColumn =
            findColumn(
                headers,
                [
                    "logo",
                    "division logo",
                    "logo division"
                ]
            );


        /* =================================================
           VALIDATE
           ================================================= */

        if (!nicknameColumn) {

            throw new Error(
                "Kolom Nickname tidak ditemukan."
            );

        }


        if (!divisionColumn) {

            throw new Error(
                "Kolom Division tidak ditemukan."
            );

        }


        if (!roleColumn) {

            console.warn(
                "Kolom ROLE tidak ditemukan."
            );

        }


        if (!statusColumn) {

            throw new Error(
                "Kolom status tidak ditemukan."
            );

        }


        /* =================================================
           CONVERT DATA
           ================================================= */

        const data =
            rows
                .slice(1)
                .map(
                    row => {

                        return {

                            nickname:
                                getValue(
                                    row,
                                    headers,
                                    nicknameColumn
                                ),

                            id:
                                getValue(
                                    row,
                                    headers,
                                    idColumn
                                ),

                            division:
                                normalizeDivision(
                                    getValue(
                                        row,
                                        headers,
                                        divisionColumn
                                    )
                                ),

                            role:
                                getValue(
                                    row,
                                    headers,
                                    roleColumn
                                ),

                            status:
                                normalizeStatus(
                                    getValue(
                                        row,
                                        headers,
                                        statusColumn
                                    )
                                ),

                            logo:
                                getValue(
                                    row,
                                    headers,
                                    logoColumn
                                )

                        };

                    }
                )
                .filter(
                    member => {

                        return (
                            member.nickname ||
                            member.id
                        );

                    }
                );


        console.log(
            "PARSED DATA:",
            data
        );


        if (
            data.length === 0
        ) {

            throw new Error(
                "Tidak ada data yang valid."
            );

        }


        /* =================================================
           CLUB LEADER
        ================================================== */

        const clubLeader =
            data.find(
                member =>
                    member.status ===
                    "ketua klub"
            );


        /* =================================================
           DIVISION DATA
        ================================================== */

        const divisionMembers =
            data.filter(
                member =>
                    member.status !==
                    "ketua klub"
            );


        /* =================================================
           RENDER CLUB LEADER
        ================================================== */

        renderClubLeader(
            clubLeader
        );


        /* =================================================
           RENDER DIVISIONS
        ================================================== */

        renderDivisions(
            divisionMembers
        );

    }


    catch (error) {

        console.error(
            "DIVISION ERROR:",
            error
        );


        showError(
            error.message
        );

    }

}


/* =========================================================
   LOADING
   ========================================================= */

function showLoading() {

    if (!divisionContainer) {

        return;

    }


    divisionContainer.innerHTML = `

        <div class="division-loading">

            <div class="loading-spinner"></div>

            <span>
                LOADING DIVISIONS...
            </span>

        </div>

    `;

}


/* =========================================================
   HEADER NORMALIZER
   ========================================================= */

function normalizeHeader(
    value
) {

    return String(
        value || ""
    )
        .trim()
        .toLowerCase()
        .replace(
            /\s+/g,
            " "
        );

}


/* =========================================================
   FIND COLUMN
   ========================================================= */

function findColumn(
    headers,
    names
) {

    return (
        headers.find(
            header =>
                names.includes(
                    header
                )
        ) || null
    );

}


/* =========================================================
   GET VALUE
   ========================================================= */

function getValue(
    row,
    headers,
    column
) {

    if (!column) {

        return "";

    }


    const index =
        headers.indexOf(
            column
        );


    if (
        index === -1
    ) {

        return "";

    }


    return String(
        row[index] ?? ""
    ).trim();

}


/* =========================================================
   NORMALIZE DIVISION
   ========================================================= */

function normalizeDivision(
    value
) {

    return String(
        value || ""
    )
        .trim()
        .replace(
            /\s+/g,
            " "
        )
        .toUpperCase();

}


/* =========================================================
   NORMALIZE STATUS
   ========================================================= */

function normalizeStatus(
    value
) {

    return String(
        value || ""
    )
        .trim()
        .toLowerCase()
        .replace(
            /\s+/g,
            " "
        );

}


/* =========================================================
   CLUB LEADER
   ========================================================= */

function renderClubLeader(
    leader
) {

    if (!clubLeaderContainer) {

        return;

    }


    if (!leader) {

        clubLeaderContainer.innerHTML = `

            <div class="club-leader-card">


                <div class="leader-icon">

                    <i class="fa-solid fa-crown"></i>

                </div>


                <div class="leader-main">

                    <span class="leader-label">
                        CLUB LEADER
                    </span>


                    <h3>
                        BELUM ADA DATA
                    </h3>


                    <p>
                        Agility United
                    </p>

                </div>


                <div class="leader-info">

                    <div class="leader-info-item">

                        <span>
                            GAME ID
                        </span>

                        <strong>
                            -
                        </strong>

                    </div>


                    <div class="leader-info-item">

                        <span>
                            ROLE
                        </span>

                        <strong class="leader-role-badge">
                            -
                        </strong>

                    </div>

                </div>

            </div>

        `;

        return;

    }


    clubLeaderContainer.innerHTML = `

        <div class="club-leader-card">


            <div class="leader-icon">

                <i class="fa-solid fa-crown"></i>

            </div>


            <div class="leader-main">

                <span class="leader-label">
                    CLUB LEADER
                </span>


                <h3>

                    ${escapeHTML(
                        leader.nickname ||
                        "-"
                    )}

                </h3>


                <p>
                    Agility United
                </p>

            </div>


            <div class="leader-info">


                <div class="leader-info-item">

                    <span>
                        GAME ID
                    </span>


                    <strong>

                        ${escapeHTML(
                            leader.id ||
                            "-"
                        )}

                    </strong>

                </div>


                <div class="leader-info-item">

                    <span>
                        ROLE
                    </span>


                    <strong class="leader-role-badge">

                        ${escapeHTML(
                            leader.role ||
                            "-"
                        )}

                    </strong>

                </div>

            </div>

        </div>

    `;

}


/* =========================================================
   RENDER DIVISIONS
   ========================================================= */

function renderDivisions(
    members
) {

    divisionContainer.innerHTML = "";


    const divisions =
        new Map();


    members.forEach(
        member => {

            const division =
                normalizeDivision(
                    member.division
                );


            if (!division) {

                return;

            }


            if (
                !divisions.has(
                    division
                )
            ) {

                divisions.set(
                    division,
                    []
                );

            }


            divisions
                .get(division)
                .push(
                    member
                );

        }
    );


    if (
        divisions.size === 0
    ) {

        divisionContainer.innerHTML = `

            <div class="member-empty">

                Tidak ada division ditemukan.

            </div>

        `;

        return;

    }


    let divisionIndex = 1;


    divisions.forEach(
        (
            divisionMembers,
            divisionName
        ) => {

            createDivisionCard(
                divisionName,
                divisionMembers,
                divisionIndex
            );


            divisionIndex++;

        }
    );

}


/* =========================================================
   FIND DIVISION LEADER
   ========================================================= */

function findDivisionLeader(
    members
) {

    if (
        !members ||
        members.length === 0
    ) {

        return null;

    }


    return (
        members.find(
            member =>
                member.status ===
                "ketua divisi"
        ) || null
    );

}


/* =========================================================
   GET DIVISION LOGO
   ========================================================= */

function getDivisionLogo(
    members
) {

    const logoMember =
        members.find(
            member =>
                String(
                    member.logo || ""
                ).trim() !== ""
        );


    if (!logoMember) {

        return "";

    }


    return safeImage(
        logoMember.logo
    );

}


/* =========================================================
   CREATE DIVISION CARD
   ========================================================= */

function createDivisionCard(
    divisionName,
    members,
    divisionIndex
) {

    const number =
        String(
            divisionIndex
        ).padStart(
            2,
            "0"
        );


    const leader =
        findDivisionLeader(
            members
        );


    const logo =
        getDivisionLogo(
            members
        );


    const card =
        document.createElement(
            "article"
        );


    card.className =
        "division-card";


    card.dataset.division =
        divisionName;


    card.innerHTML = `

        <!-- =========================================
             HEADER
        ========================================== -->

        <button
            class="division-header"
            type="button"
            aria-expanded="false"
        >


            <div class="division-header-left">


                <div class="division-logo">

                    ${
                        logo

                        ? `

                            <img
                                src="${escapeHTML(
                                    logo
                                )}"

                                alt="${escapeHTML(
                                    divisionName
                                )} Logo"

                                onerror="
                                    this.style.display='none';
                                    this.nextElementSibling.style.display='flex';
                                "
                            >

                            <span
                                class="division-logo-fallback"
                                style="display:none;"
                            >

                                <i class="fa-solid fa-shield-halved"></i>

                            </span>

                        `

                        : `

                            <span class="division-logo-fallback">

                                <i class="fa-solid fa-shield-halved"></i>

                            </span>

                        `
                    }

                </div>


                <div class="division-info">


                    <span class="division-number">

                        DIVISION ${number}

                    </span>


                    <h3 class="division-name">

                        ${escapeHTML(
                            divisionName
                        )}

                    </h3>


                    <p class="division-description">

                        ${members.length}

                        ${
                            members.length === 1
                                ? "MEMBER"
                                : "MEMBERS"
                        }

                    </p>

                </div>

            </div>


            <div class="division-header-right">


                <span class="division-member-count">

                    <i class="fa-solid fa-users"></i>

                    ${members.length}

                    ${
                        members.length === 1
                            ? "MEMBER"
                            : "MEMBERS"
                    }

                </span>


                <span class="division-arrow">

                    <span></span>

                </span>

            </div>

        </button>


        <!-- =========================================
             CONTENT
        ========================================== -->

        <div class="division-content">


            <!-- KETUA DIVISI -->

            <div class="division-leader-section">


                <div class="division-leader-heading">

                    <i class="fa-solid fa-crown"></i>

                    <span>
                        KETUA DIVISI
                    </span>

                </div>


                ${
                    leader

                    ? `

                        <div class="division-leader-card">


                            <div class="division-leader-avatar">

                                <i class="fa-solid fa-user"></i>

                            </div>


                            <div class="division-leader-info">

                                <span>
                                    DIVISION LEADER
                                </span>


                                <h4>

                                    ${escapeHTML(
                                        leader.nickname ||
                                        "-"
                                    )}

                                </h4>


                                <p>

                                    ID:

                                    ${escapeHTML(
                                        leader.id ||
                                        "-"
                                    )}

                                </p>

                            </div>


                            <div class="division-leader-role">

                                ${escapeHTML(
                                    leader.role ||
                                    "-"
                                )}

                            </div>

                        </div>

                    `

                    : `

                        <div class="division-leader-card no-leader">


                            <div class="division-leader-avatar">

                                <i class="fa-solid fa-user-slash"></i>

                            </div>


                            <div class="division-leader-info">

                                <span>
                                    DIVISION LEADER
                                </span>


                                <h4>
                                    BELUM ADA DATA
                                </h4>


                                <p>
                                    Ketua divisi belum ditentukan.
                                </p>

                            </div>

                        </div>

                    `
                }

            </div>


            <!-- TEAM MEMBERS -->

            <div class="division-members">


                <div class="members-panel-top">


                    <div class="members-panel-title">

                        <i class="fa-solid fa-users"></i>

                        TEAM MEMBERS

                    </div>


                    <span>

                        ${members.length}

                        ${
                            members.length === 1
                                ? "MEMBER"
                                : "MEMBERS"
                        }

                    </span>

                </div>


                <div class="members-table-wrapper">


                    <table class="members-table">


                        <thead>

                            <tr>

                                <th>
                                    #
                                </th>

                                <th>
                                    NICKNAME
                                </th>

                                <th>
                                    GAME ID
                                </th>

                                <th>
                                    ROLE
                                </th>

                                <th>
                                    STATUS
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            ${createMemberRows(
                                members
                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>

    `;


    /* =====================================================
       ACCORDION
    ====================================================== */

    const header =
        card.querySelector(
            ".division-header"
        );


    header.addEventListener(
        "click",
        () => {

            const isOpen =
                card.classList.toggle(
                    "open"
                );


            header.setAttribute(
                "aria-expanded",
                String(
                    isOpen
                )
            );

        }
    );


    divisionContainer.appendChild(
        card
    );

}


/* =========================================================
   CREATE MEMBER ROWS
   ========================================================= */

function createMemberRows(
    members
) {

    if (
        !members ||
        members.length === 0
    ) {

        return `

            <tr>

                <td
                    colspan="5"
                    class="members-empty"
                >

                    Tidak ada member.

                </td>

            </tr>

        `;

    }


    return members
        .map(
            (
                member,
                index
            ) => {

                const isLeader =
                    member.status ===
                    "ketua divisi";


                return `

                    <tr>


                        <td class="member-index">

                            ${String(
                                index + 1
                            ).padStart(
                                2,
                                "0"
                            )}

                        </td>


                        <td class="member-nickname">

                            <div class="member-name-cell">


                                <div class="member-photo-placeholder">

                                    <i class="fa-solid fa-user"></i>

                                </div>


                                <span>

                                    ${escapeHTML(
                                        member.nickname ||
                                        "-"
                                    )}

                                </span>

                            </div>

                        </td>


                        <td class="member-game-id">

                            ${escapeHTML(
                                member.id ||
                                "-"
                            )}

                        </td>


                        <td>

                            <span class="member-role">

                                ${escapeHTML(
                                    member.role ||
                                    "-"
                                )}

                            </span>

                        </td>


                        <td>

                            ${
                                isLeader

                                ? `

                                    <span
                                        class="member-status leader-status"
                                    >

                                        <i class="fa-solid fa-crown"></i>

                                        KETUA DIVISI

                                    </span>

                                `

                                : `

                                    <span class="member-status">

                                        MEMBER

                                    </span>

                                `
                            }

                        </td>

                    </tr>

                `;

            }
        )
        .join("");

}


/* =========================================================
   DRIVE IMAGE
   ========================================================= */

function safeImage(
    url
) {

    const value =
        String(
            url ?? ""
        ).trim();


    if (!value) {

        return "";

    }


    /* DRIVE FILE */

    let match =
        value.match(
            /drive\.google\.com\/file\/d\/([^/]+)/
        );


    if (match) {

        return (
            "https://drive.google.com/thumbnail?id=" +
            match[1] +
            "&sz=w500"
        );

    }


    /* DRIVE OPEN */

    match =
        value.match(
            /drive\.google\.com\/open\?id=([^&]+)/
        );


    if (match) {

        return (
            "https://drive.google.com/thumbnail?id=" +
            match[1] +
            "&sz=w500"
        );

    }


    /* DRIVE UC */

    match =
        value.match(
            /drive\.google\.com\/uc\?(?:[^#]*&)?id=([^&]+)/
        );


    if (match) {

        return (
            "https://drive.google.com/thumbnail?id=" +
            match[1] +
            "&sz=w500"
        );

    }


    return value;

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
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


/* =========================================================
   CSV PARSER
   ========================================================= */

function parseCSV(
    text
) {

    const rows = [];

    let row = [];

    let value = "";

    let insideQuotes =
        false;


    for (
        let i = 0;
        i < text.length;
        i++
    ) {

        const char =
            text[i];

        const next =
            text[i + 1];


        /* ESCAPED QUOTE */

        if (
            char === '"' &&
            next === '"'
        ) {

            value += '"';

            i++;

            continue;

        }


        /* QUOTE */

        if (
            char === '"'
        ) {

            insideQuotes =
                !insideQuotes;

            continue;

        }


        /* COMMA */

        if (
            char === "," &&
            !insideQuotes
        ) {

            row.push(
                value
            );

            value = "";

            continue;

        }


        /* NEW LINE */

        if (
            (
                char === "\n" ||
                char === "\r"
            ) &&
            !insideQuotes
        ) {

            if (
                char === "\r" &&
                next === "\n"
            ) {

                i++;

            }


            row.push(
                value
            );


            rows.push(
                row
            );


            row = [];

            value = "";

            continue;

        }


        value += char;

    }


    /* LAST ROW */

    if (
        value !== "" ||
        row.length > 0
    ) {

        row.push(
            value
        );


        rows.push(
            row
        );

    }


    return rows

        .filter(
            row =>
                row.some(
                    cell =>
                        String(
                            cell
                        ).trim() !== ""
                )
        )

        .map(
            row =>
                row.map(
                    cell =>
                        String(
                            cell
                        ).trim()
                )
        );

}


/* =========================================================
   ERROR
   ========================================================= */

function showError(
    message
) {

    if (!divisionContainer) {

        return;

    }


    divisionContainer.innerHTML = `

        <div class="division-error">


            <i class="fa-solid fa-triangle-exclamation"></i>


            <h3>
                DIVISION DATA ERROR
            </h3>


            <p>

                ${escapeHTML(
                    message
                )}

            </p>


            <small>

                Pastikan Google Sheets menggunakan
                struktur:

                <br><br>

                <strong>
                    nickname | ID | Division | ROLE | status | logo
                </strong>

            </small>

        </div>

    `;


    if (clubLeaderContainer) {

        clubLeaderContainer.innerHTML = "";

    }

}
