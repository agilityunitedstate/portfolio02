/* =========================================
   GOOGLE SHEET CONFIGURATION
========================================= */


/*
   MASUKKAN LINK GOOGLE SHEET CSV KAMU

   CONTOH:

   https://docs.google.com/spreadsheets/d/e/
   XXXXXXXX/pub?output=csv
*/

const SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ93uw-1XWwiTKhTOrOPjlBEcxBkFLT_Ol1XYVEggT2ir1Z76HcoLtC15nm_eD_w8R8bWDO8yiOFrDQ/pub?output=csv";


/* =========================================
   VARIABLES
========================================= */

let players = [];


const divisionContainer =
    document.getElementById(
        "division-container"
    );


const divisionDescription =
    document.getElementById(
        "division-description"
    );


/* =========================================
   MOBILE NAVIGATION
========================================= */

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


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(
    text
) {

    return String(
        text
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


/* =========================================
   CSV PARSER
========================================= */

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


        const nextChar =
            text[i + 1];


        /* QUOTE */

        if (
            char === '"'
        ) {

            if (
                insideQuotes &&
                nextChar === '"'
            ) {

                value += '"';

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
                value.trim()
            );

            value = "";

        }


        /* NEW LINE */

        else if (

            (
                char === "\n" ||
                char === "\r"
            )

            &&

            !insideQuotes

        ) {

            if (
                value !== "" ||
                row.length > 0
            ) {

                row.push(
                    value.trim()
                );


                rows.push(
                    row
                );


                row = [];

                value = "";

            }


            if (
                char === "\r" &&
                nextChar === "\n"
            ) {

                i++;

            }

        }


        /* NORMAL */

        else {

            value += char;

        }

    }


    /* LAST ROW */

    if (
        value !== "" ||
        row.length > 0
    ) {

        row.push(
            value.trim()
        );


        rows.push(
            row
        );

    }


    return rows;

}


/* =========================================
   LOAD GOOGLE SHEET
========================================= */

async function loadDivisions() {

    try {


        divisionContainer.innerHTML = `

            <div class="loading">

                Memuat data dari Google Sheet...

            </div>

        `;


        const response =
            await fetch(
                SHEET_URL
            );


        if (
            !response.ok
        ) {

            throw new Error(
                "Gagal mengambil data Google Sheet"
            );

        }


        const csvText =
            await response.text();


        const rows =
            parseCSV(
                csvText
            );


        players = [];


        /*
           DATA DIMULAI BARIS KEDUA

           BARIS PERTAMA = HEADER
        */

        for (
            let i = 1;
            i < rows.length;
            i++
        ) {

            const row =
                rows[i];


            const nickname =
                row[0]
                    ? row[0].trim()
                    : "";


            const id =
                row[1]
                    ? row[1].trim()
                    : "";


            const role =
                row[2]
                    ? row[2]
                        .trim()
                        .toUpperCase()
                    : "";


            const division =
                row[3]
                    ? row[3].trim()
                    : "";


            const status =
                row[4]
                    ? row[4]
                        .trim()
                        .toUpperCase()
                    : "MEMBER";


            /*
               MASUKKAN DATA

               HANYA JIKA ADA
               NICKNAME DAN DIVISION
            */

            if (
                nickname !== "" &&
                division !== ""
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


        console.log(
            "Division Data:",
            players
        );


        renderDivisions();


    }

    catch (
        error
    ) {

        console.error(
            error
        );


        divisionContainer.innerHTML = `

            <div class="loading error">

                <strong>

                    Gagal memuat Google Sheet.

                </strong>

                <br><br>

                Pastikan:

                <br><br>

                1. Google Sheet sudah Publish to Web

                <br>

                2. Link menggunakan output=csv

                <br>

                3. Kolom Sheet:

                nickname | id | role | division | status

            </div>

        `;

    }

}


/* =========================================
   GROUP DIVISIONS
========================================= */

function getDivisions() {

    const divisions =
        {};


    players.forEach(
        function (
            player
        ) {


            if (
                !divisions[
                    player.division
                ]
            ) {

                divisions[
                    player.division
                ] = [];

            }


            divisions[
                player.division
            ].push(
                player
            );


        }
    );


    return divisions;

}


/* =========================================
   RENDER DIVISION LIST
========================================= */

function renderDivisions() {


    const divisions =
        getDivisions();


    const divisionNames =
        Object.keys(
            divisions
        );


    /* DESCRIPTION */

    if (
        divisionDescription
    ) {

        divisionDescription.textContent =
            `${divisionNames.length} divisi kompetitif Agility United`;

    }


    /* CLEAR */

    divisionContainer.innerHTML =
        "";


    /* EMPTY */

    if (
        divisionNames.length === 0
    ) {

        divisionContainer.innerHTML = `

            <div class="loading">

                Belum ada data divisi.

            </div>

        `;

        return;

    }


    /* CREATE CARD */

    divisionNames.forEach(
        function (
            divisionName,
            index
        ) {


            const members =
                divisions[
                    divisionName
                ];


            /*
               FIND LEADER
            */

            const leader =
                members.find(
                    function (
                        player
                    ) {

                        return (

                            player.status ===
                            "LEADER"

                        );

                    }
                );


            const leaderName =
                leader
                    ? leader.nickname
                    : "Belum ditentukan";


            /*
               CREATE CARD
            */

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "division-card";


            card.innerHTML = `


                <div class="division-card-header">


                    <div class="division-card-title">


                        <span class="division-number">

                            DIVISION
                            ${String(
                                index + 1
                            ).padStart(
                                2,
                                "0"
                            )}

                        </span>


                        <h3>

                            ${escapeHTML(
                                divisionName
                            )}

                        </h3>


                        <p>

                            Dipimpin oleh:

                            <strong>

                                ${escapeHTML(
                                    leaderName
                                )}

                            </strong>

                        </p>


                    </div>


                    <div class="division-total">

                        👥

                        ${members.length}

                        MEMBERS

                    </div>


                </div>


                <button
                    class="division-button"
                    data-division="${escapeHTML(
                        divisionName
                    )}"
                >

                    LIHAT TIM

                    <span>

                        →

                    </span>

                </button>


            `;


            divisionContainer.appendChild(
                card
            );


        }
    );


    /* BUTTON EVENTS */

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


                    const divisionName =
                        button.dataset.division;


                    showDivisionDetail(
                        divisionName
                    );


                }
            );


        }
    );

}


/* =========================================
   SHOW DIVISION DETAIL
========================================= */

function showDivisionDetail(
    divisionName
) {


    const members =
        players.filter(
            function (
                player
            ) {

                return (

                    player.division ===
                    divisionName

                );

            }
        );


    /*
       FIND LEADER
    */

    const leader =
        members.find(
            function (
                player
            ) {

                return (

                    player.status ===
                    "LEADER"

                );

            }
        );


    /*
       CREATE MEMBERS HTML
    */

    let membersHTML =
        "";


    members.forEach(
        function (
            member,
            index
        ) {


            const isLeader =
                member.status ===
                "LEADER";


            const statusText =
                isLeader
                    ? "KETUA"
                    : "MEMBER";


            const statusClass =
                isLeader
                    ? "status-leader"
                    : "status-member";


            membersHTML += `


                <div class="team-member-row">


                    <!-- NUMBER -->

                    <div class="member-index">

                        ${String(
                            index + 1
                        ).padStart(
                            2,
                            "0"
                        )}

                    </div>


                    <!-- AVATAR -->

                    <div class="member-avatar">

                        👤

                    </div>


                    <!-- NICKNAME -->

                    <div class="member-nickname">

                        ${escapeHTML(
                            member.nickname
                        )}

                    </div>


                    <!-- GAME ID -->

                    <div class="member-game-id">

                        ${escapeHTML(
                            member.id
                        )}

                    </div>


                    <!-- ROLE -->

                    <div>

                        <span class="role-badge">

                            ${escapeHTML(
                                member.role
                            )}

                        </span>

                    </div>


                    <!-- STATUS -->

                    <div
                        class="member-status ${statusClass}"
                    >

                        ${statusText}

                    </div>


                </div>


            `;


        }
    );


    /* =========================================
       DETAIL HTML
    ========================================== */

    divisionContainer.innerHTML = `


        <section class="division-detail">


            <!-- BACK -->

            <button
                class="back-button"
                id="backButton"
            >

                ← KEMBALI KE DIVISI

            </button>


            <!-- TEAM HEADER -->

            <div class="team-header">


                <div>


                    <p class="team-small-title">

                        AGILITY UNITED

                    </p>


                    <h2>

                        ${escapeHTML(
                            divisionName
                        )}

                    </h2>


                    <p class="team-description">

                        Competitive Division
                        Agility United

                    </p>


                </div>


                <div class="team-count">


                    <strong>

                        ${members.length}

                    </strong>


                    <span>

                        MEMBERS

                    </span>


                </div>


            </div>


            <!-- LEADER -->

            <div class="team-leader-section">


                <p class="section-label">

                    ♛ KETUA DIVISI

                </p>


                <div class="leader-card">


                    <div class="leader-avatar">

                        👤

                    </div>


                    <div class="leader-information">


                        <span>

                            DIVISION LEADER

                        </span>


                        <h3>

                            ${

                                leader

                                    ? escapeHTML(
                                        leader.nickname
                                    )

                                    : "Belum ditentukan"

                            }

                        </h3>


                        <p>

                            ID:

                            ${

                                leader

                                    ? escapeHTML(
                                        leader.id
                                    )

                                    : "-"

                            }

                        </p>


                    </div>


                    <div class="leader-role">

                        ${

                            leader

                                ? escapeHTML(
                                    leader.role
                                )

                                : "-"

                        }

                    </div>


                </div>


            </div>


            <!-- MEMBERS -->

            <div class="team-members-section">


                <p class="section-label">

                    👥 TEAM MEMBERS

                </p>


                <!-- HEADER -->

                <div class="team-table-header">


                    <div>

                        #

                    </div>


                    <div></div>


                    <div>

                        NICKNAME

                    </div>


                    <div>

                        GAME ID

                    </div>


                    <div>

                        ROLE

                    </div>


                    <div>

                        STATUS

                    </div>


                </div>


                <!-- DATA -->

                <div class="team-members-list">

                    ${membersHTML}

                </div>


            </div>


        </section>


    `;


    /*
       BACK EVENT
    */

    const backButton =
        document.getElementById(
            "backButton"
        );


    if (
        backButton
    ) {

        backButton.addEventListener(
            "click",
            function () {

                renderDivisions();

                window.scrollTo(
                    {
                        top: 0,
                        behavior: "smooth"
                    }
                );

            }
        );

    }

}


/* =========================================
   START
========================================= */

loadDivisions();
