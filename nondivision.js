/* =========================================================
   AGILITY UNITED - MEMBER SYSTEM
   ========================================================= */


/* =========================================================
   GOOGLE SHEET URL
   ========================================================= */

const SHEET_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSJnrF27QnQSNsZP6LGyzMD1053hz8Zqscskhd26ENN8blQ_O_sORgoXghFevrOex3XA6A_nr_oXbtR/pub?gid=713030397&single=true&output=csv";


/* =========================================================
   GLOBAL DATA
   ========================================================= */

let memberData = [];

let currentRole = "ALL";

let currentSearch = "";


/* =========================================================
   ELEMENTS
   ========================================================= */

const memberContainer =
    document.getElementById("memberContainer");

const memberSearch =
    document.getElementById("memberSearch");

const roleFilters =
    document.querySelectorAll(".role-filter");

const memberCount =
    document.getElementById("memberCount");

const emptyState =
    document.getElementById("emptyState");

const loadingState =
    document.getElementById("loadingState");


/* =========================================================
   CSV PARSER
   ========================================================= */

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

        const char = text[i];

        const nextChar =
            text[i + 1];


        /* Handle double quotes inside quoted value */

        if (
            char === '"' &&
            insideQuotes &&
            nextChar === '"'
        ) {

            value += '"';

            i++;

        }


        /* Start / end quoted value */

        else if (char === '"') {

            insideQuotes =
                !insideQuotes;

        }


        /* Column separator */

        else if (
            char === "," &&
            !insideQuotes
        ) {

            row.push(
                value.trim()
            );

            value = "";

        }


        /* New row */

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
                value.trim()
            );


            if (
                row.some(
                    cell =>
                        cell !== ""
                )
            ) {

                rows.push(row);

            }


            row = [];

            value = "";

        }


        /* Normal character */

        else {

            value += char;

        }

    }


    /* Add final row */

    if (
        value !== "" ||
        row.length > 0
    ) {

        row.push(
            value.trim()
        );


        if (
            row.some(
                cell =>
                    cell !== ""
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

    const rows =
        parseCSV(text);


    if (
        rows.length < 2
    ) {

        return [];

    }


    /* Normalize headers */

    const headers =
        rows[0].map(header =>

            header
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "_")

        );


    /* Convert each row into object */

    return rows
        .slice(1)
        .map(row => {

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
   FETCH MEMBER DATA
   ========================================================= */

async function loadMembers() {

    try {

        showLoading();


        /* Check Google Sheet URL */

        if (
            !SHEET_URL ||
            SHEET_URL.includes("PASTE_URL")
        ) {

            throw new Error(
                "URL Google Sheet belum dimasukkan."
            );

        }


        /* Prevent browser cache */

        const separator =
            SHEET_URL.includes("?")
                ? "&"
                : "?";


        const url =
            SHEET_URL +
            separator +
            "t=" +
            Date.now();


        /* Fetch CSV */

        const response =
            await fetch(url);


        if (
            !response.ok
        ) {

            throw new Error(
                `HTTP Error ${response.status}`
            );

        }


        const text =
            await response.text();


        /* Convert CSV */

        memberData =
            csvToObjects(text);


        console.log(
            "Member Data:",
            memberData
        );


        /* Hide loading */

        hideLoading();


        /* Render table */

        renderMembers();

    }


    catch (error) {

        console.error(
            "Member Error:",
            error
        );


        hideLoading();


        if (memberContainer) {

            memberContainer.innerHTML = `

                <tr>

                    <td
                        colspan="4"
                        class="loading"
                    >
                        Unable to load member data.
                    </td>

                </tr>

            `;

        }


        if (memberCount) {

            memberCount.textContent =
                "Unable to load members";

        }

    }

}


/* =========================================================
   SEARCH
   ========================================================= */

if (
    memberSearch
) {

    memberSearch.addEventListener(
        "input",
        function () {

            currentSearch =
                this.value
                    .trim()
                    .toLowerCase();


            renderMembers();

        }
    );

}


/* =========================================================
   ROLE FILTER
   ========================================================= */

roleFilters.forEach(
    button => {

        button.addEventListener(
            "click",
            function () {

                /* Remove active from all buttons */

                roleFilters.forEach(
                    btn => {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                /* Activate selected button */

                this.classList.add(
                    "active"
                );


                /* Get selected role */

                currentRole =
                    this.dataset.role;


                /* Render filtered data */

                renderMembers();

            }
        );

    }
);


/* =========================================================
   FILTER DATA
   ========================================================= */

function getFilteredMembers() {

    return memberData.filter(
        member => {

            /* Nickname */

            const nickname =
                String(
                    member.nickname || ""
                ).toLowerCase();


            /* ID */

            const id =
                String(
                    member.id || ""
                ).toLowerCase();


            /* Role */

            const role =
                String(
                    member.role || ""
                ).toUpperCase();


            /* Search */

            const matchesSearch =

                nickname.includes(
                    currentSearch
                )

                ||

                id.includes(
                    currentSearch
                );


            /* Role filter */

            const matchesRole =

                currentRole === "ALL"

                ||

                role === currentRole;


            return (
                matchesSearch &&
                matchesRole
            );

        }
    );

}


/* =========================================================
   RENDER MEMBERS - TABLE
   ========================================================= */

function renderMembers() {

    if (
        !memberContainer
    ) {

        return;

    }


    /* Get filtered data */

    const filteredMembers =
        getFilteredMembers();


    /* Clear table */

    memberContainer.innerHTML = "";


    /* No result */

    if (
        filteredMembers.length === 0
    ) {

        showEmpty();

        return;

    }


    /* Hide empty state */

    hideEmpty();


    /* Update member count */

    if (
        memberCount
    ) {

        memberCount.textContent =
            `Showing ${filteredMembers.length} member${
                filteredMembers.length !== 1
                    ? "s"
                    : ""
            }`;

    }


    /* Create table rows */

    filteredMembers.forEach(
        (member, index) => {

            const row =
                document.createElement(
                    "tr"
                );


            /* Member data */

            const nickname =
                member.nickname ||
                "-";


            const id =
                member.id ||
                "-";


            const role =
                member.role ||
                "-";


            /* Row content */

            row.innerHTML = `

                <td class="member-number">
                    ${index + 1}
                </td>

                <td class="member-nickname">
                    ${escapeHTML(
                        nickname
                    )}
                </td>

                <td class="member-id">
                    ${escapeHTML(
                        id
                    )}
                </td>

                <td>
                    <span class="member-role">
                        ${escapeHTML(
                            role
                        )}
                    </span>
                </td>

            `;


            /* Add row to table */

            memberContainer.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   EMPTY STATE
   ========================================================= */

function showEmpty() {

    if (
        emptyState
    ) {

        emptyState.style.display =
            "block";

    }


    if (
        memberCount
    ) {

        memberCount.textContent =
            "0 members found";

    }

}


function hideEmpty() {

    if (
        emptyState
    ) {

        emptyState.style.display =
            "none";

    }

}


/* =========================================================
   LOADING
   ========================================================= */

function showLoading() {

    if (
        loadingState
    ) {

        loadingState.style.display =
            "block";

    }


    if (
        memberContainer
    ) {

        memberContainer.style.display =
            "none";

    }

}


function hideLoading() {

    if (
        loadingState
    ) {

        loadingState.style.display =
            "none";

    }


    if (
        memberContainer
    ) {

        memberContainer.style.display =
            "table-row-group";

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


/* =========================================================
   CLOSE MENU AFTER CLICK
   ========================================================= */

if (
    navMenu
) {

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
   INITIAL LOAD
   ========================================================= */

loadMembers();


/* =========================================================
   AUTO REFRESH
   ========================================================= */

setInterval(
    () => {

        loadMembers();

    },
    60000
);
