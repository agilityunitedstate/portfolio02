/* ===============================
   GOOGLE SHEET CONFIG
================================ */


/*
GANTI DENGAN ID GOOGLE SHEET KAMU
*/

const SHEET_ID = "MASUKKAN_SHEET_ID_KAMU";


/*
GANTI JIKA GID SHEET BERBEDA

Biasanya Sheet pertama = 0
*/

const GID = "0";


/*
LINK GOOGLE SHEET CSV
*/

const SHEET_URL =
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${GID}`;




/* ===============================
   AMBIL DATA GOOGLE SHEET
================================ */

async function loadDivisionData() {

    const container =
        document.getElementById(
            "division-container"
        );


    try {

        const response =
            await fetch(SHEET_URL);


        const csv =
            await response.text();


        const data =
            csvToArray(csv);


        const divisions =
            groupByDivision(data);


        displayDivisions(divisions);


    }

    catch (error) {

        console.error(error);


        container.innerHTML = `

            <div class="error">

                Gagal memuat data.

                <br><br>

                Pastikan Google Sheet
                sudah dapat diakses publik.

            </div>

        `;

    }

}




/* ===============================
   CONVERT CSV
================================ */

function csvToArray(csv) {

    const rows =
        csv
        .trim()
        .split("\n");


    const headers =
        rows[0]
        .split(",")
        .map(header =>
            header
            .replace(/"/g, "")
            .trim()
        );


    const result = [];


    for (
        let i = 1;
        i < rows.length;
        i++
    ) {

        const values =
            rows[i]
            .match(
                /(".*?"|[^",\s]+)(?=\s*,|\s*$)/g
            );


        if (!values) continue;


        const object = {};


        headers.forEach(
            (header, index) => {

                object[header] =
                    values[index]
                    ?
                    values[index]
                    .replace(/"/g, "")
                    .trim()
                    :
                    "";

            }
        );


        result.push(object);

    }


    return result;

}




/* ===============================
   GROUP DIVISION
================================ */

function groupByDivision(data) {

    const divisions = {};


    data.forEach(member => {


        /*
        Ambil nama divisi
        */

        const divisionName =
            member.Division;


        /*
        Jika tidak ada division
        */

        if (!divisionName) {

            return;

        }



        /*
        Jika division belum ada
        */

        if (!divisions[divisionName]) {

            divisions[divisionName] = {

                name:
                    divisionName,

                members: [],

                leader:
                    null

            };

        }



        /*
        Masukkan member
        */

        divisions[
            divisionName
        ]
        .members
        .push(member);



        /*
        Cari ketua
        */

        if (

            member.Status
            .toLowerCase()
            === "ketua"

        ) {

            divisions[
                divisionName
            ]
            .leader
            =
            member;

        }


    });


    return divisions;

}




/* ===============================
   DISPLAY DIVISION
================================ */

function displayDivisions(divisions) {


    const container =
        document.getElementById(
            "division-container"
        );


    container.innerHTML = "";


    const divisionArray =
        Object.values(divisions);


    /*
    JUMLAH DIVISI
    */

    document
        .getElementById(
            "division-description"
        )
        .innerHTML =

        `${divisionArray.length}
        divisi kompetitif
        Agility United`;




    /*
    LOOP DIVISION
    */

    divisionArray
    .forEach(
        division => {


            const leader =
                division.leader;


            const leaderName =
                leader
                ?
                leader.Nickname
                :
                "Belum ditentukan";


            const leaderRole =
                leader
                ?
                leader.Role
                :
                "-";


            const memberCount =
                division.members.length;


            /*
            Buat HTML Card
            */

            const card =
                document
                .createElement(
                    "div"
                );


            card.className =
                "division-card";


            card.innerHTML = `


                <!-- LOGO -->

                <div class="division-logo">

                    <div class="division-number">

                        ${division.name}

                    </div>

                </div>



                <!-- INFO -->

                <div class="division-info">


                    <h2>

                        ${division.name}

                    </h2>


                    <h3>

                        Agility United Division

                    </h3>


                    <p>

                        Divisi kompetitif
                        Agility United yang berisi
                        pemain dengan berbagai
                        role dan kemampuan.

                    </p>


                </div>



                <!-- STATS -->

                <div class="division-stats">


                    <!-- KETUA -->

                    <div class="stat-row">


                        <span class="stat-icon">

                            ♛

                        </span>


                        <span class="stat-title">

                            Ketua

                        </span>


                        <span class="stat-value">

                            ${leaderName}

                            <small>

                                (${leaderRole})

                            </small>

                        </span>


                    </div>



                    <!-- JUMLAH MEMBER -->

                    <div class="stat-row">


                        <span class="stat-icon">

                            👥

                        </span>


                        <span class="stat-title">

                            Anggota

                        </span>


                        <span class="stat-value">

                            ${memberCount} Orang

                        </span>


                    </div>



                    <!-- ROLE -->

                    <div class="stat-row">


                        <span class="stat-icon">

                            🎮

                        </span>


                        <span class="stat-title">

                            Role

                        </span>


                        <span class="stat-value">

                            ${getRoles(
                                division.members
                            )}

                        </span>


                    </div>


                </div>



                <!-- BUTTON -->

                <button
                    class="arrow-btn"
                    onclick="
                        showMembers(
                            '${division.name}'
                        )
                    "

                >

                    ❯

                </button>


            `;


            container
                .appendChild(
                    card
                );


        }
    );


}




/* ===============================
   GET ROLE
================================ */

function getRoles(members) {


    const roles =
        [
            ...new Set(
                members.map(
                    member =>
                    member.Role
                )
            )
        ];


    return roles.join(" · ");


}




/* ===============================
   SHOW MEMBERS
================================ */

function showMembers(
    divisionName
) {


    /*
    Sementara alert
    */

    alert(
        "Membuka anggota " +
        divisionName
    );


}




/* ===============================
   START
================================ */

loadDivisionData();
