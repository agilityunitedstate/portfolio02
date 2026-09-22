/* =====================================================
   AGILITY UNITED STATE
   OFFICIAL RULES
   ===================================================== */


/* =====================================================
   ACCORDION
   ===================================================== */

const ruleSections =
  document.querySelectorAll(
    ".rule-section"
  );


ruleSections.forEach(
  section => {

    const header =
      section.querySelector(
        ".section-header"
      );


    if (!header) {
      return;
    }


    header.addEventListener(
      "click",
      () => {

        /*
          Tutup section lain
          */

        ruleSections.forEach(
          otherSection => {

            if (
              otherSection !== section
            ) {

              otherSection.classList.remove(
                "open"
              );

            }

          }
        );


        /*
          Buka / tutup section
          yang diklik
        */

        section.classList.toggle(
          "open"
        );

      }
    );

  }
);


/* =====================================================
   MOBILE NAVBAR
   ===================================================== */

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


/* =====================================================
   CLOSE MENU WHEN LINK CLICKED
   ===================================================== */

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
