/* =========================================================
   AGILITY UNITED
   DIVISION SYSTEM
   Google Sheets:
   Nickname | ID | Role | Division
   ========================================================= */


/* =========================================================
   GOOGLE SHEETS
   ========================================================= */

const SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ93uw-1XWwiTKhTOrOPjlBEcxBkFLT_Ol1XYVEggT2ir1Z76HcoLtC15nm_eD_w8R8bWDO8yiOFrDQ/pub?output=csv";


/* =========================================================
   CONTAINER
   ========================================================= */

let divisionContainer;


/* =========================================================
   DIVISION LOGOS
   =========================================================
   Nama harus sama dengan kolom Division
   di Google Sheets.
   ========================================================= */

const DIVISION_LOGOS = {

    "AGILITY SHINIGAMI":
        "assets/divisi-shinigami.jpeg",

    "AGILITY PHOENIX":
        "assets/divisi-phoenix.jpeg",

    "AGILITY TITAN":
        "assets/divisi-titan.jpeg",

    "AGILITY REAPER":
        "assets/divisi-reaper.jpeg",

    "AGILITY DRAGON":
        "assets/divisi-dragon.jpeg",

    "AGILITY STORM":
        "assets/divisi-storm.jpeg",

    "AGILITY WOLVES":
        "assets/divisi-wolves.jpeg",

    "AGILITY ECLIPSE":
        "assets/divisi-eclipse.jpeg",

    "AGILITY EVOLUTION":
        "assets/divisi-evolution.jpeg"
};


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        divisionContainer =
            document.getElementById(
                "divisions-container"
            );


        if (!divisionContainer) {

            console.error(
                "ERROR: #divisions-container tidak ditemukan."
            );

            return;
        }


        loadDivisions();

    }
);


/* =========================================================
   LOAD DIVISIONS
   ========================================================= */

async function loadDivisions() {

    try {

        divisionContainer.innerHTML = `

            <div class="division-loading">

                <i class="fa-solid fa-spinner fa-spin"></i>

                <span>
                    Loading division data...
                </span>

            </div>

        `;


        const response =
            await fetch(
                SHEET_URL,
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
            parseCSV(csv);


        if (
            !rows ||
            rows.length < 2
        ) {

            showError(
                "Google Sheets tidak memiliki data member."
            );

            return;
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
           FIND COLUMN
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
                    "gameid",
                    "game id"
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


        const divisionColumn =
            findColumn(
                headers,
                [
                    "division"
                ]
            );


        /*
         * OPTIONAL
         *
         * Kalau nanti ditambahkan kolom:
         *
         * Leader
         *
         * kode akan membacanya.
         *
         * Jika tidak ada:
         * member paling atas dalam division
         * otomatis menjadi ketua.
         */

        const leaderColumn =
            findColumn(
                headers,
                [
                    "leader",
                    "ketua",
                    "division leader"
                ]
            );


        console.log(
            "NICKNAME COLUMN:",
            nicknameColumn
        );

        console.log(
            "ID COLUMN:",
            idColumn
        );

        console.log(
            "ROLE COLUMN:",
            roleColumn
        );

        console.log(
            "DIVISION COLUMN:",
            divisionColumn
        );

        console.log(
            "LEADER COLUMN:",
            leaderColumn
        );


        /* =================================================
           VALIDATE
           ================================================= */

        if (!divisionColumn) {

            showError(
                "Kolom Division tidak ditemukan. Pastikan header bernama 'Division'."
            );

            return;
        }


        if (!nicknameColumn) {

            showError(
                "Kolom Nickname tidak ditemukan. Pastikan header bernama 'Nickname'."
            );

            return;
        }


        /* =================================================
           CONVERT DATA
           ================================================= */

        const members =
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

                            role:
                                getValue(
                                    row,
                                    headers,
                                    roleColumn
                                ),

                            division:
                                normalizeDivision(
                                    getValue(
                                        row,
                                        headers,
                                        divisionColumn
                                    )
                                ),

                            leader:
                                getValue(
                                    row,
                                    headers,
                                    leaderColumn
                                )
                        };

                    }
                )
                .filter(
                    member => {

                        return (
                            member.division &&
                            (
                                member.nickname ||
                                member.id
                            )
                        );

                    }
                );


        console.log(
            "MEMBERS:",
            members
        );


        /* =================================================
           VALIDATE MEMBERS
           ================================================= */

        if (
            members.length === 0
        ) {

            showError(
                "Tidak ada data member yang memiliki Division."
            );

            return;
        }


        /* =================================================
           RENDER
           ================================================= */

        renderDivisions(
            members
        );

    }


    catch (error) {

        console.error(
            "DIVISION ERROR:",
            error
        );


        showError(
            "Data Google Sheets tidak dapat dimuat. Periksa link Google Sheets dan koneksi internet."
        );

    }
}


/* =========================================================
   NORMALIZE HEADER
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


    if (index === -1) {

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
   RENDER DIVISIONS
   ========================================================= */

function renderDivisions(
    members
) {

    divisionContainer.innerHTML = "";


    /*
     * =====================================================
     * GROUP MEMBER BERDASARKAN DIVISION
     * =====================================================
     *
     * Contoh:
     *
     * AGILITY SHINIGAMI
     *     RotzyArty
     *     Smokuy
     *     D'
     *     Olise
     *
     * AGILITY EVOLUTION
     *     IBU
     *
     * IBU TIDAK MASUK SHINIGAMI.
     * =====================================================
     */

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

        showError(
            "Tidak ditemukan Division yang valid."
        );

        return;
    }


    /*
     * Nomor division mengikuti
     * urutan division pertama kali
     * muncul di Google Sheets.
     */

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
   FIND LEADER
   ========================================================= */

function findLeader(
    members
) {

    if (
        !members ||
        members.length === 0
    ) {

        return {};

    }


    /*
     * =====================================================
     * JIKA ADA KOLOM LEADER
     * =====================================================
     */

    const markedLeader =
        members.find(
            member => {

                const value =
                    String(
                        member.leader || ""
                    )
                        .trim()
                        .toLowerCase();


                return (

                    value === "yes" ||

                    value === "true" ||

                    value === "1" ||

                    value === "y" ||

                    value === "ketua" ||

                    value === "leader"

                );

            }
        );


    if (markedLeader) {

        return markedLeader;

    }


    /*
     * =====================================================
     * JIKA TIDAK ADA KOLOM LEADER
     *
     * MEMBER PERTAMA PADA MASING-MASING DIVISION
     * MENJADI KETUA.
     *
     * =====================================================
     *
     * SHINIGAMI:
     *
     * RotzyArty   ← KETUA
     * Smokuy
     * D'
     * Olise
     *
     *
     * EVOLUTION:
     *
     * IBU         ← KETUA
     *
     *
     * IBU TIDAK AKAN MENJADI KETUA SHINIGAMI
     * karena dia berada pada division berbeda.
     */

    return members[0];

}


/* =========================================================
   CREATE DIVISION CARD
   ========================================================= */

function createDivisionCard(
    divisionName,
    members,
    divisionIndex
) {

    const formattedNumber =
        String(
            divisionIndex
        ).padStart(
            2,
            "0"
        );


    /*
     * Ketua hanya dicari
     * dari member division ini.
     */

    const leader =
        findLeader(
            members
        );


    /*
     * Logo berdasarkan nama division.
     */

    const logo =
        DIVISION_LOGOS[
            normalizeDivision(
                divisionName
            )
        ] || "";


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

            <div
                class="division-header-left"
            >

                <!-- LOGO -->

                <div
                    class="division-logo"
                >

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

                                        const fallback =
                                            this.parentElement.querySelector(
                                                '.division-logo-fallback'
                                            );

                                        if (fallback) {
                                            fallback.style.display='flex';
                                        }
                                    "
                                >

                                <i
                                    class="fa-solid fa-shield-halved division-logo-fallback"
                                    style="display:none;"
                                ></i>

                            `
                            : `

                                <i
                                    class="fa-solid fa-shield-halved"
                                ></i>

                            `
                    }

                </div>


                <!-- INFO -->

                <div
                    class="division-info"
                >

                    <span
                        class="division-number"
                    >
                        DIVISION ${formattedNumber}
                    </span>


                    <h3
                        class="division-name"
                    >
                        ${escapeHTML(
                            divisionName
                        )}
                    </h3>


                    <p
                        class="division-description"
                    >

                        ${members.length}

                        ${
                            members.length === 1
                                ? "MEMBER"
                                : "MEMBERS"
                        }

                    </p>

                </div>

            </div>


            <!-- RIGHT -->

            <div
                class="division-header-right"
            >

                <span
                    class="division-member-count"
                >

                    <i
                        class="fa-solid fa-users"
                    ></i>

                    ${members.length}

                    ${
                        members.length === 1
                            ? "MEMBER"
                            : "MEMBERS"
                    }

                </span>


                <span
                    class="division-arrow"
                >

                    <i
                        class="fa-solid fa-chevron-down"
                    ></i>

                </span>

            </div>

        </button>


        <!-- =========================================
             LEADER
        ========================================== -->

        <div
            class="division-leader-section"
        >

            <div
                class="division-leader-heading"
            >

                <i
                    class="fa-solid fa-crown"
                ></i>

                <span>
                    KETUA DIVISI
                </span>

            </div>


            <div
                class="division-leader-card"
            >

                <div
                    class="division-leader-avatar"
                >

                    <i
                        class="fa-solid fa-user"
                    ></i>

                </div>


                <div
                    class="division-leader-info"
                >

                    <span>
                        DIVISION LEADER
                    </span>


                    <h4>

                        ${escapeHTML(
                            leader.nickname ||
                            "BELUM ADA DATA"
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


                <div
                    class="division-leader-role"
                >

                    ${escapeHTML(
                        leader.role ||
                        "-"
                    )}

                </div>

            </div>

        </div>


        <!-- =========================================
             MEMBERS
        ========================================== -->

        <div
            class="division-members"
        >

            <div
                class="members-panel-top"
            >

                <div
                    class="members-panel-title"
                >

                    <i
                        class="fa-solid fa-users"
                    ></i>

                    TEAM MEMBERS

                </div>

            </div>


            <div
                class="members-table-wrapper"
            >

                <table
                    class="members-table"
                >

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
                            members,
                            leader
                        )}

                    </tbody>

                </table>

            </div>

        </div>

    `;


    /* =====================================================
       CLICK
       ===================================================== */

    const header =
        card.querySelector(
            ".division-header"
        );


    if (header) {

        header.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();


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

    }


    divisionContainer.appendChild(
        card
    );

}


/* =========================================================
   CREATE MEMBER ROWS
   ========================================================= */

function createMemberRows(
    members,
    leader
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


    /*
     * SEMUA member dari division
     * akan ditampilkan.
     */

    return members
        .map(
            (
                member,
                index
            ) => {

                const isLeader =
                    member === leader;


                return `

                    <tr>

                        <!-- NUMBER -->

                        <td
                            class="member-index"
                        >

                            ${String(
                                index + 1
                            ).padStart(
                                2,
                                "0"
                            )}

                        </td>


                        <!-- NICKNAME -->

                        <td
                            class="member-nickname"
                        >

                            <div
                                class="member-name-cell"
                            >

                                <div
                                    class="member-photo-placeholder"
                                >

                                    <i
                                        class="fa-solid fa-user"
                                    ></i>

                                </div>


                                <span>

                                    ${escapeHTML(
                                        member.nickname ||
                                        "-"
                                    )}

                                </span>

                            </div>

                        </td>


                        <!-- GAME ID -->

                        <td
                            class="member-game-id"
                        >

                            ${escapeHTML(
                                member.id ||
                                "-"
                            )}

                        </td>


                        <!-- ROLE -->

                        <td>

                            <span
                                class="member-role"
                            >

                                ${escapeHTML(
                                    member.role ||
                                    "-"
                                )}

                            </span>

                        </td>


                        <!-- STATUS -->

                        <td>

                            ${
                                isLeader
                                    ? `

                                        <span
                                            class="member-status leader-status"
                                        >

                                            <i
                                                class="fa-solid fa-crown"
                                            ></i>

                                            KETUA

                                        </span>

                                    `
                                    : `

                                        <span
                                            class="member-status"
                                        >

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


        /* =================================================
           DOUBLE QUOTES
           ================================================= */

        if (
            char === '"' &&
            next === '"'
        ) {

            value += '"';

            i++;

            continue;

        }


        /* =================================================
           QUOTE
           ================================================= */

        if (
            char === '"'
        ) {

            insideQuotes =
                !insideQuotes;

            continue;

        }


        /* =================================================
           COMMA
           ================================================= */

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


        /* =================================================
           NEW LINE
           ================================================= */

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


    /* =====================================================
       LAST ROW
       ===================================================== */

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

    if (
        !divisionContainer
    ) {

        return;

    }


    divisionContainer.innerHTML = `

        <div
            class="division-error"
        >

            <i
                class="fa-solid fa-triangle-exclamation"
            ></i>


            <h3>
                DIVISION DATA ERROR
            </h3>


            <p>

                ${escapeHTML(
                    message
                )}

            </p>


            <small>

                Pastikan Google Sheets sudah
                dipublish sebagai CSV dan
                header-nya adalah:

                Nickname, ID, Role, Division.

            </small>

        </div>

    `;

}
