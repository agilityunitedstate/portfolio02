/* =========================================
   GOOGLE SHEET CONFIGURATION
========================================= */

/*
   MASUKKAN LINK CSV GOOGLE SHEET

   CONTOH:

   https://docs.google.com/spreadsheets/d/e/
   2PACX-XXXXXXX/pub?output=csv
*/

const SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ93uw-1XWwiTKhTOrOPjlBEcxBkFLT_Ol1XYVEggT2ir1Z76HcoLtC15nm_eD_w8R8bWDO8yiOFrDQ/pub?output=csv";


/* =========================================
   VARIABLES
========================================= */

let players = [];


/*
   ELEMENT DIVISION
*/

const divisionContainer =
    document.getElementById(
        "division-container"
    );


const divisionDescription =
    document.getElementById(
        "division-description"
    );


/*
   MOBILE MENU
*/

const menuToggle =
    document.getElementById(
        "menuToggle"
    );


const navMenu =
    document.getElementById(
        "navMenu"
    );


/* =========================================
   MOBILE NAVBAR
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
   ESCAPE HTML
========================================= */

function escapeHTML(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================
   PARSE CSV
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

        const nextChar =
            text[i + 1];


        /*
           HANDLE QUOTES
        */

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


        /*
           HANDLE COMMA
        */

        else if (
            char === "," &&
            !insideQuotes
        ) {

            row.push(
                value.trim()
            );

            value = "";

        }


        /*
           HANDLE NEW LINE
        */

        else if (
            (
                char === "\n" ||
                char === "\r"
            ) &&
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


            /*
               HANDLE WINDOWS LINE BREAK
            */

            if (
                char === "\r" &&
                nextChar === "\n"
            ) {

                i++;

            }

        }


        /*
           NORMAL CHARACTER
        */

        else {

            value += char;

        }

    }


    /*
       LAST ROW
    */

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


        /*
           LOADING
        */

        divisionContainer.innerHTML = `

            <div class="loading">

                Memuat data divisi...

            </div>

        `;


        /*
           FETCH SHEET
        */

        const response =
            await fetch(
                SHEET_URL
            );


        /*
           CHECK RESPONSE
        */

        if (
            !response.ok
        ) {

            throw new Error(
                "Gagal mengambil Google Sheet"
            );

        }


        /*
           GET CSV
        */

        const csvText =
            await response.text();


        console.log(
            "Google Sheet CSV:",
            csvText
        );


        /*
           PARSE CSV
        */

        const rows =
            parseCSV(
                csvText
            );


        console.log(
            "CSV Rows:",
            rows
        );


        /*
           RESET PLAYER
        */

        players = [];


        /*
           CEK DATA
        */

        if (
            rows.length <= 1
        ) {

            throw new Error(
                "Data Google Sheet kosong"
            );

        }


        /*
        =========================================

        FORMAT GOOGLE SHEET

        A = nickname
        B = id
        C = role
        D = division
        E = status

        =========================================
        */


        /*
           MULAI DARI BARIS KE-2

           BARIS PERTAMA HEADER
        */

        for (
            let i = 1;
            i < rows.length;
            i++
        ) {

            const row =
                rows[i];


            /*
               NICKNAME
            */

            const nickname =
                row[0]
                    ? row[0].trim()
                    : "";


            /*
               ID
            */

            const id =
                row[1]
                    ? row[1].trim()
                    : "";


            /*
               ROLE
            */

            const role =
                row[2]
                    ? row[2]
                        .trim()
                        .toUpperCase()
                    : "";


            /*
               DIVISION
            */

            const division =
                row[3]
                    ? row[3].trim()
                    : "";


            /*
               STATUS
            */

            const status =
                row[4]
                    ? row[4]
                        .trim()
                        .toUpperCase()
                    : "MEMBER";


            /*
               VALIDASI
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


        /*
           DEBUG
        */

        console.log(
            "Players Loaded:",
            players
        );


        /*
           RENDER DIVISION
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

            <div class="loading error">

                <strong>

                    Gagal memuat data Google Sheet.

                </strong>

                <br><br>

                Periksa:

                <br>

                • Link CSV

                <br>

                • Publish to Web

                <br>

                • Format kolom Google Sheet

            </div>

        `;

    }

}


/* =========================================
   GROUP DIVISIONS
========================================= */

function getDivisions() {

    const divisions = {};


    players.forEach(
        function (
            player
        ) {

            /*
               JIKA DIVISION BELUM ADA
            */

            if (
                !divisions[
                    player.division
                ]
            ) {

                divisions[
                    player.division
                ] = [];

            }


            /*
               MASUKKAN PLAYER
            */

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


    /*
       GET GROUP
    */

    const divisions =
        getDivisions();


    /*
       GET NAMES
    */

    const divisionNames =
        Object.keys(
            divisions
        );


    /*
       UPDATE DESCRIPTION
    */

    if (
        divisionDescription
    ) {

        divisionDescription.textContent =
            `${divisionNames.length} divisi kompetitif Agility United`;

    }


    /*
       CLEAR
    */

    divisionContainer.innerHTML =
        "";


    /*
       JIKA TIDAK ADA DIVISI
    */

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


    /*
       CREATE CARD
    */

    divisionNames.forEach(
        function (
            divisionName,
            index
        ) {


            /*
               GET MEMBERS
            */

            const members =
                divisions[
                    divisionName
                ];


            /*
               CARI LEADER
            */

            const leader =
                members.find(
                    function (
                        member
                    ) {

                        return (

                            member.status ===
                            "LEADER"

                        );

                    }
                );


            /*
               LEADER NAME
            */

            const leaderName =
                leader
                    ? leader.nickname
                    : "Belum ditentukan";


            /*
               TOTAL MEMBER
            */

            const totalMembers =
                members.length;


            /*
               CREATE CARD
            */

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "division-card";


            /*
               CARD HTML
            */

            card.innerHTML = `


                <!-- =====================================
                     HEADER DIVISION
                ====================================== -->

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


                    <!-- MEMBER COUNT -->

                    <div class="division-total">

                        👥

                        ${totalMembers}

                        MEMBERS

                    </div>


                </div>


                <!-- =====================================
                     BUTTON
                ====================================== -->

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


            /*
               ADD CARD
            */

            divisionContainer.appendChild(
                card
            );


        }
    );


    /*
       BUTTON EVENT
    */

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


    /*
       GET MEMBERS
    */

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
       GET LEADER
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
       GET MEMBER ONLY
    */

    const memberList =
        members.filter(
            function (
                player
            ) {

                return (

                    player.status !==
                    "LEADER"

                );

            }
        );


    /*
       CREATE MEMBER ROWS
    */

    let membersHTML =
        "";


    members.forEach(
        function (
            member,
            index
        ) {


            /*
               STATUS TEXT
            */

            const isLeader =
                member.status ===
                "LEADER";


            const statusText =
                isLeader
                    ? "KETUA"
                    : "MEMBER";


            /*
               STATUS CLASS
            */

            const statusClass =
                isLeader
                    ? "status-leader"
                    : "status-member";


            /*
               CREATE ROW
            */

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


                    <!-- ICON -->

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


    /*
       CREATE DETAIL PAGE
    */

    divisionContainer.innerHTML = `


        <!-- =====================================
             DIVISION DETAIL
        ====================================== -->

        <section class="division-detail">


            <!-- BACK BUTTON -->

            <button
                class="back-button"
                id="backButton"
            >

                ←

                KEMBALI KE DIVISI

            </button>


            <!-- =====================================
                 DIVISION HEADER
            ====================================== -->

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

                        Tim kompetitif
                        Agility United

                    </p>


                </div>


                <!-- TOTAL MEMBER -->

                <div class="team-count">

                    <strong>

                        ${members.length}

                    </strong>

                    <span>

                        MEMBERS

                    </span>

                </div>


            </div>


            <!-- =====================================
                 LEADER SECTION
            ====================================== -->

            <div class="team-leader-section">


                <div class="section-label">

                    ♛

                    KETUA DIVISI

                </div>


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


                    <!-- ROLE -->

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


            <!-- =====================================
                 TEAM MEMBERS
            ====================================== -->

            <div class="team-members-section">


                <div class="section-label">

                    👥

                    TEAM MEMBERS

                </div>


                <!-- TABLE HEADER -->

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


                <!-- MEMBER DATA -->

                <div
                    class="team-members-list"
                >

                    ${membersHTML}

                </div>


            </div>


        </section>

    `;


    /*
       BACK BUTTON
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

            }
        );

    }


}


/* =========================================
   START
========================================= */

loadDivisions();
