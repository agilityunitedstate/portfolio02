/* ==============================
   MOBILE MENU
============================== */

const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-link");

menuToggle.addEventListener("click", () => {

    navMenu.classList.toggle("show");

    const icon = menuToggle.querySelector("i");

    if (navMenu.classList.contains("show")) {

        icon.classList.remove("fa-bars");
        icon.classList.add("fa-xmark");

    } else {

        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-bars");

    }

});


/* Close menu when link clicked */

navLinks.forEach(link => {

    link.addEventListener("click", () => {

        navMenu.classList.remove("show");

        const icon = menuToggle.querySelector("i");

        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-bars");

    });

});


/* ==============================
   ACTIVE NAVIGATION
============================== */

const sections = document.querySelectorAll("section[id]");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 150;

        if (window.scrollY >= sectionTop) {
            current = section.getAttribute("id");
        }

    });

    navLinks.forEach(link => {

        link.classList.remove("active");

        if (link.getAttribute("href") === `#${current}`) {
            link.classList.add("active");
        }

    });

});


/* ==============================
   SCROLL REVEAL
============================== */

const revealElements = document.querySelectorAll(
    ".member-card, .division-card, .achievement-card, .about-content, .about-image"
);

const revealObserver = new IntersectionObserver(
    (entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("reveal-show");

                revealObserver.unobserve(entry.target);

            }

        });

    },
    {
        threshold: 0.12
    }
);


revealElements.forEach(element => {

    element.classList.add("reveal");

    revealObserver.observe(element);

});
/* ==============================
   GOOGLE SHEETS - MEMBERS
============================== */

const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRFOjYaAQoUhvfbhqmv_OPlyjJ6hCiO95_po-zIgh6KZPyzilTr567XrcxphEScS4rDQ9oz3GvD2LIe/pub?output=csv";

async function loadMembers() {

    try {

        const response = await fetch(sheetURL);
        const csvText = await response.text();

        const rows = csvText
            .trim()
            .split("\n")
            .map(row => row.split(","));

        const tableBody = document.getElementById("memberTableBody");

        if (!tableBody) return;

        tableBody.innerHTML = "";

        rows.slice(1).forEach((row, index) => {

            if (row.length < 3) return;

            const nickname = row[0].trim();
            const gameID = row[1].trim();
            const role = row[2].trim();

            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${nickname}</td>
                <td>${gameID}</td>
                <td>${role}</td>
            `;

            tableBody.appendChild(tr);

        });

    } catch (error) {

        console.error("Gagal mengambil data Google Sheets:", error);

    }

}

loadMembers();
