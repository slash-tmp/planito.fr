export default {
  hello: {
    world: "Bonjour monde !",
  },

  name: "Planito",
  description:
    "Créez un sondage, partagez-le à vos invité·es et trouvez la date optimale. Pas de publicité. Pas de compte. Pas de fioritures.",
  email: "contact{'@'}slash-tmp.dev",

  layout: {
    header: {
      logo: "📆 @:name",
      about: "À propos",
    },
  },

  pages: {
    error: {
      meta: {
        title: "Erreur",
      },
      homeLink: "Retourner à la page d’accueil",
      404: {
        title: "Page introuvable",
        description:
          "La page que vous cherchez n’existe pas ou a été supprimée.",
      },
    },
    about: {
      meta: {
        title: "À propos",
      },
      title: "À propos",
      intro: {
        1: "@:name c’est quoi ? C’est une sorte de « {doodleLike} ».",
        doodleLike: "Doodle éthique, facile et accessible",
        list: {
          ethics: {
            title: "Éthique",
            content:
              "{title} ? Ici vous ne trouverez jamais de pubs. Il y en a déjà bien assez ailleurs sur le web. De plus, les quelques données personnelles collectées sont gardées à double tour et pour toujours.",
          },
          easy: {
            title: "Facile",
            content:
              "{title} ? Il y a beaucoup trop de produits qui divergent de leur objectif initial pour devenir des usines à gaz. @:name est un outil de réservation de créneau et c’est tout. Pas de fioritures, pas de comptes, pas de synchronisation Google Calendar, d’intégration Teams et encore moins d’{ia}.",
            ia: "IA",
            iaDef: "Intelligence Artificielle",
          },
          accessible: {
            title: "Accessible",
            content:
              "{title} ? Ça n’est pas une surprise : le web n’est, en grand partie, pas accessible à toustes. @:name est un service qui suit les critères du {rgaa} et les bonnes pratiques Opquast. Il est utilisable par tout le monde et en toutes conditions (bon il faut juste une connexion internet).",
            rgaa: "RGAA",
            rgaaDef: "Référentiel Général d’Amélioration de l’Accessibilité",
          },
        },
        2: "C’est ensuite un {webProject}. Adrien au back-end (les fondations), Quentin au front-end (la peinture), on apprécie faire les choses bien : un produit performant, testé, simple, accessible et qui apporte de la valeur.",
        webProject:
          "projet de développement web réalisé dans les règles de l’art",
        3: "Si ce sont des choses qui vous parlent, on s’appelle {slashTmp} et on peut peut-être travailler ensemble.",
        slashTmp: "/tmp",
      },
      privacy: {
        title: "Données personnelles",
        1: "Les données personnelles collectées (à savoir votre adresse email quand vous créez un sondage et parfois votre nom) servent uniquement au fonctionnement de l’outil. L’ensemble des données est hébergé par la société {o2switch} domiciliée au Chemin des Pardiaux, 63000 Clermont-Ferrand. Et on ne partage rien à personne",
        o2switch: "o2switch",
        2: "Si vous avez une demande particulière à propos de vos données, vous pouvez nous contacter à l’adresse suivante : {contactEmail}.",
      },
      contact: {
        title: "Contact",
        1: "A priori le code est plutôt bien fichu mais personne n’est infaillible : il se peut que vous trouviez des bugs ou rencontriez des difficultés pour utiliser le site. N’hésitez pas à nous les remonter sur le {gitHub} ou par email à l’adresse suivante : {contactEmail}.",
        gitHub: "dépôt GitHub",
        2: "Comme on veut que cet outil reste très simple et fasse bien une et une seule chose, les suggestions de nouvelles fonctionnalités sont les bienvenues mais toutes ne seront pas forcément prises en compte. Pour voir les ajouts récents, vous pouvez consulter les {changelog}.",
        changelog: "notes de versions",
        3: "Merci à vous d’utiliser @:name ❤️.",
      },
    },
    index: {
      meta: {
        title: "Trouvez facilement une date pour votre prochain événement",
      },
      title: "Trouvez {highlight} une date pour votre prochain événement.",
      easily: "facilement",
      tagLine:
        "Créez un sondage, partagez-le à vos invité·es et trouvez la date optimale.",
      arguments: "Pas de publicité. Pas de compte. Pas de fioritures.",
      deletedPollAlert: {
        description: 'Le sondage "{title}" a bien été supprimé',
        close: "Fermer",
      },
      newPoll: "Créer un sondage",
      findPoll: "Rechercher un sondage",
    },
    poll: {
      find: {
        meta: {
          title: "Rechercher un sondage",
        },
        title: "Rechercher un sondage",
        description:
          "Pour retrouver des sondages existants, entrez l’adresse email que vous avez utilisée pour les créer. Si l’adresse existe, un email avec la liste de vos sondages vous sera envoyé.",
        alert: {
          description:
            "Un email a été envoyé à l’adresse {emailAddress} avec la liste de vos sondages.",
          close: "Fermer",
        },
        form: {
          label: "Adresse email",
          submit: "Rechercher",
        },
        errorAlert:
          "Un problème empêche la recherche de sondages. Contactez-nous à l’adresse @:email si le problème persiste.",
      },
      new: {
        meta: {
          title:
            'Créer un sondage, étape {currentStep} sur {count} "{stepName}"',
        },
        title: "Créer un sondage",
        stepper: "Étape {current} sur {count}",
        navigation: {
          back: "Retour",
          previous: "Précédent",
          next: "Suivant",
          submit: "Valider",
        },
        titleAndDescription: {
          stepTitle: "Nom et description",
          intro:
            "Commencez par présenter votre sondage à vos invité·es. Donnez-lui d’abord un nom sympa puis une brève description si vous le souhaitez.",
          title: {
            label: "Nom du sondage",
          },
          description: {
            label: "Description (optionnel)",
            help: "Vous pouvez par exemple indiquer un lieu, détailler les activités prévues ou ajouter des liens utiles.",
          },
        },
        choices: {
          stepTitle: "Dates et horaires",
          intro:
            "Maintenant, faites votre sélection de dates : chaque date doit avoir au moins un horaire associé et votre sondage doit au moins proposer une date (ça va de soi non ?).",
          noChoiceError:
            "Vous devez ajouter au moins une date à votre sondage.",
          previous: "Mois précédent",
          next: "Mois suivant",
          choice: {
            timeLabel: "Horaire n°{index}",
            deleteChoice: "Supprimer",
            addTime: "Ajouter un horaire",
            forTheDate: "pour le {date}",
          },
        },
        settings: {
          stepTitle: "Paramètres",
          intro:
            "Personnalisez maintenant votre sondage en sélectionnant les options souhaitées. Pas de panique, vous pourrez toujours les modifier une fois le sondage créé.",
          hideVotes: {
            label: "Masquer la liste des participant·es",
            help: "Les noms des participant·es seront cachés aux autres (mais pas à vous, évidemment).",
          },
          endDate: {
            label: "Date de fin (optionnel)",
            help: "Le sondage n’acceptera plus de nouvelles réponses à partir de cette date.",
            delete: "Supprimer",
          },
          notifyOnResponse: {
            label: "Recevoir un email pour chaque participation",
            help: "On vous envoie un email dès qu’une personne répond à votre sondage, pratique.",
          },
        },
        adminInfos: {
          stepTitle: "Administrateur·ice",
          intro:
            "Dernière étape : il est temps d’indiquer aux invité·es qui vous êtes (mais vous pouvez aussi rester anonyme 🥷). Vous serez ensuite redirigé·e vers la page d’administration de votre sondage et vous n’aurez plus qu’à le partager !",
          name: {
            label: "Nom (optionnel)",
            hint: "Le nom est utilisé pour indiquer aux invité·es qui est l’auteur·ice du sondage",
          },
          email: {
            label: "Adresse email",
            hint: "L’adresse email est utilisée pour vous envoyer un email avec les informations de votre sondage (dont le lien d’administration)",
          },
        },
        errorAlert:
          "Un problème empêche la création de votre sondage. Contactez-nous à l’adresse @:email si le problème persiste.",
      },
      admin: {
        id: {
          meta: {
            title: 'Administration du sondage "{pollName}"',
          },
          actions: {
            edit: "Modifier le sondage",
            delete: "Supprimer le sondage",
            deleteModal: {
              title: "Supprimer le sondage",
              description:
                'Vous êtes sur le point de supprimer le sondage "{title}". Vous n’y aurez plus accès et plus personne ne pourra y participer.',
              cancel: "Annuler",
              confirm: "Supprimer",
              errorAlert:
                "Un problème empêche la suppression de votre sondage. Contactez-nous à l’adresse @:email si le problème persiste.",
            },
          },
          intro: {
            createdBy: "Créé par",
            createdAt: "Créé le",
          },
          share: {
            title: "Partagez votre sondage",
            description:
              "Partagez ce lien avec vos invité·es pour leur permettre de participer au sondage.",
            label: "Lien de participation",
            button: "Copier",
            successAlert:
              "Le lien de participation a bien été copié dans le presse-papier, à vous de jouer !",
            errorAlert:
              "Un problème empêche la copie du lien de participation. Contactez-nous à l’adresse @:email si le problème persiste.",
          },
          responses: {
            title: "Réponses et participations",
            at: "à",
            vote: "vote | votes",
            maybe: "(peut-être)",
            bestChoice: "Meilleur choix",
            neverAvailable:
              "A répondu mais n’est disponible à aucune date : | Ont répondu mais ne sont disponibles à aucune date :",
          },
          error: {
            404: {
              title: "Sondage introuvable",
              description:
                "Le sondage que vous cherchez n’existe pas ou a été supprimé.",
            },
          },
        },
        edit: {
          meta: {
            title: 'Édition du sondage "{pollName}"',
          },
          title: "Modifier le sondage",
          back: "Retour au sondage",
          updatedPollAlert: {
            description: 'Le sondage "{title}" a bien été mis à jour',
            close: "Fermer",
          },
          titleAndDescription: {
            stepTitle: "Nom et description",
            title: {
              label: "Nom",
            },
            description: {
              label: "Description (optionnel)",
            },
          },
          choices: {
            stepTitle: "Dates et horaires",
            stepSubtitle:
              "Vous ne pouvez pas modifier les dates et horaires existants mais seulement en ajouter ou en supprimer. Attention : si vous supprimez une date, cela supprimera tous les horaires associés à cette date.",
            choice: {
              dateLabel: "Date n°{index}",
              timeLabel: "Horaire n°{index}",
            },
            addNewChoice: "Ajouter une date",
          },
          settings: {
            stepTitle: "Paramètres",
            hideVotes: {
              label: "Masquer les votes",
              help: "Les noms des participant·es seront cachés aux autres (mais pas à vous, évidemment).",
            },
            endDate: {
              label: "Date de fin",
              help: "Le sondage n’acceptera plus de nouvelles réponses à partir de cette date.",
              delete: "Supprimer",
            },
            notifyOnResponse: {
              label: "Recevoir un email pour chaque participation",
              help: "On vous envoie un email dès qu’une personne répond à votre sondage, pratique.",
            },
          },
          adminInfos: {
            stepTitle: "Administrateur·ice",
            name: {
              label: "Nom",
              hint: "Le nom est utilisé pour indiquer aux participants qui est l’auteur·ice du sondage",
            },
            email: {
              label: "Adresse email",
            },
          },
          submit: "Mettre à jour",
          errorAlert:
            "Un problème empêche la mise à jour de votre sondage. Contactez-nous à l’adresse @:email si le problème persiste.",
        },
      },
      id: {
        meta: {
          title: 'Participer au sondage "{pollName}"',
        },
        invited: "Vous avez été invité·e à participer à ce sondage.",
        invitedBy:
          "Vous avez été invité·e par {adminName} à participer à ce sondage.",
        expireOn: " Vous avez jusqu’au {endDate} pour y participer.",
        isExpired:
          "La date limite de participation de ce sondage est dépassée. Il n’est plus possible d’y répondre.",
        form: {
          choices: {
            yes: "Oui",
            maybe: "Peut-être",
            no: "Non",
          },
          name: "Votre nom",
          at: "à",
          maybe: "(peut-être)",
          withName: {
            yes: "{name} (vous)",
            maybe: "{name} (vous, peut-être)",
          },
          withoutName: {
            yes: "Vous",
            maybe: "Vous (peut-être)",
          },
          submit: "Voter",
        },
        confirmation: "Votre vote a bien été pris en compte !",
        error: {
          404: {
            title: "Sondage introuvable",
            description:
              "Le sondage que vous cherchez n’existe pas ou a été supprimé.",
          },
        },
        errorAlert:
          "Un problème empêche la soumission du sondage. Contactez-nous à l’adresse @:email si le problème persiste.",
        alreadyVotedAlert: {
          intro:
            "Il semble que vous ayez déjà répondu à ce sondage. Pour en être sûr,",
          contactAdmin: "contactez {admin}.",
          checkVotesAndContactAdmin:
            "consultez les votes ou contactez {admin}.",
        },
      },
    },
  },
};
