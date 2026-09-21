/* =========================================================
   AGILITY UNITED - RANKING SYSTEM
   ========================================================= */

/* =========================================================
   GOOGLE SHEET
   ========================================================= */

const PLAYER_SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQurMK3b5wBqlKc0RVJzESByiHS2zTs9dBRkqS6dKMpcfblYHsmDEXQ_exobsZOTBNRz5E0_o6aDz4d/pub?output=csv";

const TEAM_SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRUKTKqRGZxPjBTavgPS3ycYFsZz9r0QGQ5VuZdEPg-wsWU6zpXIHthLvW7d0kW9uclnGnB1XA2kps_/pub?output=csv";


/* =========================================================
   DATA
   ========================================================= */

let playerData = [];
let teamData = [];

let currentPlayerStat = "scorer";


/* =========================================================
   MEDAL
   ========================================================= */

const medals = {
    1: "🥇",
    2: "🥈",
    3: "🥉"
};


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

        if (
            char === '"' &&
            insideQuotes &&
            nextChar === '"'
        ) {
            value += '"';
            i++;
        }

        else if (char === '"') {
            insideQuotes = !insideQuotes;
        }

        else if (
            char === "," &&
            !insideQuotes
        ) {
            row.push(value.trim());
            value = "";
        }

        else if (
            (char === "\n" || char === "\r") &&
            !insideQuotes
        ) {

            if (
                char === "\r" &&
                nextChar === "\n"
            ) {
                i++;
            }

            row.push(value.trim());

            if (
                row.some(
                    cell => cell !== ""
                )
            ) {
                rows.push(row);
            }

            row = [];
            value = "";
        }

        else {
            value += char;
        }
    }

    if (
        value !== "" ||
        row.length > 0
    ) {

        row.push(value.trim());

        if (
            row.some(
                cell => cell !== ""
            )
        ) {
            rows.push(row);
        }
    }

    return rows;
}


/* =========================================================
   CSV TO OBJECT
   ========================================================= */

function csvToObjects(text) {

    const rows = parseCSV(text);

    if (rows.length < 2) {
        return [];
    }

    const headers =
        rows[0].map(header =>
            header
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "_")
        );

    return rows.slice(1).map(row => {

        const obj = {};

        headers.forEach(
            (header, index) => {

                obj[header] =
                    row[index]
                        ? row[index].trim()
                        : "";

            }
        );

        return obj;

    });
}


/* =========================================================
   NUMBER
   ========================================================= */

function toNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return 0;
    }

    const result =
        Number(
            String(value)
                .replace(/,/g, "")
                .replace(/\./g, "")
        );

    return isNaN(result)
        ? 0
        : result;
}


/* =========================================================
   FETCH CSV
   ========================================================= */

async function fetchCSV(url) {

    if (!url) {
        throw new Error(
            "Google Sheet URL belum dimasukkan."
        );
    }

    const separator =
        url.includes("?")
            ? "&"
            : "?";

    const response =
        await fetch(
            url +
            separator +
            "t=" +
            Date.now()
        );

    if (!response.ok) {

        throw new Error(
            `Gagal mengambil data (${response.status})`
        );

    }

    const text =
        await response.text();

    return csvToObjects(text);
}


/* =========================================================
   LOAD DATA
   ========================================================= */

async function loadRankingData() {

    showLoading();

    try {

        const [players, teams] =
            await Promise.all([
                fetchCSV(
                    PLAYER_SHEET_URL
                ),
                fetchCSV(
                    TEAM_SHEET_URL
                )
            ]);

        playerData = players;
        teamData = teams;

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
   PLAYER RANKING
   ========================================================= */

function renderPlayerRanking(stat) {

    const rankingTitle =
        document.getElementById(
            "rankingTitle"
        );

    const statBadge =
        document.getElementById(
            "statBadge"
        );

    const statNames = {

        scorer:
            "TOP SCORER",

        assist:
            "TOP ASSIST",

        defend:
            "TOP DEFEND",

        save:
            "TOP SAVE"

    };

    const statBadges = {

        scorer:
            "SCORER",

        assist:
            "ASSIST",

        defend:
            "DEFEND",

        save:
            "SAVE"

    };

    if (rankingTitle) {

        rankingTitle.textContent =
            statNames[stat] ||
            "TOP SCORER";

    }

    if (statBadge) {

        statBadge.textContent =
            statBadges[stat] ||
            "SCORER";

    }

    if (!playerRankingBody) {
        return;
    }

    const sortedPlayers =
        [...playerData]
            .filter(
                player =>
                    player.nickname &&
                    player.nickname.trim() !== ""
            )
            .map(player => ({

                nickname:
                    player.nickname,

                division:
                    player.division || "-",

                scorer:
                    toNumber(
                        player.scorer
                    ),

                assist:
                    toNumber(
                        player.assist
                    ),

                defend:
                    toNumber(
                        player.defend
                    ),

                save:
                    toNumber(
                        player.save
                    )

            }));

    sortedPlayers.sort(
        (a, b) =>
            b[stat] - a[stat]
    );

    if (
        sortedPlayers.length === 0
    ) {

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

            let rankClass = "";

            if (rank === 1) {
                rankClass =
                    "rank-first";
            }

            else if (rank === 2) {
                rankClass =
                    "rank-second";
            }

            else if (rank === 3) {
                rankClass =
                    "rank-third";
            }

            const row =
                document.createElement(
                    "tr"
                );

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


    /* =========================================
       URUTAN DATA:
       1 → 2 → 3

       CSS yang mengatur posisi:
       Desktop = 2 | 1 | 3
       Mobile  = 1
                  2 | 3
    ========================================= */

    topThree.forEach(
        (player, index) => {

            const position =
                index + 1;

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                `podium-card podium-${position}`;


            card.innerHTML = `

                <div class="podium-rank">

                    <span class="podium-medal">
                        ${medals[position]}
                    </span>

                    <span class="podium-number">
                        ${position}
                    </span>

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

        }
    );
}


/* =========================================================
   TEAM RANKING
   ========================================================= */

function renderTeamRanking() {

    if (!teamRankingBody) {
        return;
    }

    const teams =
        [...teamData]
            .filter(
                team =>
                    team.team &&
                    team.team.trim() !== ""
            )
            .map(team => ({

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

            }));

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

function renderTeamTable(teams) {

    teamRankingBody.innerHTML = "";

    teams.forEach(
        (team, index) => {

            const rank =
                index + 1;

            let rankClass = "";

            if (rank === 1) {
                rankClass =
                    "rank-first";
            }

            else if (rank === 2) {
                rankClass =
                    "rank-second";
            }

            else if (rank === 3) {
                rankClass =
                    "rank-third";
            }

            const row =
                document.createElement(
                    "tr"
                );

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

function renderTeamPodium(teams) {

    if (!teamPodium) {
        return;
    }

    teamPodium.innerHTML = "";

    const topThree =
        teams.slice(0, 3);


    /* =========================================
       URUTAN DATA:
       1 → 2 → 3
    ========================================= */

    topThree.forEach(
        (team, index) => {

            const position =
                index + 1;

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                `podium-card podium-${position}`;


            card.innerHTML = `

                <div class="podium-rank">

                    <span class="podium-medal">
                        ${medals[position]}
                    </span>

                    <span class="podium-number">
                        ${position}
                    </span>

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

        }
    );
}


/* =========================================================
   EMPTY
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
                <td
                    colspan="4"
                    class="loading"
                >
                    Loading ranking...
                </td>
            </tr>

        `;
    }

    if (teamRankingBody) {

        teamRankingBody.innerHTML = `

            <tr>
                <td
                    colspan="4"
                    class="loading"
                >
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
                <td
                    colspan="4"
                    class="error"
                >
                    ${escapeHTML(message)}
                </td>
            </tr>

        `;
    }

    if (teamRankingBody) {

        teamRankingBody.innerHTML = `

            <tr>
                <td
                    colspan="4"
                    class="error"
                >
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
   MAIN TAB
   ========================================================= */

const rankingMainButtons =
    document.querySelectorAll(
        ".main-tab"
    );

const playerSection =
    document.getElementById(
        "playerRanking"
    );

const teamSection =
    document.getElementById(
        "teamRanking"
    );


rankingMainButtons.forEach(
    button => {

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

                const category =
                    this.dataset.category;

                if (
                    category ===
                    "players"
                ) {

                    if (playerSection) {
                        playerSection.style.display =
                            "block";
                    }

                    if (teamSection) {
                        teamSection.style.display =
                            "none";
                    }

                }

                else if (
                    category ===
                    "teams"
                ) {

                    if (playerSection) {
                        playerSection.style.display =
                            "none";
                    }

                    if (teamSection) {
                        teamSection.style.display =
                            "block";
                    }

                    renderTeamRanking();

                }

            }
        );

    }
);


/* =========================================================
   PLAYER STAT TAB
   ========================================================= */

const playerStatButtons =
    document.querySelectorAll(
        ".stat-tab"
    );


playerStatButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            function () {

                playerStatButtons.forEach(
                    btn =>
                        btn.classList.remove(
                            "active"
                        )
                );

                this.classList.add(
                    "active"
                );

                currentPlayerStat =
                    this.dataset.stat;

                renderPlayerRanking(
                    currentPlayerStat
                );

            }
        );

    }
);


/* =========================================================
   MOBILE NAV
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
        () => {

            navMenu.classList.toggle(
                "show"
            );

        }
    );

}


if (navMenu) {

    const navLinks =
        navMenu.querySelectorAll(
            "a"
        );

    navLinks.forEach(
        link => {

            link.addEventListener(
                "click",
                () => {

                    navMenu.classList.remove(
                        "show"
                    );

                }
            );

        }
    );
}


/* =========================================================
   START
   ========================================================= */

loadRankingData();


/* =========================================================
   AUTO REFRESH
   ========================================================= */

setInterval(
    () => {

        loadRankingData();

    },
    60000
);
