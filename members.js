/* ========================================
   GOOGLE SHEET CONFIGURATION
======================================== */


/*
========================================

MASUKKAN ID GOOGLE SHEET DISINI

CONTOH LINK:

https://docs.google.com/spreadsheets/d/
1ABCDEF123456789XYZ
/edit#gid=0

MAKA SHEET ID ADALAH:

1ABCDEF123456789XYZ

========================================
*/

const SHEET_ID =
    "GANTI_DENGAN_SHEET_ID_KAMU";


/*
========================================

NAMA TAB GOOGLE SHEET

CONTOH:

Sheet1

Members

Data Player

========================================
*/

const SHEET_NAME =
    "Sheet1";


/* ========================================
   GOOGLE SHEET URL
======================================== */

const SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSJnrF27QnQSNsZP6LGyzMD1053hz8Zqscskhd26ENN8blQ_O_sORgoXghFevrOex3XA6A_nr_oXbtR/pub?output=csv";


/* ========================================
   VARIABLES
======================================== */

let players = [];

let currentRole = "ALL";


const playerContainer =
    document.getElementById(
        "playerContainer"
    );


const playerCount =
    document.getElementById(
        "playerCount"
    );


const searchInput =
    document.getElementById(
        "searchInput"
    );


const emptyState =
    document.getElementById(
        "emptyState"
    );


const menuToggle =
    document.getElementById(
        "menuToggle"
    );


const navMenu =
    document.getElementById(
        "navMenu"
    );


/* ========================================
   MOBILE MENU
======================================== */

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


/* ========================================
   LOAD GOOGLE SHEET
======================================== */

async function loadPlayers() {

    try {

        const response =
            await fetch(
                SHEET_URL
            );


        const text =
            await response.text();


        /*
        GOOGLE RESPONSE

        google.visualization.Query.setResponse(...)

        KITA AMBIL JSON DIDALAMNYA
        */


        const jsonText =
            text
                .substring(
                    text.indexOf("{"),
                    text.lastIndexOf("}") + 1
                );


        const data =
            JSON.parse(
                jsonText
            );


        const rows =
            data.table.rows;


        players = [];


        rows.forEach(

            function (row) {


                if (!row.c) {

                    return;

                }


                const nickname =
                    row.c[0]
                        ? row.c[0].v
                        : "";


                const id =
                    row.c[1]
                        ? row.c[1].v
                        : "";


                const role =
                    row.c[2]
                        ? String(
                            row.c[2].v
                        ).toUpperCase()
                        : "";


                /*
                VALIDASI DATA

                HANYA MASUKKAN
                JIKA ADA NICKNAME
                */

                if (
                    nickname
                ) {

                    players.push({

                        nickname:
                            String(
                                nickname
                            ),

                        id:
                            String(
                                id
                            ),

                        role:
                            role

                    });

                }


            }

        );


        renderPlayers();

    }

    catch (
        error
    ) {

        console.error(
            "Google Sheet Error:",
            error
        );


        playerContainer.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="loading"
                >

                    Gagal memuat data Google Sheet.

                    <br>

                    <br>

                    Periksa:
                    Sheet ID,
                    Sheet Name,
                    dan pengaturan Publish.

                </td>

            </tr>

        `;

    }

}


/* ========================================
   RENDER PLAYERS
======================================== */

function renderPlayers() {


    const searchValue =
        searchInput
            .value
            .toLowerCase()
            .trim();


    /*
    FILTER DATA
    */

    const filteredPlayers =
        players.filter(

            function (
                player
            ) {


                const matchSearch =

                    player.nickname
                        .toLowerCase()
                        .includes(
                            searchValue
                        )

                    ||

                    player.id
                        .toLowerCase()
                        .includes(
                            searchValue
                        );


                const matchRole =

                    currentRole ===
                    "ALL"

                    ||

                    player.role ===
                    currentRole;


                return

                    matchSearch

                    &&

                    matchRole;

            }

        );


    /*
    UPDATE PLAYER COUNT
    */

    playerCount.textContent =
        filteredPlayers.length;


    /*
    CLEAR TABLE
    */

    playerContainer.innerHTML =
        "";


    /*
    EMPTY STATE
    */

    if (
        filteredPlayers.length === 0
    ) {


        playerContainer.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="loading"
                >

                    Tidak ada player ditemukan.

                </td>

            </tr>

        `;


        emptyState.style.display =
            "block";


        return;

    }


    emptyState.style.display =
        "none";


    /*
    CREATE TABLE
    */

    filteredPlayers.forEach(

        function (
            player,
            index
        ) {


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td
                    class="player-number"
                >

                    ${index + 1}

                </td>


                <td
                    class="player-name"
                >

                    ${player.nickname}

                </td>


                <td
                    class="player-id"
                >

                    ${player.id}

                </td>


                <td>

                    <span
                        class="role-badge"
                    >

                        ${player.role}

                    </span>

                </td>

            `;


            playerContainer.appendChild(
                row
            );


        }

    );


}


/* ========================================
   SEARCH
======================================== */

searchInput.addEventListener(

    "input",

    function () {

        renderPlayers();

    }

);


/* ========================================
   ROLE FILTER
======================================== */

const filterButtons =
    document.querySelectorAll(
        ".filter-btn"
    );


filterButtons.forEach(

    function (
        button
    ) {


        button.addEventListener(

            "click",

            function () {


                /*
                HAPUS ACTIVE
                */

                filterButtons.forEach(

                    function (
                        btn
                    ) {

                        btn.classList.remove(
                            "active"
                        );

                    }

                );


                /*
                TAMBAH ACTIVE
                */

                button.classList.add(
                    "active"
                );


                /*
                ROLE
                */

                currentRole =
                    button.dataset.role;


                /*
                RENDER
                */

                renderPlayers();


            }

        );


    }

);


/* ========================================
   START
======================================== */

loadPlayers();
