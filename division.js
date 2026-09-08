/* =========================================================
   AGILITY UNITED
   DIVISION.JS
========================================================= */


/* =========================================================
   GOOGLE SHEET CONFIGURATION
========================================================= */


/*
---------------------------------------------------------
PASTE LINK CSV GOOGLE SHEET KAMU DI SINI

CONTOH:

https://docs.google.com/spreadsheets/d/e/
XXXXXXXXXXXXXXX/pub?output=csv

---------------------------------------------------------
*/


const SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ93uw-1XWwiTKhTOrOPjlBEcxBkFLT_Ol1XYVEggT2ir1Z76HcoLtC15nm_eD_w8R8bWDO8yiOFrDQ/pub?output=csv";


/* =========================================================
   DIVISION LOGOS
========================================================= */


/*
---------------------------------------------------------

TAMBAHKAN LOGO DIVISI DI FOLDER:

assets/

CONTOH:

assets/divisi-shinigami.jpeg
assets/divisi-phoenix.jpeg

---------------------------------------------------------
*/


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


    "AGILITY LEGENDS":
        "assets/divisi-legends.jpeg"

};


/* =========================================================
   DEFAULT LOGO
========================================================= */

const DEFAULT_LOGO =
    "assets/logo.png";


/* =========================================================
   VARIABLES
========================================================= */

let players = [];

let divisions = [];


/* =========================================================
   HTML ELEMENTS
========================================================= */

const divisionContainer =
    document.getElementById(
        "division-container"
    );


const divisionDescription =
    document.getElementById(
        "division-description"
    );


/* =========================================================
   MOBILE MENU
========================================================= */

const menuToggle =
    document.getElementById(
        "menuToggle"
    );


const navMenu =
    document.getElementById(
        "navMenu"
    );


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


/* =========================================================
   NORMALIZE TEXT
========================================================= */


/*
FUNGSI UNTUK MEMBERSIHKAN
TEKS DARI GOOGLE SHEET
*/


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


/* =========================================================
   NORMALIZE KEY
========================================================= */


/*
DIGUNAKAN UNTUK
MENCOCOKKAN NAMA DIVISI
*/


function normalizeKey(
    value
) {

    return normalizeText(
        value
    )

        .toUpperCase();

}


/* =========================================================
   GET DIVISION LOGO
========================================================= */

function getDivisionLogo(
    divisionName
) {

    const key =
        normalizeKey(
            divisionName
        );


    if (
        DIVISION_LOGOS[key]
    ) {

        return DIVISION_LOGOS[key];

    }


    return DEFAULT_LOGO;

}


/* =========================================================
   CSV PARSER
========================================================= */


/*
FUNGSI MEMBACA CSV
TERMASUK DATA YANG
MENGANDUNG TANDA KUTIP
*/


function parseCSV(
    text
) {

    const rows = [];

    let row = [];

    let currentValue = "";

    let insideQuotes = false;


    for (
        let i = 0;
        i < text.length;
        i++
    ) {


        const char =
            text[i];


        const nextChar =
            text[i + 1];


        /*
        ---------------------------------
        DOUBLE QUOTES
        ---------------------------------
        */


        if (
            char === '"'
        ) {


            if (
                insideQuotes &&
                nextChar === '"'
            ) {

                currentValue +=
                    '"';

                i++;

            }

            else {

                insideQuotes =
                    !insideQuotes;

            }


        }


        /*
        ---------------------------------
        COMMA
        ---------------------------------
        */


        else if (
            char === "," &&
            !insideQuotes
        ) {


            row.push(
                currentValue
            );


            currentValue =
                "";


        }


        /*
        ---------------------------------
        NEW LINE
        ---------------------------------
        */


        else if (
            (
                char === "\n" ||
                char === "\r"
            ) &&
            !insideQuotes
        ) {


            if (
                char === "\r" &&
                nextChar === "\n"
            ) {

                i++;

            }


            row.push(
                currentValue
            );


            if (
                row.some(
                    value =>
                    normalizeText(
                        value
                    ) !== ""
                )
            ) {

                rows.push(
                    row
                );

            }


            row =
                [];


            currentValue =
                "";


        }


        /*
        ---------------------------------
        NORMAL CHARACTER
        ---------------------------------
        */


        else {

            currentValue +=
                char;

        }

    }


    /*
    TAMBAHKAN BARIS TERAKHIR
    */


    if (
        currentValue.length > 0 ||
        row.length > 0
    ) {


        row.push(
            currentValue
        );


        if (
            row.some(
                value =>
                normalizeText(
                    value
                ) !== ""
            )
        ) {

            rows.push(
                row
            );

        }

    }


    return rows;

}


/* =========================================================
   GET COLUMN INDEX
========================================================= */


/*
MENCARI KOLOM BERDASARKAN
NAMA HEADER GOOGLE SHEET
*/


function getColumnIndex(
    headers,
    possibleNames
) {


    for (
        const name of possibleNames
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


/* =========================================================
   LOAD GOOGLE SHEET
========================================================= */

async function loadDivisions() {


    /*
    CEK CONTAINER
    */


    if (
        !divisionContainer
    ) {

        console.error(
            "ERROR: division-container tidak ditemukan."
        );

        return;

    }


    /*
    CEK URL
    */


    if (
        SHEET_URL ===
        "PASTE_LINK_GOOGLE_SHEET_CSV_DISINI"
    ) {


        divisionContainer.innerHTML = `

            <div class="loading">

                Google Sheet belum dikonfigurasi.

                <br>
                <br>

                Masukkan link CSV
                pada division.js

            </div>

        `;


        return;

    }


    try {


        /*
        LOADING
        */


        divisionContainer.innerHTML = `

            <div class="loading">

                Memuat data divisi...

            </div>

        `;


        /*
        FETCH CSV
        */


        const response =
            await fetch(
                SHEET_URL
            );


        /*
        CEK RESPONSE
        */


        if (
            !response.ok
        ) {

            throw new Error(
                "Tidak dapat mengakses Google Sheet."
            );

        }


        /*
        GET TEXT
        */


        const csvText =
            await response.text();


        /*
        PARSE CSV
        */


        const rows =
            parseCSV(
                csvText
            );


        /*
        CEK DATA
        */


        if (
            rows.length < 2
        ) {

            throw new Error(
                "Google Sheet tidak memiliki data."
            );

        }


        /*
        HEADERS
        */


        const headers =
            rows[0].map(

                header =>

                    normalizeText(
                        header
                    )

            );


        /*
        CARI KOLOM
        */


        const nicknameIndex =
            getColumnIndex(

                headers,

                [

                    "Nickname",
                    "Nick Name",
                    "Name",
                    "Nama"

                ]

            );


        const idIndex =
            getColumnIndex(

                headers,

                [

                    "ID",
                    "Game ID",
                    "GameID"

                ]

            );


        const roleIndex =
            getColumnIndex(

                headers,

                [

                    "Role",
                    "Position"

                ]

            );


        const divisionIndex =
            getColumnIndex(

                headers,

                [

                    "Division",
                    "Divisi"

                ]

            );


        const statusIndex =
            getColumnIndex(

                headers,

                [

                    "Status",
                    "Position Status",
                    "Member Status"

                ]

            );


        /*
        VALIDASI KOLOM
        */


        if (
            nicknameIndex === -1
        ) {

            throw new Error(
                "Kolom Nickname tidak ditemukan."
            );

        }


        if (
            idIndex === -1
        ) {

            throw new Error(
                "Kolom ID tidak ditemukan."
            );

        }


        if (
            roleIndex === -1
        ) {

            throw new Error(
                "Kolom Role tidak ditemukan."
            );

        }


        if (
            divisionIndex === -1
        ) {

            throw new Error(
                "Kolom Division tidak ditemukan."
            );

        }


        if (
            statusIndex === -1
        ) {

            throw new Error(
                "Kolom Status tidak ditemukan."
            );

        }


        /*
        RESET PLAYERS
        */


        players =
            [];


        /*
        LOOP DATA
        */


        for (
            let i = 1;
            i < rows.length;
            i++
        ) {


            const row =
                rows[i];


            /*
            DATA PLAYER
            */


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
                ).toUpperCase();


            const division =
                normalizeText(
                    row[divisionIndex]
                );


            const status =
                normalizeText(
                    row[statusIndex]
                );


            /*
            VALIDASI
            */


            if (
                nickname === ""
            ) {

                continue;

            }


            if (
                division === ""
            ) {

                continue;

            }


            /*
            TAMBAH PLAYER
            */


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


        /*
        BUAT DATA DIVISI
        */


        buildDivisions();


        /*
        RENDER
        */


        renderDivisions();


    }


    catch (
        error
    ) {


        console.error(
            "Google Sheet Error:",
            error
        );


        divisionContainer.innerHTML = `

            <div class="loading">

                Gagal memuat
                data Google Sheet.

                <br>
                <br>

                ${error.message}

            </div>

        `;

    }

}


/* =========================================================
   BUILD DIVISIONS
========================================================= */

function buildDivisions() {


    /*
    RESET DIVISIONS
    */


    divisions =
        [];


    /*
    GROUP DIVISION
    */


    const divisionMap =
        {};


    players.forEach(

        function (
            player
        ) {


            const key =
                normalizeKey(
                    player.division
                );


            /*
            JIKA BELUM ADA DIVISI
            */


            if (
                !divisionMap[key]
            ) {


                divisionMap[key] = {

                    name:
                        player.division,

                    players:
                        []

                };

            }


            /*
            TAMBAH PLAYER
            */


            divisionMap[key]
                .players
                .push(
                    player
                );

        }

    );


    /*
    UBAH KE ARRAY
    */


    divisions =
        Object.values(
            divisionMap
        );


    /*
    CARI LEADER
    */


    divisions.forEach(

        function (
            division
        ) {


            /*
            DEFAULT
            */


            division.leader =
                null;


            division.members =
                [];


            /*
            LOOP PLAYER
            */


            division.players.forEach(

                function (
                    player
                ) {


                    const status =
                        normalizeKey(
                            player.status
                        );


                    /*
                    STATUS LEADER
                    */


                    const isLeader =

                        status ===
                        "LEADER"

                        ||

                        status ===
                        "KETUA"

                        ||

                        status ===
                        "DIVISION LEADER"

                        ||

                        status ===
                        "CAPTAIN";


                    /*
                    JIKA LEADER
                    */


                    if (
                        isLeader &&
                        !division.leader
                    ) {

                        division.leader =
                            player;

                    }


                    /*
                    MEMBER
                    */


                    else {

                        division.members.push(
                            player
                        );

                    }

                }

            );


            /*
            JIKA TIDAK ADA LEADER
            */


            if (
                !division.leader &&
                division.players.length > 0
            ) {


                division.leader =
                    division.players[0];


                /*
                HAPUS LEADER
                DARI MEMBER
                */


                division.members =
                    division.players.slice(
                        1
                    );

            }

        }

    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */


/*
UNTUK MENCEGAH KARAKTER
DARI GOOGLE SHEET
MERUSAK HTML
*/


function escapeHTML(
    value
) {


    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(
        value
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
   RENDER DIVISIONS
========================================================= */

function renderDivisions() {


    /*
    CEK CONTAINER
    */


    if (
        !divisionContainer
    ) {

        return;

    }


    /*
    JIKA TIDAK ADA DATA
    */


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


    /*
    UPDATE DESCRIPTION
    */


    if (
        divisionDescription
    ) {


        divisionDescription.textContent =

            `${divisions.length} Divisi aktif dengan ${players.length} player.`;


    }


    /*
    CLEAR
    */


    divisionContainer.innerHTML =
        "";


    /*
    LOOP DIVISION
    */


    divisions.forEach(

        function (
            division,
            index
        ) {


            /*
            DIVISION NAME
            */


            const divisionName =
                escapeHTML(
                    division.name
                );


            /*
            DIVISION LOGO
            */


            const divisionLogo =
                getDivisionLogo(
                    division.name
                );


            /*
            LEADER
            */


            const leader =
                division.leader;


            /*
            MEMBER COUNT
            */


            const memberCount =
                division.members.length;


            /*
            TOTAL PLAYER
            */


            const totalPlayer =
                division.players.length;


            /*
            UNIQUE ID
            */


            const detailId =
                `division-details-${index}`;


            /*
            CREATE WRAPPER
            */


            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className =
                "division-wrapper";


            /*
            HTML
            */


            wrapper.innerHTML = `


                <!-- =====================================
                     DIVISION CARD
                ====================================== -->

                <div
                    class="division-card"
                >


                    <!-- LOGO -->

                    <div
                        class="division-logo"
                    >

                        <img
                            src="${divisionLogo}"
                            alt="${divisionName}"
                        >

                    </div>


                    <!-- INFO -->

                    <div
                        class="division-info"
                    >

                        <h3>

                            ${divisionName}

                        </h3>


                        <p>

                            Diketuai oleh

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


                        <!-- STATS -->

                        <div
                            class="division-stats"
                        >


                            <!-- TOTAL -->

                            <div
                                class="stat"
                            >

                                <span
                                    class="stat-number"
                                >

                                    ${totalPlayer}

                                </span>


                                <span
                                    class="stat-label"
                                >

                                    PLAYER

                                </span>

                            </div>


                            <!-- MEMBER -->

                            <div
                                class="stat"
                            >

                                <span
                                    class="stat-number"
                                >

                                    ${memberCount}

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

                            type="button"

                            data-target="${detailId}"

                            aria-expanded="false"

                        >

                            +

                        </button>


                    </div>


                </div>


                <!-- =====================================
                     DIVISION DETAILS
                ====================================== -->

                <div

                    id="${detailId}"

                    class="division-details"

                >


                    <!-- =================================
                         LEADER
                    ================================== -->

                    <div
                        class="detail-title"
                    >

                        DIVISION LEADER

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
                                    : "Belum ada Leader"}

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


                    <!-- =================================
                         MEMBERS TITLE
                    ================================== -->

                    <div
                        class="detail-title"
                    >

                        DIVISION MEMBERS

                    </div>


                    <!-- =================================
                         MEMBERS
                    ================================== -->

                    <div
                        class="member-grid"
                    >


                        ${

                            division.members.length > 0

                                ?

                                division.members.map(

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

                                            Belum ada member.

                                        </div>

                                    </div>

                                `

                        }


                    </div>


                </div>


            `;


            /*
            MASUKKAN KE CONTAINER
            */


            divisionContainer.appendChild(
                wrapper
            );

        }

    );


    /*
    PASANG EVENT BUTTON
    */


    setupDivisionButtons();

}


/* =========================================================
   DIVISION BUTTON EVENT
========================================================= */

function setupDivisionButtons() {


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


                    /*
                    TARGET ID
                    */


                    const targetId =
                        button.dataset.target;


                    /*
                    TARGET
                    */


                    const target =
                        document.getElementById(
                            targetId
                        );


                    /*
                    CEK TARGET
                    */


                    if (
                        !target
                    ) {

                        return;

                    }


                    /*
                    STATUS SEKARANG
                    */


                    const isOpen =
                        target.classList.contains(
                            "show"
                        );


                    /*
                    TUTUP SEMUA
                    */


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


                    /*
                    RESET BUTTON
                    */


                    document
                        .querySelectorAll(
                            ".division-button"
                        )
                        .forEach(

                            function (
                                btn
                            ) {

                                btn.textContent =
                                    "+";


                                btn.setAttribute(
                                    "aria-expanded",
                                    "false"
                                );

                            }

                        );


                    /*
                    JIKA SEBELUMNYA TERTUTUP
                    MAKA BUKA
                    */


                    if (
                        !isOpen
                    ) {


                        target.classList.add(
                            "show"
                        );


                        button.textContent =
                            "−";


                        button.setAttribute(
                            "aria-expanded",
                            "true"
                        );

                    }

                }

            );

        }

    );

}


/* =========================================================
   START
========================================================= */

loadDivisions();
