/* =====================================================
   AGILITY UNITED - TOP RANKING JS
   ===================================================== */


/* =====================================================
   GOOGLE SHEET
   ===================================================== */

const SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSJnrF27QnQSNsZP6LGyzMD1053hz8Zqscskhd26ENN8blQ_O_sORgoXghFevrOex3XA6A_nr_oXbtR/pub?output=csv";


/* =====================================================
   GLOBAL DATA
   ===================================================== */

let players = [];
let teams = [];

let currentStat = "scorer";


/* =====================================================
   MOBILE NAVBAR
   ===================================================== */

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

if (menuToggle && navMenu) {

    menuToggle.addEventListener("click", () => {

        navMenu.classList.toggle("show");

    });

}


/* =====================================================
   CSV PARSER
   ===================================================== */

function parseCSV(text) {

    const rows = [];
    let row = [];
    let value = "";
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {

        const char = text[i];
        const next = text[i + 1];

        if (char === '"' && insideQuotes && next === '"') {

            value += '"';
            i++;

        } else if (char === '"') {

            insideQuotes = !insideQuotes;

        } else if (char === "," && !insideQuotes) {

            row.push(value.trim());
            value = "";

        } else if (
            (char === "\n" || char === "\r") &&
            !insideQuotes
        ) {

            if (value !== "" || row.length > 0) {

                row.push(value.trim());

                rows.push(row);

                row = [];
                value = "";

            }

        } else {

            value += char;

        }

    }

    if (value !== "" || row.length > 0) {

        row.push(value.trim());
        rows.push(row);

    }

    if (!rows.length) {
        return [];
    }

    const headers = rows[0].map(header =>
        header.toLowerCase().trim()
    );

    return rows.slice(1).map(row => {

        const object = {};

        headers.forEach((header, index) => {

            object[header] = row[index] || "";

        });

        return object;

    });

}


/* =====================================================
   GET VALUE FROM MULTIPLE POSSIBLE COLUMN NAMES
   ===================================================== */

function getValue(row, names) {

    for (const name of names) {

        const key = name.toLowerCase();

        if (
            row[key] !== undefined &&
            row[key] !== ""
        ) {

            return row[key];

        }

    }

    return "";

}


/* =====================================================
   NUMBER
   ===================================================== */

function toNumber(value) {

    if (value === undefined || value === null) {
        return 0;
    }

    const cleaned = String(value)
        .replace(/[^\d.-]/g, "");

    return Number(cleaned) || 0;

}


/* =====================================================
   LOAD DATA
   ===================================================== */

async function loadRankingData() {

    try {

        const response = await fetch(
            SHEET_URL + "&t=" + Date.now()
        );

        if (!response.ok) {

            throw new Error(
                "Failed to load Google Sheet"
            );

        }

        const csv = await response.text();

        const data = parseCSV(csv);

        processData(data);

        renderPlayerRanking();

        renderTeamRanking();

    } catch (error) {

        console.error(error);

        document.getElementById("playerRankingBody").innerHTML = `
            <tr>
                <td colspan="4" class="loading">
                    Failed to load ranking data.
                </td>
            </tr>
        `;

        document.getElementById("teamRankingBody").innerHTML = `
            <tr>
                <td colspan="4" class="loading">
                    Failed to load team data.
                </td>
            </tr>
        `;

    }

}


/* =====================================================
   PROCESS DATA
   ===================================================== */

function processData(data) {

    players = [];
    teams = [];

    data.forEach(row => {

        const nickname = getValue(row, [
            "nickname",
            "player",
            "pemain",
            "nama"
        ]);

        const division = getValue(row, [
            "division",
            "divisi"
        ]);

        const scorer = toNumber(
            getValue(row, [
                "scorer",
                "score",
                "goals",
                "gol"
            ])
        );

        const assist = toNumber(
            getValue(row, [
                "assist",
                "assists"
            ])
        );

        const defend = toNumber(
            getValue(row, [
                "defend",
                "defense",
                "defence",
                "tackle"
            ])
        );

        const save = toNumber(
            getValue(row, [
                "save",
                "saves"
            ])
        );


        /*
         * PLAYER DATA
         */

        if (nickname) {

            players.push({

                nickname,
                division,

                scorer,
                assist,
                defend,
                save

            });

        }


        /*
         * TEAM DATA
         */

        const team = getValue(row, [
            "team",
            "tim"
        ]);

        if (team) {

            teams.push({

                team,

                match: toNumber(
                    getValue(row, [
                        "match",
                        "matches",
                        "main"
                    ])
                ),

                point: toNumber(
                    getValue(row, [
                        "point",
                        "points",
                        "poin"
                    ])
                )

            });

        }

    });


    /*
     * REMOVE DUPLICATE TEAM
     */

    const teamMap = {};

    teams.forEach(team => {

        const name = team.team;

        if (!teamMap[name]) {

            teamMap[name] = {
                team: name,
                match: 0,
                point: 0
            };

        }

        teamMap[name].match += team.match;
        teamMap[name].point += team.point;

    });

    teams = Object.values(teamMap);

}


/* =====================================================
   GET STATISTIC
   ===================================================== */

function getStatValue(player, stat) {

    return player[stat] || 0;

}


/* =====================================================
   RENDER PLAYER RANKING
   ===================================================== */

function renderPlayerRanking() {

    const sortedPlayers = [...players].sort(
        (a, b) =>
            getStatValue(b, currentStat) -
            getStatValue(a, currentStat)
    );


    renderPlayerPodium(sortedPlayers);

    const tbody =
        document.getElementById("playerRankingBody");


    if (!sortedPlayers.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="loading">
                    No player data available.
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML = sortedPlayers.map(
        (player, index) => {

            const rank = index + 1;

            const value =
                getStatValue(
                    player,
                    currentStat
                );

            return `
                <tr>

                    <td>
                        <span class="rank-number">
                            ${rank}
                        </span>
                    </td>

                    <td>
                        <span class="player-name">
                            ${escapeHTML(
                                player.nickname
                            )}
                        </span>
                    </td>

                    <td>
                        <span class="division-name">
                            ${escapeHTML(
                                player.division || "-"
                            )}
                        </span>
                    </td>

                    <td>
                        <span class="stat-value">
                            ${value}
                        </span>
                    </td>

                </tr>
            `;

        }
    ).join("");

}


/* =====================================================
   PLAYER PODIUM
   ===================================================== */

function renderPlayerPodium(playersData) {

    const podium =
        document.getElementById("podium");

    if (!playersData.length) {

        podium.innerHTML = "";

        return;

    }


    const top = playersData.slice(0, 3);

    podium.innerHTML = top.map(
        (player, index) => {

            const value =
                getStatValue(
                    player,
                    currentStat
                );

            const rank = index + 1;

            return `
                <div class="podium-card ${
                    rank === 1 ? "first" : ""
                }">

                    <div class="podium-rank">
                        #${rank}
                    </div>

                    <div class="podium-name">
                        ${escapeHTML(
                            player.nickname
                        )}
                    </div>

                    <div class="podium-division">
                        ${escapeHTML(
                            player.division || "-"
                        )}
                    </div>

                    <div class="podium-value">
                        ${value}
                    </div>

                    <div class="podium-stat-label">
                        ${currentStat.toUpperCase()}
                    </div>

                </div>
            `;

        }
    ).join("");

}


/* =====================================================
   RENDER TEAM RANKING
   ===================================================== */

function renderTeamRanking() {

    const sortedTeams = [...teams].sort(
        (a, b) => b.point - a.point
    );


    renderTeamPodium(sortedTeams);


    const tbody =
        document.getElementById("teamRankingBody");


    if (!sortedTeams.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="loading">
                    No team data available.
                </td>
            </tr>
        `;

        return;

    }


    tbody.innerHTML = sortedTeams.map(
        (team, index) => {

            return `
                <tr>

                    <td>
                        <span class="rank-number">
                            ${index + 1}
                        </span>
                    </td>

                    <td>
                        <span class="team-name">
                            ${escapeHTML(
                                team.team
                            )}
                        </span>
                    </td>

                    <td>
                        ${team.match}
                    </td>

                    <td>
                        <span class="point-value">
                            ${team.point}
                        </span>
                    </td>

                </tr>
            `;

        }
    ).join("");

}


/* =====================================================
   TEAM PODIUM
   ===================================================== */

function renderTeamPodium(teamsData) {

    const podium =
        document.getElementById("teamPodium");

    if (!teamsData.length) {

        podium.innerHTML = "";

        return;

    }


    const top = teamsData.slice(0, 3);

    podium.innerHTML = top.map(
        (team, index) => {

            return `
                <div class="podium-card ${
                    index === 0 ? "first" : ""
                }">

                    <div class="podium-rank">
                        #${index + 1}
                    </div>

                    <div class="podium-name">
                        ${escapeHTML(
                            team.team
                        )}
                    </div>

                    <div class="podium-division">
                        ${team.match} MATCH
                    </div>

                    <div class="podium-value">
                        ${team.point}
                    </div>

                    <div class="podium-stat-label">
                        POINT
                    </div>

                </div>
            `;

        }
    ).join("");

}


/* =====================================================
   PLAYER STAT TABS
   ===================================================== */

const statTabs =
    document.querySelectorAll(".stat-tab");

statTabs.forEach(tab => {

    tab.addEventListener("click", () => {

        statTabs.forEach(item =>
            item.classList.remove("active")
        );

        tab.classList.add("active");

        currentStat =
            tab.dataset.stat;

        const title =
            document.getElementById(
                "rankingTitle"
            );

        const badge =
            document.getElementById(
                "statBadge"
            );

        title.textContent =
            "TOP " +
            currentStat.toUpperCase();

        badge.textContent =
            currentStat.toUpperCase();

        renderPlayerRanking();

    });

});


/* =====================================================
   MAIN TABS
   ===================================================== */

const mainTabs =
    document.querySelectorAll(".main-tab");

const playerRanking =
    document.getElementById(
        "playerRanking"
    );

const teamRanking =
    document.getElementById(
        "teamRanking"
    );


mainTabs.forEach(tab => {

    tab.addEventListener("click", () => {

        mainTabs.forEach(item =>
            item.classList.remove("active")
        );

        tab.classList.add("active");


        if (
            tab.dataset.category ===
            "players"
        ) {

            playerRanking.style.display =
                "block";

            teamRanking.style.display =
                "none";

        } else {

            playerRanking.style.display =
                "none";

            teamRanking.style.display =
                "block";

        }

    });

});


/* =====================================================
   HTML SECURITY
   ===================================================== */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =====================================================
   INITIAL LOAD
   ===================================================== */

loadRankingData();


/* =====================================================
   AUTO REFRESH
   ===================================================== */

/*
 * Update data every 1 minute.
 */

setInterval(() => {

    loadRankingData();

}, 60000);
