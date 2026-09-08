/* ========================================
   GOOGLE SHEET CONFIGURATION
======================================== */

/*
   LINK GOOGLE SHEET YANG SUDAH
   PUBLISH TO WEB FORMAT CSV
*/

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
   PARSE CSV
======================================== */

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
        QUOTES
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
        COMMA
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
        NEW LINE
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
            HANDLE WINDOWS \r\n
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
    LAST VALUE
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


/* ========================================
   LOAD GOOGLE SHEET
======================================== */

async function loadPlayers() {

    try {


        /*
        LOADING
        */

        playerContainer.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="loading"
                >

                    Memuat data player...

                </td>

            </tr>

        `;


        /*
        FETCH GOOGLE SHEET
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
        GET CSV TEXT
        */

        const csvText =
            await response.text();


        /*
        DEBUG
        */

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
            "Parsed Rows:",
            rows
        );


        /*
        RESET PLAYERS
        */

        players = [];


        /*
        CEK APAKAH ADA DATA
        */

        if (
            rows.length <= 1
        ) {

            throw new Error(
                "Data Google Sheet kosong"
            );

        }


        /*
        MULAI DARI INDEX 1

        INDEX 0 ADALAH HEADER:

        nickname | id | role
        */

        for (
            let i = 1;
            i < rows.length;
            i++
        ) {


            const row =
                rows[i];


            /*
            AMBIL DATA
            */

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


            /*
            MASUKKAN DATA
            JIKA NICKNAME ADA
            */

            if (
                nickname !== ""
            ) {

                players.push({

                    nickname:
                        nickname,

                    id:
                        id,

                    role:
                        role

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
        TAMPILKAN PLAYER
        */

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
                    class="loading error"
                >

                    <strong>
                        Gagal memuat data Google Sheet.
                    </strong>

                    <br>

                    <br>

                    Periksa pengaturan
                    Publish to Web Google Sheet.

                </td>

            </tr>

        `;


        if (
            playerCount
        ) {

            playerCount.textContent =
                "0";

        }

    }

}


/* ========================================
   RENDER PLAYERS
======================================== */

function renderPlayers() {


    /*
    JIKA ELEMENT BELUM ADA
    */

    if (
        !playerContainer
    ) {

        return;

    }


    /*
    SEARCH VALUE
    */

    const searchValue =
        searchInput
            ? searchInput
                .value
                .toLowerCase()
                .trim()
            : "";


    /*
    FILTER DATA
    */

    const filteredPlayers =
        players.filter(
            function (
                player
            ) {


                const nickname =
                    player.nickname
                        .toLowerCase();


                const id =
                    player.id
                        .toLowerCase();


                /*
                SEARCH
                */

                const matchSearch =

                    nickname.includes(
                        searchValue
                    )

                    ||

                    id.includes(
                        searchValue
                    );


                /*
                ROLE
                */

                const matchRole =

                    currentRole ===
                    "ALL"

                    ||

                    player.role ===
                    currentRole;


                return (

                    matchSearch

                    &&

                    matchRole

                );

            }
        );


    /*
    UPDATE COUNT
    */

    if (
        playerCount
    ) {

        playerCount.textContent =
            filteredPlayers.length;

    }


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


        if (
            emptyState
        ) {

            emptyState.style.display =
                "block";

        }


        return;

    }


    /*
    HIDE EMPTY STATE
    */

    if (
        emptyState
    ) {

        emptyState.style.display =
            "none";

    }


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
                        class="role-badge role-${player.role}"
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

if (
    searchInput
) {

    searchInput.addEventListener(
        "input",
        function () {

            renderPlayers();

        }
    );

}


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
                REMOVE ACTIVE
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
                ADD ACTIVE
                */

                button.classList.add(
                    "active"
                );


                /*
                GET ROLE
                */

                currentRole =
                    button.dataset.role
                        .toUpperCase();


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
