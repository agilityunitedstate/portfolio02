/* =========================================
   GOOGLE SHEET
========================================= */


/*
MASUKKAN LINK CSV GOOGLE SHEET

CONTOH:

https://docs.google.com/spreadsheets/d/e/
XXXXXXXX/pub?output=csv
*/


const SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSyDHYKCBNZeDeg-zg731JxHCN6xaeW3XNIi5iUzug9FRZw-MhUaZ-fiLi4Bx0_1qB8Apsb1DrzQLh6/pub?output=csv";


/* =========================================
   DIVISION LOGO
========================================= */

const DIVISION_LOGOS = {

    "AGILITY SHINIGAMI":
        "assets/divisi-shinigami.jpeg",

    "AGILITY PHOENIX":
        "assets/divisi-phoenix.jpeg",

    "AGILITY TITAN":
        "assets/divisi-titan.jpeg",

    "AGILITY REAPER":
        "assets/divisi-reaper.jpeg"

};


const DEFAULT_LOGO =
    "assets/logo.png";


/* =========================================
   HTML ELEMENTS
========================================= */

const divisionContainer =
    document.getElementById(
        "divisionContainer"
    );


const divisionDescription =
    document.getElementById(
        "divisionDescription"
    );


const menuToggle =
    document.getElementById(
        "menuToggle"
    );


const navMenu =
    document.getElementById(
        "navMenu"
    );


/* =========================================
   MOBILE MENU
========================================= */

if (
    menuToggle &&
    navMenu
) {

    menuToggle.addEventListener(

        "click",

        function () {

            navMenu.classList.toggle(
                "show"
            );

        }

    );

}


/* =========================================
   VARIABLES
========================================= */

let players = [];

let divisions = [];


/* =========================================
   NORMALIZE
========================================= */

function normalizeText(
    value
) {

    if (
        !value
    ) {

        return "";

    }


    return String(
        value
    )
        .trim()
        .replace(
            /\s+/g,
            " "
        );

}


function normalizeKey(
    value
) {

    return normalizeText(
        value
    )
        .toUpperCase();

}


/* =========================================
   CSV PARSER
========================================= */

function parseCSV(
    text
) {

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


        /* QUOTES */

        if (
            char === '"'
        ) {


            if (
                insideQuotes &&
                next === '"'
            ) {

                value +=
                    '"';

                i++;

            }

            else {

                insideQuotes =
                    !insideQuotes;

            }

        }


        /* COMMA */

        else if (
            char === "," &&
            !insideQuotes
        ) {

            row.push(
                value
            );

            value = "";

        }


        /* NEW LINE */

        else if (
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


            if (
                row.length > 1
            ) {

                rows.push(
                    row
                );

            }


            row = [];

            value = "";

        }


        else {

            value +=
                char;

        }

    }


    if (
        value ||
        row.length
    ) {

        row.push(
            value
        );

        rows.push(
            row
        );

    }


    return rows;

}


/* =========================================
   FIND COLUMN
========================================= */

function findColumn(
    headers,
    names
) {

    for (
        const name of names
    ) {

        const index =
            headers.findIndex(

                header =>

                    normalizeKey(
                        header
                    ) ===
                    normalizeKey(
                        name
                    )

            );


        if (
            index !== -1
        ) {

            return index;

        }

    }


    return -1;

}


/* =========================================
   LOAD GOOGLE SHEET
========================================= */

async function loadDivisions() {


    try {


        /* LOADING */

        divisionContainer.innerHTML = `

            <div class="loading">

                Memuat data divisi...

            </div>

        `;


        /* FETCH */

        const response =
            await fetch(
                SHEET_URL
            );


        if (
            !response.ok
        ) {

            throw new Error(
                "Tidak dapat mengakses Google Sheet"
            );

        }


        const csv =
            await response.text();


        const rows =
            parseCSV(
                csv
            );


        /* CHECK DATA */

        if (
            rows.length < 2
        ) {

            throw new Error(
                "Data Google Sheet kosong"
            );

        }


        /* HEADER */

        const headers =
            rows[0];


        /* FIND COLUMN */

        const nicknameIndex =
            findColumn(

                headers,

                [
                    "Nickname",
                    "Nama"
                ]

            );


        const idIndex =
            findColumn(

                headers,

                [
                    "ID",
                    "Game ID"
                ]

            );


        const roleIndex =
            findColumn(

                headers,

                [
                    "Role"
                ]

            );


        const divisionIndex =
            findColumn(

                headers,

                [
                    "Division",
                    "Divisi"
                ]

            );


        const statusIndex =
            findColumn(

                headers,

                [
                    "Status"
                ]

            );


        /* VALIDATION */

        if (
            nicknameIndex === -1 ||
            idIndex === -1 ||
            roleIndex === -1 ||
            divisionIndex === -1 ||
            statusIndex === -1
        ) {

            throw new Error(
                "Kolom Google Sheet tidak sesuai"
            );

        }


        /* RESET */

        players = [];


        /* GET DATA */

        for (
            let i = 1;
            i < rows.length;
            i++
        ) {


            const row =
                rows[i];


            const nickname =
                normalizeText(
                    row[nicknameIndex]
                );


            const id =
                normalizeText(
                    row[idIndex]
                );


            const role =
                normalizeText(
                    row[roleIndex]
                )
                .toUpperCase();


            const division =
                normalizeText(
                    row[divisionIndex]
                );


            const status =
                normalizeText(
                    row[statusIndex]
                );


            /* VALID DATA */

            if (
                nickname &&
                division
            ) {

                players.push({

                    nickname:
                        nickname,

                    id:
                        id,

                    role:
                        role,

                    division:
                        division,

                    status:
                        status

                });

            }

        }


        /* BUILD */

        buildDivisions();


        /* RENDER */

        renderDivisions();


    }


    catch (
        error
    ) {


        console.error(
            error
        );


        divisionContainer.innerHTML = `

            <div class="loading">

                Gagal memuat
                Google Sheet.

                <br><br>

                ${error.message}

            </div>

        `;

    }

}


/* =========================================
   BUILD DIVISIONS
========================================= */

function buildDivisions() {


    const map = {};


    /* GROUP */

    players.forEach(

        function (
            player
        ) {


            const key =
                normalizeKey(
                    player.division
                );


            if (
                !map[key]
            ) {

                map[key] = {

                    name:
                        player.division,

                    players:
                        []

                };

            }


            map[key]
                .players
                .push(
                    player
                );

        }

    );


    /* ARRAY */

    divisions =
        Object.values(
            map
        );


    /* FIND LEADER */

    divisions.forEach(

        function (
            division
        ) {


            division.leader =
                null;


            division.members =
                [];


            division.players.forEach(

                function (
                    player
                ) {


                    const status =
                        normalizeKey(
                            player.status
                        );


                    /* LEADER */

                    if (

                        (
                            status ===
                            "LEADER"

                            ||

                            status ===
                            "KETUA"

                        )

                        &&

                        !division.leader

                    ) {

                        division.leader =
                            player;

                    }


                    else {

                        division.members.push(
                            player
                        );

                    }

                }

            );


            /*
            JIKA TIDAK ADA LEADER

            PLAYER PERTAMA
            DIJADIKAN LEADER
            */


            if (
                !division.leader &&
                division.players.length > 0
            ) {

                division.leader =
                    division.players[0];


                division.members =
                    division.players.slice(
                        1
                    );

            }

        }

    );

}


/* =========================================
   GET LOGO
========================================= */

function getDivisionLogo(
    division
) {

    const key =
        normalizeKey(
            division
        );


    if (
        DIVISION_LOGOS[key]
    ) {

        return DIVISION_LOGOS[key];

    }


    return DEFAULT_LOGO;

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(
    text
) {

    return String(
        text || ""
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
        );

}


/* =========================================
   RENDER DIVISIONS
========================================= */

function renderDivisions() {


    /* DESCRIPTION */

    if (
        divisionDescription
    ) {

        divisionDescription.textContent =

            `${divisions.length} Divisi aktif dengan ${players.length} player`;

    }


    /* CLEAR */

    divisionContainer.innerHTML =
        "";


    /* NO DATA */

    if (
        divisions.length === 0
    ) {

        divisionContainer.innerHTML = `

            <div class="loading">

                Belum ada data divisi.

            </div>

        `;

        return;

    }


    /* LOOP */

    divisions.forEach(

        function (
            division,
            index
        ) {


            const logo =
                getDivisionLogo(
                    division.name
                );


            const detailID =
                `division-${index}`;


            const leader =
                division.leader;


            const members =
                division.members;


            /* WRAPPER */

            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className =
                "division-wrapper";


            /* HTML */

            wrapper.innerHTML = `


                <!-- DIVISION CARD -->

                <div
                    class="division-card"
                >


                    <!-- LOGO -->

                    <div
                        class="division-logo"
                    >

                        <img
                            src="${logo}"
                            alt="${escapeHTML(
                                division.name
                            )}"
                        >

                    </div>


                    <!-- INFO -->

                    <div
                        class="division-info"
                    >

                        <h3>

                            ${escapeHTML(
                                division.name
                            )}

                        </h3>


                        <p>

                            Ketua Divisi:

                            <strong>

                                ${leader
                                    ? escapeHTML(
                                        leader.nickname
                                    )
                                    : "-"}

                            </strong>

                        </p>


                    </div>


                    <!-- RIGHT -->

                    <div
                        class="division-right"
                    >


                        <div
                            class="division-stats"
                        >


                            <div
                                class="stat"
                            >

                                <span
                                    class="stat-number"
                                >

                                    ${division.players.length}

                                </span>

                                <span
                                    class="stat-label"
                                >

                                    PLAYER

                                </span>

                            </div>


                            <div
                                class="stat"
                            >

                                <span
                                    class="stat-number"
                                >

                                    ${members.length}

                                </span>

                                <span
                                    class="stat-label"
                                >

                                    MEMBER

                                </span>

                            </div>


                        </div>


                        <!-- BUTTON -->

                        <button

                            class="division-button"

                            data-target="${detailID}"

                        >

                            +

                        </button>


                    </div>


                </div>


                <!-- DETAILS -->

                <div

                    class="division-details"

                    id="${detailID}"

                >


                    <!-- LEADER -->

                    <div
                        class="detail-title"
                    >

                        KETUA DIVISI

                    </div>


                    <div
                        class="division-leader"
                    >


                        <div>


                            <div
                                class="division-leader-name"
                            >

                                ${leader
                                    ? escapeHTML(
                                        leader.nickname
                                    )
                                    : "Belum ada Ketua"}

                            </div>


                        </div>


                        <div
                            class="division-leader-info"
                        >


                            <span>

                                ID:

                                ${leader
                                    ? escapeHTML(
                                        leader.id
                                    )
                                    : "-"}

                            </span>


                            <span>

                                ROLE:

                                ${leader
                                    ? escapeHTML(
                                        leader.role
                                    )
                                    : "-"}

                            </span>


                            <span>

                                LEADER

                            </span>


                        </div>


                    </div>


                    <!-- MEMBER TITLE -->

                    <div
                        class="detail-title"
                    >

                        ANGGOTA DIVISI

                    </div>


                    <!-- MEMBERS -->

                    <div
                        class="member-grid"
                    >


                        ${

                            members.length > 0

                                ?

                                members.map(

                                    function (
                                        member
                                    ) {


                                        return `

                                            <div
                                                class="member-card"
                                            >


                                                <div
                                                    class="member-name"
                                                >

                                                    ${escapeHTML(
                                                        member.nickname
                                                    )}

                                                </div>


                                                <div
                                                    class="member-id"
                                                >

                                                    ID:

                                                    ${escapeHTML(
                                                        member.id
                                                    )}

                                                </div>


                                                <span
                                                    class="member-role"
                                                >

                                                    ${escapeHTML(
                                                        member.role
                                                    )}

                                                </span>


                                            </div>

                                        `;

                                    }

                                ).join(
                                    ""
                                )


                                :

                                `

                                    <div
                                        class="member-card"
                                    >

                                        <div
                                            class="member-name"
                                        >

                                            Belum ada anggota.

                                        </div>

                                    </div>

                                `

                        }


                    </div>


                </div>


            `;


            divisionContainer.appendChild(
                wrapper
            );


        }

    );


    /* BUTTON EVENT */

    setupButtons();

}


/* =========================================
   BUTTON
========================================= */

function setupButtons() {


    const buttons =
        document.querySelectorAll(
            ".division-button"
        );


    buttons.forEach(

        function (
            button
        ) {


            button.addEventListener(

                "click",

                function () {


                    const target =
                        document.getElementById(

                            button.dataset.target

                        );


                    if (
                        !target
                    ) {

                        return;

                    }


                    const isOpen =
                        target.classList.contains(
                            "show"
                        );


                    /* CLOSE ALL */

                    document
                        .querySelectorAll(
                            ".division-details"
                        )
                        .forEach(

                            function (
                                detail
                            ) {

                                detail.classList.remove(
                                    "show"
                                );

                            }

                        );


                    /* RESET BUTTON */

                    buttons.forEach(

                        function (
                            btn
                        ) {

                            btn.textContent =
                                "+";

                        }

                    );


                    /* OPEN */

                    if (
                        !isOpen
                    ) {


                        target.classList.add(
                            "show"
                        );


                        button.textContent =
                            "−";


                        /*
                        SCROLL
                        */

                        setTimeout(

                            function () {

                                target.scrollIntoView({

                                    behavior:
                                        "smooth",

                                    block:
                                        "nearest"

                                });

                            },

                            100

                        );

                    }

                }

            );

        }

    );

}


/* =========================================
   START
========================================= */

loadDivisions();
