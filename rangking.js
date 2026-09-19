/* =========================================================
   AGILITY UNITED - RANKING SYSTEM
   ========================================================= */

/* =========================================================
   GOOGLE SHEET URL
   ========================================================= */

/*
   GANTI 2 URL DI BAWAH INI

   PLAYER_SHEET_URL = Google Sheet untuk Ranking Player
   TEAM_SHEET_URL   = Google Sheet untuk Ranking Team

   Jika menggunakan sheet/tab yang berbeda dalam satu file Google
   Spreadsheet, gunakan parameter gid.

   Contoh:
   https://docs.google.com/spreadsheets/d/e/XXXXXXXX/pub?gid=123456&single=true&output=csv
*/

const PLAYER_SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQurMK3b5wBqlKc0RVJzESByiHS2zTs9dBRkqS6dKMpcfblYHsmDEXQ_exobsZOTBNRz5E0_o6aDz4d/pub?output=csv";

const TEAM_SHEET_URL =
    "PASTE_URL_CSV_RANKING_TEAM_DI_SINI";


/* =========================================================
   GLOBAL DATA
   ========================================================= */

let playerData = [];
let teamData = [];

let currentPlayerStat = "scorer";


/* =========================================================
   ELEMENTS
   ========================================================= */

const playerRankingBody =
    document.getElementById("playerRankingBody");

const teamRankingBody =
    document.getElementById("teamRankingBody");

const playerPodium =
    document.getElementById("playerPodium");

const teamPodium =
    document.getElementById("teamPodium");

const rankingTable =
    document.getElementById("rankingTable");

const teamRankingTable =
    document.getElementById("teamRankingTable");

const playerEmpty =
    document.getElementById("playerEmpty");

const teamEmpty =
    document.getElementById("teamEmpty");


/* =========================================================
   CSV PARSER
   ========================================================= */

function parseCSV(text) {

    const rows = [];
    let row = [];
    let value = "";
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {

        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"' && insideQuotes && nextChar === '"') {
            value += '"';
            i++;
        }

        else if (char === '"') {
            insideQuotes = !insideQuotes;
        }

        else if (char === "," && !insideQuotes) {
            row.push(value.trim());
            value = "";
        }

        else if (
            (char === "\n" || char === "\r") &&
            !insideQuotes
        ) {

            if (char === "\r" && nextChar === "\n") {
                i++;
            }

            row.push(value.trim());

            if (row.some(cell => cell !== "")) {
                rows.push(row);
            }

            row = [];
            value = "";
        }

        else {
            value += char;
        }
    }

    if (value !== "" || row.length > 0) {

        row.push(value.trim());

        if (row.some(cell => cell !== "")) {
            rows.push(row);
        }
    }

    return rows;
}


/* =========================================================
   CONVERT CSV TO OBJECT
   ========================================================= */

function csvToObjects(text) {

    const rows = parseCSV(text);

    if (rows.length < 2) {
        return [];
    }

    const headers = rows[0].map(header =>
        header
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "_")
    );

    return rows.slice(1).map(row => {

        const obj = {};

        headers.forEach((header, index) => {
            obj[header] = row[index]
                ? row[index].trim()
                : "";
        });

        return obj;

    });
}


/* =========================================================
   NUMBER FORMAT
   ========================================================= */

function toNumber(value) {

    if (value === null || value === undefined) {
        return 0;
    }

    const number = String(value)
        .replace(/,/g, "")
        .replace(/\./g, "");

    const result = Number(number);

    return isNaN(result) ? 0 : result;
}


/* =========================================================
   FETCH CSV
   ========================================================= */

async function fetchCSV(url) {

    if (
        !url ||
        url.includes("PASTE_URL") ||
        url.includes("DI_SINI")
    ) {
        throw new Error(
            "Google Sheet URL belum dimasukkan."
        );
    }

    const separator = url.includes("?")
        ? "&"
        : "?";

    const cacheBuster =
        `${separator}t=${Date.now()}`;

    const response =
        await fetch(url + cacheBuster);

    if (!response.ok) {
        throw new Error(
            `Gagal mengambil data (${response.status})`
        );
    }

    const text = await response.text();

    return csvToObjects(text);
}


/* =========================================================
   LOAD ALL DATA
   ========================================================= */

async function loadRankingData() {

    showLoading();

    try {

        const [players, teams] =
            await Promise.all([
                fetchCSV(PLAYER_SHEET_URL),
                fetchCSV(TEAM_SHEET_URL)
            ]);

        playerData = players;
        teamData = teams;

        console.log(
            "Player Data:",
            playerData
        );

        console.log(
            "Team Data:",
            teamData
        );

        renderPlayerRanking(
            currentPlayerStat
        );

        renderTeamRanking();

    }

    catch (error) {

        console.error(
            "Ranking Error:",
            error
        );

        showError(
            "Data ranking tidak dapat dimuat. Periksa URL Google Sheet."
        );

    }

}


/* =========================================================
   PLAYER STAT BUTTON
   ========================================================= */

const playerStatButtons =
    document.querySelectorAll(
        "[data-player-stat]"
    );

playerStatButtons.forEach(button => {

    button.addEventListener(
        "click",
        function () {

            playerStatButtons.forEach(btn =>
                btn.classList.remove("active")
            );

            this.classList.add("active");

            currentPlayerStat =
                this.dataset.playerStat;

            renderPlayerRanking(
                currentPlayerStat
            );

        }
    );

});


/* =========================================================
   PLAYER RANKING
   ========================================================= */

function renderPlayerRanking(stat) {

    if (!playerRankingBody) {
        return;
    }

    let sortedPlayers =
        [...playerData]
            .filter(player =>
                player.nickname &&
                player.nickname.trim() !== ""
            )
            .map(player => {

                return {

                    nickname:
                        player.nickname,

                    division:
                        player.division ||
                        "-",

                    scorer:
                        toNumber(player.scorer),

                    assist:
                        toNumber(player.assist),

                    defend:
                        toNumber(player.defend),

                    save:
                        toNumber(player.save)

                };

            });

    sortedPlayers.sort(
        (a, b) =>
            b[stat] - a[stat]
    );

    if (sortedPlayers.length === 0) {

        showPlayerEmpty();

        return;
    }

    hidePlayerEmpty();

    renderPlayerTable(
        sortedPlayers,
        stat
    );

    renderPlayerPodium(
        sortedPlayers,
        stat
    );

}


/* =========================================================
   PLAYER TABLE
   ========================================================= */

function renderPlayerTable(
    players,
    stat
) {

    playerRankingBody.innerHTML = "";

    players.forEach(
        (player, index) => {

            const rank =
                index + 1;

            const row =
                document.createElement("tr");

            let rankClass = "";

            if (rank === 1) {
                rankClass = "rank-first";
            }

            else if (rank === 2) {
                rankClass = "rank-second";
            }

            else if (rank === 3) {
                rankClass = "rank-third";
            }

            row.innerHTML = `

                <td>
                    <span class="rank-number ${rankClass}">
                        ${rank}
                    </span>
                </td>

                <td>
                    <div class="player-name">
                        ${escapeHTML(
                            player.nickname
                        )}
                    </div>
                </td>

                <td>
                    <span class="division-name">
                        ${escapeHTML(
                            player.division
                        )}
                    </span>
                </td>

                <td>
                    <strong class="stat-value">
                        ${player[stat]}
                    </strong>
                </td>

            `;

            playerRankingBody.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   PLAYER PODIUM
   ========================================================= */

function renderPlayerPodium(
    players,
    stat
) {

    if (!playerPodium) {
        return;
    }

    playerPodium.innerHTML = "";

    const topThree =
        players.slice(0, 3);

    /*
       Tampilkan podium dengan urutan:
       Juara 2 - Juara 1 - Juara 3
    */

    const podiumOrder = [];

    if (topThree[1]) {
        podiumOrder.push({
            player: topThree[1],
            position: 2
        });
    }

    if (topThree[0]) {
        podiumOrder.push({
            player: topThree[0],
            position: 1
        });
    }

    if (topThree[2]) {
        podiumOrder.push({
            player: topThree[2],
            position: 3
        });
    }

    podiumOrder.forEach(item => {

        const player =
            item.player;

        const card =
            document.createElement("div");

        card.className =
            `podium-card podium-${item.position}`;

        card.innerHTML = `

            <div class="podium-rank">
                ${item.position}
            </div>

            <div class="podium-player">
                ${escapeHTML(
                    player.nickname
                )}
            </div>

            <div class="podium-division">
                ${escapeHTML(
                    player.division
                )}
            </div>

            <div class="podium-stat">
                ${player[stat]}
            </div>

        `;

        playerPodium.appendChild(
            card
        );

    });

}


/* =========================================================
   TEAM RANKING
   ========================================================= */

function renderTeamRanking() {

    if (!teamRankingBody) {
        return;
    }

    let teams =
        [...teamData]
            .filter(team =>
                team.team &&
                team.team.trim() !== ""
            )
            .map(team => {

                return {

                    team:
                        team.team,

                    match:
                        toNumber(
                            team.match
                        ),

                    point:
                        toNumber(
                            team.point
                        )

                };

            });

    teams.sort(
        (a, b) =>
            b.point - a.point
    );

    if (teams.length === 0) {

        showTeamEmpty();

        return;
    }

    hideTeamEmpty();

    renderTeamTable(
        teams
    );

    renderTeamPodium(
        teams
    );

}


/* =========================================================
   TEAM TABLE
   ========================================================= */

function renderTeamTable(
    teams
) {

    teamRankingBody.innerHTML = "";

    teams.forEach(
        (team, index) => {

            const rank =
                index + 1;

            const row =
                document.createElement("tr");

            let rankClass = "";

            if (rank === 1) {
                rankClass = "rank-first";
            }

            else if (rank === 2) {
                rankClass = "rank-second";
            }

            else if (rank === 3) {
                rankClass = "rank-third";
            }

            row.innerHTML = `

                <td>
                    <span class="rank-number ${rankClass}">
                        ${rank}
                    </span>
                </td>

                <td>
                    <div class="team-name">
                        ${escapeHTML(
                            team.team
                        )}
                    </div>
                </td>

                <td>
                    ${team.match}
                </td>

                <td>
                    <strong class="stat-value">
                        ${team.point}
                    </strong>
                </td>

            `;

            teamRankingBody.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   TEAM PODIUM
   ========================================================= */

function renderTeamPodium(
    teams
) {

    if (!teamPodium) {
        return;
    }

    teamPodium.innerHTML = "";

    const topThree =
        teams.slice(0, 3);

    const podiumOrder = [];

    if (topThree[1]) {
        podiumOrder.push({
            team: topThree[1],
            position: 2
        });
    }

    if (topThree[0]) {
        podiumOrder.push({
            team: topThree[0],
            position: 1
        });
    }

    if (topThree[2]) {
        podiumOrder.push({
            team: topThree[2],
            position: 3
        });
    }

    podiumOrder.forEach(item => {

        const team =
            item.team;

        const card =
            document.createElement("div");

        card.className =
            `podium-card podium-${item.position}`;

        card.innerHTML = `

            <div class="podium-rank">
                ${item.position}
            </div>

            <div class="podium-team">
                ${escapeHTML(
                    team.team
                )}
            </div>

            <div class="podium-stat">
                ${team.point} PTS
            </div>

        `;

        teamPodium.appendChild(
            card
        );

    });

}


/* =========================================================
   EMPTY STATE
   ========================================================= */

function showPlayerEmpty() {

    if (playerRankingBody) {
        playerRankingBody.innerHTML = "";
    }

    if (playerPodium) {
        playerPodium.innerHTML = "";
    }

    if (playerEmpty) {
        playerEmpty.style.display =
            "block";
    }

}


function hidePlayerEmpty() {

    if (playerEmpty) {
        playerEmpty.style.display =
            "none";
    }

}


function showTeamEmpty() {

    if (teamRankingBody) {
        teamRankingBody.innerHTML = "";
    }

    if (teamPodium) {
        teamPodium.innerHTML = "";
    }

    if (teamEmpty) {
        teamEmpty.style.display =
            "block";
    }

}


function hideTeamEmpty() {

    if (teamEmpty) {
        teamEmpty.style.display =
            "none";
    }

}


/* =========================================================
   LOADING
   ========================================================= */

function showLoading() {

    if (playerRankingBody) {

        playerRankingBody.innerHTML = `
            <tr>
                <td colspan="4" class="loading">
                    Loading ranking...
                </td>
            </tr>
        `;

    }

    if (teamRankingBody) {

        teamRankingBody.innerHTML = `
            <tr>
                <td colspan="4" class="loading">
                    Loading ranking...
                </td>
            </tr>
        `;

    }

}


/* =========================================================
   ERROR
   ========================================================= */

function showError(message) {

    if (playerRankingBody) {

        playerRankingBody.innerHTML = `
            <tr>
                <td colspan="4" class="error">
                    ${escapeHTML(message)}
                </td>
            </tr>
        `;

    }

    if (teamRankingBody) {

        teamRankingBody.innerHTML = `
            <tr>
                <td colspan="4" class="error">
                    ${escapeHTML(message)}
                </td>
            </tr>
        `;

    }

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   TOP PLAYER / TEAM SWITCH
   ========================================================= */

const rankingMainButtons =
    document.querySelectorAll(
        "[data-ranking-type]"
    );

const playerSection =
    document.getElementById(
        "playerRankingSection"
    );

const teamSection =
    document.getElementById(
        "teamRankingSection"
    );

rankingMainButtons.forEach(button => {

    button.addEventListener(
        "click",
        function () {

            rankingMainButtons.forEach(
                btn =>
                    btn.classList.remove(
                        "active"
                    )
            );

            this.classList.add(
                "active"
            );

            const type =
                this.dataset.rankingType;

            if (type === "player") {

                if (playerSection) {
                    playerSection.style.display =
                        "block";
                }

                if (teamSection) {
                    teamSection.style.display =
                        "none";
                }

            }

            else if (type === "team") {

                if (playerSection) {
                    playerSection.style.display =
                        "none";
                }

                if (teamSection) {
                    teamSection.style.display =
                        "block";
                }

            }

        }
    );

});


/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

const menuToggle =
    document.getElementById(
        "menuToggle"
    );

const navMenu =
    document.getElementById(
        "navMenu"
    );


if (menuToggle && navMenu) {

    menuToggle.addEventListener(
        "click",
        () => {

            navMenu.classList.toggle(
                "show"
            );

        }
    );

}


/* =========================================================
   CLOSE MOBILE MENU AFTER CLICK
   ========================================================= */

if (navMenu) {

    const navLinks =
        navMenu.querySelectorAll("a");

    navLinks.forEach(link => {

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


/* =========================================================
   INITIAL LOAD
   ========================================================= */

loadRankingData();


/* =========================================================
   AUTO REFRESH
   60 SECONDS
   ========================================================= */

setInterval(
    () => {

        loadRankingData();

    },
    60000
);
