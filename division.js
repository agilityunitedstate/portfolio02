/* =========================================
   GOOGLE SHEET URL
========================================= */


/*

GANTI URL DI BAWAH INI

Contoh:

https://docs.google.com/spreadsheets/d/
SHEET_ID/
gviz/tq?tqx=out:json


*/


const GOOGLE_SHEET_URL =
    "https://docs.google.com/spreadsheets/d/10wGKpvPXnrQyALarmxPxlFubAluEOkciX-FDPrR2R9A/gviz/tq?tqx=out:json";


/* =========================================
   DIVISION LOGO
========================================= */

const divisionLogos = {

    "AGILITY EVOLUTION":
        "assets/division-evolution.png",

    "AGILITY NOVA":
        "assets/division-nova.png",

    "AGILITY DIVISION 03":
        "assets/division-03.png",

    "AGILITY DIVISION 04":
        "assets/division-04.png",

    "AGILITY DIVISION 05":
        "assets/division-05.png",

    "AGILITY DIVISION 06":
        "assets/division-06.png",

    "AGILITY DIVISION 07":
        "assets/division-07.png",

    "AGILITY DIVISION 08":
        "assets/division-08.png"

};


/* =========================================
   GET CONTAINER
========================================= */

const divisionContainer =
    document.getElementById(
        "divisionContainer"
    );


/* =========================================
   FETCH DATA
========================================= */

async function getDivisionData() {

    try {

        if (
            GOOGLE_SHEET_URL.includes(
                "PASTE_GOOGLE"
            )
        ) {

            divisionContainer.innerHTML = `

                <div class="error-box">

                    Google Sheet URL belum dimasukkan
                    di file division.js

                </div>

            `;

            return;

        }


        const response =
            await fetch(
                GOOGLE_SHEET_URL
            );


        const text =
            await response.text();


        /*
        GOOGLE GVIZ FORMAT
        */

        const jsonText =
            text
            .substring(
                47
            )
            .slice(
                0,
                -2
            );


        const data =
            JSON.parse(
                jsonText
            );


        const rows =
            data.table.rows;


        const members =
            rows
            .map(
                row => {

                    return {

                        nickname:
                            row.c[0]
                                ? row.c[0].v
                                : "",

                        id:
                            row.c[1]
                                ? String(
                                    row.c[1].v
                                )
                                : "",

                        division:
                            row.c[2]
                                ? row.c[2].v
                                : "",

                        role:
                            row.c[3]
                                ? row.c[3].v
                                : "",

                        status:
                            row.c[4]
                                ? row.c[4].v
                                : ""

                    };

                }
            )
            .filter(
                member =>
                    member.nickname &&
                    member.division
            );


        createDivisions(
            members
        );


    }
    catch (
        error
    ) {

        console.error(
            error
        );


        divisionContainer.innerHTML = `

            <div class="error-box">

                Gagal mengambil data dari Google Sheet.

                <br><br>

                Pastikan Google Sheet sudah
                <b>Public / Anyone with the link</b>.

            </div>

        `;

    }

}


/* =========================================
   CREATE DIVISIONS
========================================= */

function createDivisions(
    members
) {


    /*
    GROUP MEMBER
    BY DIVISION
    */

    const divisions =
        {};


    members.forEach(
        member => {


            const divisionName =
                member.division
                    .trim()
                    .toUpperCase();


            if (
                !divisions[
                    divisionName
                ]
            ) {

                divisions[
                    divisionName
                ] = [];

            }


            divisions[
                divisionName
            ]
            .push(
                member
            );


        }
    );


    /*
    REMOVE LOADING
    */

    divisionContainer.innerHTML =
        "";


    /*
    GET DIVISION NAMES
    */

    const divisionNames =
        Object.keys(
            divisions
        );


    /*
    CREATE EACH DIVISION
    */

    divisionNames.forEach(
        (
            divisionName,
            index
        ) => {


            const divisionMembers =
                divisions[
                    divisionName
                ];


            createDivisionCard(

                divisionName,

                divisionMembers,

                index

            );


        }
    );


}


/* =========================================
   CREATE DIVISION CARD
========================================= */

function createDivisionCard(

    divisionName,

    members,

    index

) {


    /*
    FIND LEADER
    */

    const leader =
        members.find(

            member =>

                member.status
                .toLowerCase()
                ===
                "leader"

        );


    /*
    DIVISION NUMBER
    */

    const divisionNumber =
        String(
            index + 1
        )
        .padStart(
            2,
            "0"
        );


    /*
    LOGO
    */

    const logo =
        divisionLogos[
            divisionName
        ];


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


        <!-- ================= HEADER ================= -->

        <div
            class="division-header"
        >


            <!-- LOGO -->

            <div
                class="division-logo"
            >

                ${

                    logo

                    ?

                    `

                    <img
                        src="${logo}"
                        alt="${divisionName}"
                    >

                    `

                    :

                    `

                    <div
                        class="division-logo-placeholder"
                    >

                        AG

                    </div>

                    `

                }

            </div>



            <!-- INFO -->

            <div
                class="division-info"
            >

                <span
                    class="division-number"
                >

                    DIVISION
                    ${divisionNumber}

                </span>


                <h2
                    class="division-name"
                >

                    ${divisionName}

                </h2>


                <div
                    class="member-count"
                >

                    ${members.length}
                    MEMBERS

                </div>

            </div>



            <!-- MEMBER COUNT -->

            <div
                class="member-badge"
            >

                <span
                    class="member-badge-icon"
                >

                    👥

                </span>

                ${members.length}
                MEMBERS

            </div>



            <!-- OPEN BUTTON -->

            <div
                class="open-button"
            >

                ⌃

            </div>


        </div>



        <!-- ================= CONTENT ================= -->

        <div
            class="division-content"
        >


            <!-- ================= LEADER ================= -->

            <div
                class="division-section"
            >


                <div
                    class="section-title"
                >

                    <span>
                        ♛
                    </span>

                    KETUA DIVISI

                </div>


                ${

                    leader

                    ?

                    `

                    <div
                        class="leader-card"
                    >


                        <div
                            class="leader-avatar"
                        >

                            👤

                        </div>


                        <div
                            class="leader-info"
                        >

                            <span
                                class="leader-label"
                            >

                                DIVISION LEADER

                            </span>


                            <h3
                                class="leader-name"
                            >

                                ${leader.nickname}

                            </h3>


                            <div
                                class="leader-id"
                            >

                                ID:
                                ${leader.id}

                            </div>


                        </div>


                        <div
                            class="role-badge"
                        >

                            ${leader.role}

                        </div>


                    </div>

                    `

                    :

                    `

                    <div
                        class="no-leader"
                    >

                        Leader belum ditentukan

                    </div>

                    `

                }


            </div>



            <!-- ================= MEMBERS ================= -->

            <div
                class="division-section"
            >


                <div
                    class="section-title"
                >

                    <span>
                        👥
                    </span>

                    TEAM MEMBERS

                </div>


                <div
                    class="table-wrapper"
                >


                    <table
                        class="member-table"
                    >


                        <thead>

                            <tr>

                                <th>
                                    #
                                </th>

                                <th>
                                    NICKNAME
                                </th>

                                <th>
                                    GAME ID
                                </th>

                                <th>
                                    ROLE
                                </th>

                                <th>
                                    STATUS
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            ${

                                members
                                .map(

                                    (
                                        member,
                                        memberIndex
                                    ) => {

                                        return `


                                        <tr>


                                            <td>

                                                <span
                                                    class="member-number"
                                                >

                                                    ${String(
                                                        memberIndex + 1
                                                    )
                                                    .padStart(
                                                        2,
                                                        "0"
                                                    )}

                                                </span>

                                            </td>



                                            <td>

                                                <div
                                                    class="player-cell"
                                                >

                                                    <div
                                                        class="player-avatar"
                                                    >

                                                        👤

                                                    </div>


                                                    <span
                                                        class="player-name"
                                                    >

                                                        ${member.nickname}

                                                    </span>

                                                </div>

                                            </td>



                                            <td>

                                                <span
                                                    class="player-id"
                                                >

                                                    ${member.id}

                                                </span>

                                            </td>



                                            <td>

                                                <span
                                                    class="role-badge"
                                                >

                                                    ${member.role}

                                                </span>

                                            </td>



                                            <td>

                                                ${

                                                    member.status
                                                    .toLowerCase()
                                                    ===
                                                    "leader"

                                                    ?

                                                    `

                                                    <span
                                                        class="status-leader"
                                                    >

                                                        ♛ KETUA

                                                    </span>

                                                    `

                                                    :

                                                    `

                                                    <span
                                                        class="status-member"
                                                    >

                                                        MEMBER

                                                    </span>

                                                    `

                                                }

                                            </td>


                                        </tr>


                                        `;

                                    }

                                )
                                .join(
                                    ""
                                )

                            }


                        </tbody>


                    </table>


                </div>


            </div>


        </div>


    `;


    /*
    CLICK EVENT
    */

    const header =
        card.querySelector(
            ".division-header"
        );


    header.addEventListener(
        "click",
        () => {


            /*
            CLOSE OTHER DIVISIONS
            */

            document
            .querySelectorAll(
                ".division-card"
            )
            .forEach(
                otherCard => {

                    if (
                        otherCard !== card
                    ) {

                        otherCard
                        .classList
                        .remove(
                            "open"
                        );

                    }

                }
            );


            /*
            TOGGLE CURRENT
            */

            card
            .classList
            .toggle(
                "open"
            );


        }
    );


    /*
    ADD TO CONTAINER
    */

    divisionContainer
    .appendChild(
        card
    );


}


/* =========================================
   START
========================================= */

getDivisionData();
