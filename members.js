/* =========================================================
   AGILITY UNITED - MEMBER SYSTEM
   ========================================================= */


/* =========================================================
   GOOGLE SHEET URL
   ========================================================= */

const SHEET_URL =
    "PASTE_URL_CSV_MEMBER_DI_SINI";


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


        if (
            char === '"' &&
            insideQuotes &&
            nextChar === '"'
        ) {

            value += '"';

            i++;

        }


        else if (char === '"') {

            insideQuotes =
                !insideQuotes;

        }


        else if (
            char === "," &&
            !insideQuotes
        ) {

            row.push(
                value.trim()
            );

            value = "";

        }


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


        else {

            value += char;

        }

    }


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


        if (
            !SHEET_URL ||
            SHEET_URL.includes("PASTE_URL")
        ) {

            throw new Error(
                "URL Google Sheet belum dimasukkan."
            );

        }


        const separator =
            SHEET_URL.includes("?")
                ? "&"
                : "?";


        const url =
            SHEET_URL +
            separator +
            "t=" +
            Date.now();


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                `HTTP Error ${response.status}`
            );

        }


        const text =
            await response.text();


        memberData =
            csvToObjects(text);


        console.log(
            "Member Data:",
            memberData
        );


        hideLoading();

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

                <div class="empty-state">

                    <div class="empty-icon">
                        !
                    </div>

                    <h3>
                        DATA ERROR
                    </h3>

                    <p>
                        Unable to load member data.
                    </p>

                </div>

            `;

        }

    }

}


/* =========================================================
   SEARCH
   ========================================================= */

if (memberSearch) {

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

roleFilters.forEach(button => {

    button.addEventListener(
        "click",
        function () {

            roleFilters.forEach(
                btn => {

                    btn.classList.remove(
                        "active"
                    );

                }
            );


            this.classList.add(
                "active"
            );


            currentRole =
                this.dataset.role;


            renderMembers();

        }
    );

});


/* =========================================================
   FILTER DATA
   ========================================================= */

function getFilteredMembers() {

    return memberData.filter(
        member => {

            const nickname =
                String(
                    member.nickname || ""
                ).toLowerCase();


            const id =
                String(
                    member.id || ""
                ).toLowerCase();


            const role =
                String(
                    member.role || ""
                ).toUpperCase();


            const matchesSearch =

                nickname.includes(
                    currentSearch
                )

                ||

                id.includes(
                    currentSearch
                );


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
   RENDER MEMBERS
   ========================================================= */

function renderMembers() {

    if (!memberContainer) {
        return;
    }


    const filteredMembers =
        getFilteredMembers();


    memberContainer.innerHTML = "";


    if (
        filteredMembers.length === 0
    ) {

        showEmpty();

        return;

    }


    hideEmpty();


    if (memberCount) {

        memberCount.textContent =
            `Showing ${filteredMembers.length} member${
                filteredMembers.length !== 1
                    ? "s"
                    : ""
            }`;

    }


    filteredMembers.forEach(
        (member, index) => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "member-card";


            const nickname =
                member.nickname ||
                "-";


            const id =
                member.id ||
                "-";


            const role =
                member.role ||
                "-";


            card.innerHTML = `

                <div class="member-number">
                    ${String(
                        index + 1
                    ).padStart(2, "0")}
                </div>

                <div class="member-nickname">
                    ${escapeHTML(
                        nickname
                    )}
                </div>

                <div class="member-id">
                    ID: ${escapeHTML(
                        id
                    )}
                </div>

                <span class="member-role">
                    ${escapeHTML(
                        role
                    )}
                </span>

            `;


            memberContainer.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   EMPTY STATE
   ========================================================= */

function showEmpty() {

    if (emptyState) {

        emptyState.style.display =
            "block";

    }


    if (memberCount) {

        memberCount.textContent =
            "0 members found";

    }

}


function hideEmpty() {

    if (emptyState) {

        emptyState.style.display =
            "none";

    }

}


/* =========================================================
   LOADING
   ========================================================= */

function showLoading() {

    if (loadingState) {

        loadingState.style.display =
            "block";

    }

    if (memberContainer) {

        memberContainer.style.display =
            "none";

    }

}


function hideLoading() {

    if (loadingState) {

        loadingState.style.display =
            "none";

    }

    if (memberContainer) {

        memberContainer.style.display =
            "grid";

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
