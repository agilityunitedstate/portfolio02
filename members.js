/* =========================================
   GOOGLE SHEET CONFIGURATION
========================================= */


/*
    GANTI URL DI BAWAH INI

    Dengan URL CSV Google Sheet kamu
*/

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSJnrF27QnQSNsZP6LGyzMD1053hz8Zqscskhd26ENN8blQ_O_sORgoXghFevrOex3XA6A_nr_oXbtR/pub?output=csv";


/* =========================================
   ELEMENT
========================================= */

const membersContainer =
    document.getElementById(
        "membersContainer"
    );


const totalMembers =
    document.getElementById(
        "totalMembers"
    );


const memberCount =
    document.getElementById(
        "memberCount"
    );


const searchInput =
    document.getElementById(
        "searchInput"
    );


const filterButtons =
    document.querySelectorAll(
        ".filter-btn"
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
   DATA
========================================= */

let players = [];


let activeRole = "ALL";


/* =========================================
   LOAD GOOGLE SHEET
========================================= */

async function loadMembers() {

    try {


        const response =
            await fetch(
                SHEET_URL
            );


        const data =
            await response.text();


        const rows =
            parseCSV(
                data
            );


        players =
            rows;


        updateMemberStats();


        renderMembers();


    }

    catch (error) {


        console.error(
            "Error loading members:",
            error
        );


        membersContainer.innerHTML = `

            <div class="empty-message">

                <h3>
                    Gagal memuat data player
                </h3>

                <br>

                <p>
                    Periksa URL Google Sheet
                    atau koneksi internet.
                </p>

            </div>

        `;

    }

}


/* =========================================
   CSV PARSER
========================================= */

function parseCSV(text) {

    const lines =
        text
        .trim()
        .split("\n");


    if (
        lines.length < 2
    ) {

        return [];

    }


    const headers =
        lines[0]
        .split(",")
        .map(

            header =>

            header
            .trim()
            .toLowerCase()

        );


    const nicknameIndex =
        headers.indexOf(
            "nickname"
        );


    const idIndex =
        headers.indexOf(
            "id"
        );


    const roleIndex =
        headers.indexOf(
            "role"
        );


    const result = [];


    for (
        let i = 1;

        i < lines.length;

        i++
    ) {


        const columns =
            lines[i]
            .split(",");


        const nickname =
            columns[nicknameIndex]
            ?.trim();


        const id =
            columns[idIndex]
            ?.trim();


        const role =
            columns[roleIndex]
            ?.trim()
            .toUpperCase();


        if (
            nickname &&
            id &&
            role
        ) {


            result.push({

                nickname:

                    nickname,


                id:

                    id,


                role:

                    role

            });

        }

    }


    return result;

}


/* =========================================
   UPDATE STATS
========================================= */

function updateMemberStats() {

    totalMembers.textContent =
        players.length;

}


/* =========================================
   RENDER MEMBERS
========================================= */

function renderMembers() {


    const searchValue =
        searchInput
        .value
        .toLowerCase()
        .trim();


    const filteredPlayers =
        players.filter(

            player => {


                const matchRole =

                    activeRole === "ALL"

                    ||

                    player.role === activeRole;


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


                return

                    matchRole
                    &&
                    matchSearch;

            }

        );


    memberCount.textContent =

        `${filteredPlayers.length} PLAYERS`;


    if (
        filteredPlayers.length === 0
    ) {


        membersContainer.innerHTML = `

            <div class="empty-message">

                <h3>
                    Player tidak ditemukan
                </h3>

                <p>
                    Coba gunakan pencarian lain.
                </p>

            </div>

        `;


        return;

    }


    membersContainer.innerHTML =

        filteredPlayers
        .map(

            (
                player,
                index
            ) =>

            createMemberCard(
                player,
                index
            )

        )

        .join("");

}


/* =========================================
   MEMBER CARD
========================================= */

function createMemberCard(

    player,
    index

) {


    const number =

        String(
            index + 1
        )
        .padStart(
            2,
            "0"
        );


    return `

        <article class="member-card">


            <div class="member-number">

                ${number}

            </div>


            <div class="member-avatar">

                ⚡

            </div>


            <h3 class="member-nickname">

                ${escapeHTML(
                    player.nickname
                )}

            </h3>


            <p class="member-id">

                ID:
                ${escapeHTML(
                    player.id
                )}

            </p>


            <div class="member-role">

                ROLE

                ${escapeHTML(
                    player.role
                )}

            </div>


        </article>

    `;

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


/* =========================================
   SEARCH
========================================= */

searchInput.addEventListener(

    "input",

    function () {

        renderMembers();

    }

);


/* =========================================
   ROLE FILTER
========================================= */

filterButtons.forEach(

    button => {


        button.addEventListener(

            "click",

            function () {


                filterButtons.forEach(

                    btn =>

                    btn.classList.remove(
                        "active"
                    )

                );


                this.classList.add(
                    "active"
                );


                activeRole =
                    this.dataset.role;


                renderMembers();

            }

        );

    }

);


/* =========================================
   MOBILE MENU
========================================= */

menuToggle.addEventListener(

    "click",

    function () {


        navMenu.classList.toggle(
            "show"
        );


    }

);


/* =========================================
   CLOSE MENU AFTER CLICK
========================================= */

document
.querySelectorAll(
    ".nav-menu a"
)
.forEach(

    link => {


        link.addEventListener(

            "click",

            function () {


                navMenu.classList.remove(
                    "show"
                );


            }

        );

    }

);


/* =========================================
   START
========================================= */

loadMembers();
