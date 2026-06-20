describe("Poll creation page /poll/new", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000");
    cy.contains("Créer un sondage").click();
  });

  it("creates a new poll and redirect to the admin page", () => {
    // Step 1
    cy.getByLabel("Nom").type("Mon sondage");
    cy.getByLabel("Description (optionnel)").type(
      "La description de mon sondage",
    );
    cy.contains("Suivant").click();

    // Step 2
    // 4 first days are disabled
    cy.get(".calendar-day-button:disabled").its("length").should("eq", 4);

    cy.contains("button", "13").click();
    cy.contains("button", "7").click();
    cy.contains("button", "Mois suivant").click();
    cy.contains("button", "Mois suivant").click();
    cy.contains("button", "24").click();

    cy.getByLabel("Horaire n°1").type("10:30");
    cy.contains("Ajouter un horaire").click();
    cy.getByLabel("Horaire n°2").type("23:45");

    cy.get(".time-container:nth-child(2)")
      .contains("Horaire n°1")
      .type("14:12");

    cy.get(".time-container:nth-child(3)")
      .contains("Horaire n°1")
      .type("20:22");

    cy.get(".time-container:nth-child(3)")
      .contains("button", "Ajouter un horaire")
      .click();

    cy.get(".time-container:nth-child(3)")
      .contains("Horaire n°2")
      .type("00:30");

    cy.contains("Suivant").click();

    // Step 3
    cy.getByLabel("Masquer la liste des participant·es").check();
    cy.getByLabel("Date de fin").type("2023-11-02");
    cy.getByLabel("Recevoir un email pour chaque participation").check();
    cy.contains("Suivant").click();

    // Step 4
    cy.getByLabel("Nom").type("Michel");
    cy.getByLabel("Adresse email").type("michel@acme.com");
    cy.contains("Valider").click();

    // Redirected to poll admin page
    // Check that route path matches `/poll/admin/<uid>`
    cy.location("pathname").should("match", /^\/poll\/admin\/[A-Za-z0-9_-]+$/);

    // Check dates order
    cy.get(".dates .date-title").then((els) => {
      expect(els).to.have.length(3);
      const expectedDates = [
        "mardi 7 mai 2024",
        "lundi 13 mai 2024",
        "mercredi 24 juillet 2024",
      ];
      expectedDates.forEach((date, i) => {
        cy.wrap(els[i]).should("have.text", date);
      });
    });
  });

  it("shows an error message when trying to submit step 2 with no date", () => {
    // Step 1
    cy.getByLabel("Nom").type("Mon sondage");
    cy.getByLabel("Description (optionnel)").type(
      "La description de mon sondage",
    );
    cy.contains("Suivant").click();

    // Step 2
    // Click "Next" without adding at least one date
    cy.contains("Suivant").click();

    // Step should not change and an error message should be displayed
    cy.contains("Étape 2 sur 4");
    cy.contains("Vous devez ajouter au moins une date à votre sondage.");
  });

  it("saves data between steps", () => {
    // Step 1
    cy.getByLabel("Nom").type("Mon sondage");
    cy.getByLabel("Description (optionnel)").type(
      "La description de mon sondage",
    );
    cy.contains("Suivant").click();

    // Step 2
    cy.contains("button", "7").click();
    cy.getByLabel("Horaire n°1").type("10:30");
    cy.contains("Ajouter un horaire").click();
    cy.getByLabel("Horaire n°2").type("23:45");

    cy.contains("Précédent").click();

    // Check step 1 was saved
    cy.getByLabel("Nom").should("have.value", "Mon sondage");
    cy.getByLabel("Description (optionnel)").should(
      "have.value",
      "La description de mon sondage",
    );
    cy.contains("Suivant").click();

    // Check step 2 was saved
    cy.contains("button", "7")
      .invoke("attr", "aria-pressed")
      .should("eq", "true");
    cy.getByLabel("Horaire n°1").should("have.value", "10:30");
    cy.getByLabel("Horaire n°2").should("have.value", "23:45");

    cy.contains("Suivant").click();

    // Step 3
    cy.getByLabel("Masquer la liste des participant·es").check();
    cy.getByLabel("Date de fin").type("2023-11-02");
    cy.getByLabel("Recevoir un email pour chaque participation").check();
    cy.contains("Suivant").click();

    // Step 4
    cy.getByLabel("Nom").type("Michel");
    cy.getByLabel("Adresse email").type("michel@acme.com");

    // Check step 3 was saved
    cy.contains("Précédent").click();
    cy.getByLabel("Masquer la liste des participant·es").should(
      "have.value",
      "on",
    );
    cy.getByLabel("Date de fin").should("have.value", "2023-11-02");
    cy.getByLabel("Recevoir un email pour chaque participation").should(
      "have.value",
      "on",
    );

    // Check step 4 was saved
    cy.contains("Suivant").click();
    cy.getByLabel("Nom").should("have.value", "Michel");
    cy.getByLabel("Adresse email").should("have.value", "michel@acme.com");
  });
});

describe("Poll admin page", () => {
  beforeEach(() => {
    cy.fixture("../fixtures/createPollFormData").then((fixture) => {
      cy.request({
        method: "POST",
        url: "http://localhost:4000/api/polls",
        body: fixture,
      }).then((data) => {
        cy.fixture("../fixtures/votePollFormData").then((fixtures) => {
          const promises = [];

          fixtures.forEach((fixture) => {
            promises.push(
              cy.request({
                method: "POST",
                url: `http://localhost:4000/api/polls/${data.body.publicUid}/responses`,
                body: {
                  respondentName: fixture.name,
                  responses: data.body.choices.map((c, i) => {
                    return {
                      value: fixture.responses[i].value,
                      choiceId: c.id,
                    };
                  }),
                },
              }),
            );
          });

          cy.visit(`http://localhost:3000/poll/admin/${data.body.adminUid}`);
        });
      });
    });
  });

  it("display poll name", () => {
    cy.contains("Trip to the museum");
  });

  it("copies poll public url", () => {
    cy.contains("Copier").click();
    cy.contains(
      "Le lien de participation a bien été copié dans le presse-papier, à vous de jouer !",
    );
  });

  it("deletes a poll", () => {
    cy.contains("Supprimer le sondage").click();
    cy.get("[role='dialog']").as("modal");
    cy.get("@modal").contains(
      `Vous êtes sur le point de supprimer le sondage "Trip to the museum".`,
    );
    cy.get("@modal").contains("button", "Supprimer").click();
    cy.contains('Le sondage "Trip to the museum" a bien été supprimé');
  });

  it("displays choices with respondents and best choice(s)", () => {
    // 2 dates with 3 choices
    cy.get('h2:contains("Réponses et participations") + ul > li')
      .its("length")
      .should("eq", 2);

    // 5 votes in total
    cy.get('[data-cy^="respondent"]').its("length").should("eq", 5);

    // 2 yes, 3 maybe
    cy.get('[data-cy="respondent-yes"]').its("length").should("eq", 2);
    cy.get('[data-cy="respondent-maybe"]').its("length").should("eq", 3);

    // 1 best choices
    cy.get('mark:contains("Meilleur choix")').its("length").should("eq", 1);
  });
});

describe("Find poll page", () => {
  it("sends an email with polls links", () => {
    cy.visit("http://localhost:3000");
    cy.contains("Rechercher un sondage").click();

    cy.getByLabel("Adresse email").type("johndoe@example.com");

    cy.contains("button", "Rechercher").click();

    cy.contains(
      "Un email a été envoyé à l’adresse johndoe@example.com avec la liste de vos sondages.",
    );
  });
});

describe("Poll edition page", () => {
  beforeEach(() => {
    cy.fixture("../fixtures/createPollFormData").then((fixture) => {
      cy.request({
        method: "POST",
        url: "http://localhost:4000/api/polls",
        body: fixture,
      }).then((data) => {
        cy.visit(`http://localhost:3000/poll/admin/${data.body.adminUid}/edit`);
      });
    });
  });

  it("retrieves poll data in fields", () => {
    cy.getByLabel("Nom").should("have.value", "Trip to the museum");
    cy.getByLabel("Description").should(
      "have.value",
      "We are going to the natural history museum.",
    );

    cy.contains("15 mai 2024");
    cy.get(".time-container:nth-child(1)")
      .getByLabel("Horaire n°1")
      .should("have.value", "10:30");
    cy.get(".time-container:nth-child(1)")
      .getByLabel("Horaire n°2")
      .should("have.value", "14:30");

    cy.contains("29 mai 2024");
    cy.get(".time-container:nth-child(2)")
      .getByLabel("Horaire n°1")
      .should("have.value", "18:50");

    cy.getByLabel("Masquer les votes").should("have.value", "on");
    cy.getByLabel("Date de fin").should("have.value", "2029-05-15");
    cy.getByLabel("Recevoir un email pour chaque participation").should(
      "have.value",
      "on",
    );

    cy.get("fieldset:last-of-type")
      .getByLabel("Adresse email")
      .should("have.value", "bob@domain.com");
  });

  it("disables existing choices (date and time)", () => {
    cy.getByLabel("Horaire n°1").should("have.attr", "readonly");
    cy.getByLabel("Horaire n°2").should("have.attr", "readonly");

    cy.contains("button", "Ajouter un horaire").click();
    cy.getByLabel("Horaire n°3").should("not.have.attr", "readonly");
  });

  it("redirects to index with alert on success", () => {
    cy.getByLabel("Nom").clear().type("Trip to the ocean");
    cy.getByLabel("Description")
      .clear()
      .type("We are going to the see the dolphins");

    cy.contains("Mettre à jour").click();

    cy.location("pathname").should("match", /^\/poll\/admin\/[A-Za-z0-9_-]+$/);
    cy.contains("h1", "Trip to the ocean");
    cy.contains("We are going to the see the dolphins");
    cy.contains('Le sondage "Trip to the ocean" a bien été mis à jour');
  });

  it("deletes endDate", () => {
    cy.getByLabel("Date de fin").clear();

    cy.contains("Mettre à jour").click();

    cy.location("pathname").should("match", /^\/poll\/admin\/[A-Za-z0-9_-]+$/);

    cy.contains("Modifier le sondage").click();

    cy.location("pathname").should(
      "match",
      /^\/poll\/admin\/[A-Za-z0-9_-]+\/edit$/,
    );

    cy.getByLabel("Date de fin").should("have.value", "");
  });

  it("adds and delete new dates and save existing ones", () => {
    // Delete 1 time
    cy.contains("button", "Supprimer").click();

    // Delete 1 date
    cy.contains("button", "29").click();

    // Add one date
    cy.contains("button", "20").click();

    // Add one time
    cy.get(".time-container:nth-child(2)")
      .contains("Ajouter un horaire")
      .click();
    cy.get(".time-container:nth-child(2)")
      .getByLabel("Horaire n°2")
      .type("13:45");

    // Submit and go back to edit page
    cy.contains("Mettre à jour").click();
    cy.location("pathname").should("match", /^\/poll\/admin\/[A-Za-z0-9_-]+$/);

    cy.contains("Modifier le sondage").click();
    cy.location("pathname").should(
      "match",
      /^\/poll\/admin\/[A-Za-z0-9_-]+\/edit$/,
    );

    // Check dates are good
    cy.get(".time-container:nth-child(1)")
      .getByLabel("Horaire n°1")
      .should("have.value", "14:30");
    cy.get(".time-container:nth-child(2)")
      .getByLabel("Horaire n°1")
      .should("have.value", "00:00");
    cy.get(".time-container:nth-child(2)")
      .getByLabel("Horaire n°2")
      .should("have.value", "13:45");

    cy.contains("button", "15")
      .invoke("attr", "aria-pressed")
      .should("eq", "true");
    cy.contains("button", "20")
      .invoke("attr", "aria-pressed")
      .should("eq", "true");
  });
});

describe("Poll vote page", () => {
  beforeEach(() => {
    cy.fixture("../fixtures/createPollFormData").then((fixture) => {
      cy.request({
        method: "POST",
        url: "http://localhost:4000/api/polls",
        body: fixture,
      }).then((data) => {
        cy.wrap(data.body.publicUid).as("publicUid");
        cy.visit(`http://localhost:3000/poll/${data.body.publicUid}`);
      });
    });
  });

  it("submits vote form", () => {
    cy.contains("Trip to the museum");

    cy.getByLabel("Votre nom").type("Jane");

    cy.get(
      '.time-header:contains("10h30") + .radios label:nth-of-type(1) [type="radio"]',
    ).check();
    cy.get(
      '.time-header:contains("14h30") + .radios label:nth-of-type(2) [type="radio"]',
    ).check();
    cy.get(
      '.time-header:contains("18h50") + .radios label:nth-of-type(3) [type="radio"]',
    ).check();

    cy.contains("Voter").click();

    cy.contains("Votre vote a bien été pris en compte !");
    cy.get(".respondent:not(.maybe)").contains("Jane");
    cy.get(".respondent.maybe").contains("Jane");

    cy.get("@publicUid").then((publicUid) => {
      cy.getAllLocalStorage().then((storage) => {
        expect(JSON.stringify(storage)).to.include(publicUid);
      });
    });
  });

  it("displays already voted alert if user already voted", () => {
    cy.get<string>("@publicUid").then((publicUid) => {
      window.localStorage.setItem("planito:votes", JSON.stringify([publicUid]));
    });

    cy.reload();

    cy.contains("Il semble que vous ayez déjà répondu à ce sondage.");
  });
});
