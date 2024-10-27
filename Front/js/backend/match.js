console.log("Backend match start loading...");
import pb from './login.js'

let matchList = await pb.collection('match').getFullList({
    sort: '+heure_debut',
    expand: 'team1,team2,sport',
});

//Check if navigator supports notifications
if (!("Notification" in window)) {
    console.error("Ce navigateur ne supporte pas les notifications desktop");
} else {
    //Ask for notifications permission on page load
    window.addEventListener('load', function () {
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    });
}

const equipeList = await pb.collection('equipes').getFullList({});

const sportList = await pb.collection('sport').getFullList({});

//Gestion des mises à jour en temps réel des matchs
matchList.forEach(match => {
    //Si le match est en cours
    if (match.status === "in_progress" || match.status === "waiting") {
        //Abonnement au match
        pb.collection('match').subscribe(match.id, async function (e) {
            //Si le match a été mis à jour
            if (e.action === "update") {
                //Mise à jour des points
                if (e.record.point1 !== match.point1) {
                    if (!document.getElementById("cardHeader" + match.id).classList.contains("text-warning-emphasis")) {
                        document.getElementById("cardHeader" + match.id).classList.add("text-warning-emphasis");
                    }
                    document.getElementById("pointT1" + match.id).innerHTML = e.record.point1;
                    match.point1 = e.record.point1
                    newGoalAlert(match, "team1")
                }
                if (e.record.point2 !== match.point2) {
                    if (!document.getElementById("cardHeader" + match.id).classList.contains("text-warning-emphasis")) {
                        document.getElementById("cardHeader" + match.id).classList.add("text-warning-emphasis");
                    }
                    document.getElementById("pointT2" + match.id).innerHTML = e.record.point2;
                    match.point2 = e.record.point2
                    newGoalAlert(match, "team2")
                }
                if (e.record.status === "in_progress") {
                    document.getElementById("cardHeader" + match.id).classList.remove("text-primary-emphasis");
                    document.getElementById("cardHeader" + match.id).classList.add("text-warning-emphasis");
                    document.getElementById("cardFooter" + match.id).classList.remove("text-primary-emphasis");
                    document.getElementById("cardFooter" + match.id).classList.add("text-warning-emphasis");
                    document.getElementById("cardFooter" + match.id).innerHTML = "Match en cours";
                    document.getElementById("cardHeader" + match.id).innerHTML = "";
                    const cardHeaderPointDiv = document.createElement('div');
                    cardHeaderPointDiv.className = "d-flex justify-content-evenly";
                    const cardHeaderPointT1 = document.createElement('p');
                    cardHeaderPointT1.id = "pointT1" + match.id;
                    cardHeaderPointT1.innerText = match.point1;
                    const cardHeaderSeparator = document.createElement('p');
                    cardHeaderSeparator.innerText = "-";
                    const cardHeaderPointT2 = document.createElement('p');
                    cardHeaderPointT2.id = "pointT2" + match.id;
                    cardHeaderPointT2.innerText = match.point2;
                    if (match.expand.sport.name === "badminton" || match.expand.sport.name === "volleyball") {
                        cardHeaderPointT1.innerText = match.point1 + ' (' + match.set1 + ')';
                        cardHeaderPointT2.innerText = match.point2 + ' (' + match.set2 + ')';
                    }
                    cardHeaderPointDiv.appendChild(cardHeaderPointT1);
                    cardHeaderPointDiv.appendChild(cardHeaderSeparator);
                    cardHeaderPointDiv.appendChild(cardHeaderPointT2);
                    document.getElementById("cardHeader" + match.id).appendChild(cardHeaderPointDiv);
                    if (e.record.point1 === 0 && e.record.point2 === 0) {
                        startMatchAlert(match);
                    }
                }
                //Mise à jour du statut si le match est terminé
                if (e.record.status === "finished") {
                    document.getElementById("cardHeader" + match.id).classList.remove("text-warning-emphasis");
                    document.getElementById("cardHeader" + match.id).classList.add("text-success-emphasis");
                    document.getElementById("cardFooter" + match.id).classList.remove("text-warning-emphasis");
                    document.getElementById("cardFooter" + match.id).classList.add("text-success-emphasis");
                    document.getElementById("cardFooter" + match.id).innerHTML = "Match terminé";
                    //Déplace le match dans la div des matchs terminés
                    const card = document.getElementById("card" + match.id);
                    card.remove();
                    const container = document.getElementById('cardContainer2');
                    container.appendChild(card);
                    matchEndAlert(match);
                }
                if (e.record.set1 !== match.set1 || e.record.set2 !== match.set2) {
                    newSetAlert(match);
                }
            }
        });
    }
});

//Affichage des matchs sur la page d'arbitrage
if (window.location.href.includes("arbitrage.html")) {
    //Affichage des matchs
    matchList.forEach(record => {
        let container = document.getElementById('cardContainer');
        const card = document.createElement('div');
        card.className = "card my-3";
        //Affichage de l'heure de début du match
        const cardHeader = document.createElement('div');
        cardHeader.className = "card-header text-center bg-light-subtle text-emphasis-light";
        const time_start = new Date(record.heure_debut);
        cardHeader.innerText = time_start.toLocaleString();
        const cardBody = document.createElement('div');
        cardBody.className = "card-body bg-light-subtle text-emphasis-light";
        //Affichage du nom des équipes
        const cardTitle = document.createElement('h5');
        cardTitle.className = "card-title text-center";
        if (record.team1 && record.team2) {
            cardTitle.innerText = record.expand.team1.name + " VS " + record.expand.team2.name;
        }
        //Affichage du sport
        const cardText = document.createElement('p');
        cardText.className = "card-text text-center text-capitalize mb-0";
        cardText.innerText = record.expand.sport.name;
        const cardDescr = document.createElement('p');
        cardDescr.className = "card-text text-center fw-semibold text-body-secondary";
        cardDescr.innerText = record.name;
        //Affichage du bouton d'arbitrage
        const arbitrageButton = document.createElement('div');
        arbitrageButton.className = "text-center";
        const arbitrageButtonLink = document.createElement('a');
        //Gestion des couleurs du bouton en fonction du statut du match
        if (record.status === "waiting") {
            arbitrageButtonLink.className = "btn btn-primary mt-2";
            arbitrageButtonLink.innerHTML = "Démarrer et arbitrer ce match";
        } else if (record.status === "in_progress") {
            arbitrageButtonLink.className = "btn btn-warning mt-2";
            arbitrageButtonLink.innerHTML = "Arbitrer ce match";
        } else if (record.status === "finished") {
            arbitrageButtonLink.className = "btn btn-success mt-2";
            arbitrageButtonLink.innerHTML = "Match terminé";
            container = document.getElementById('cardContainer2');
        } else {
            arbitrageButtonLink.className = "btn btn-secondary mt-2";
            arbitrageButtonLink.innerHTML = "Erreur de statut";
        }
        //Gestion du lien du bouton
        arbitrageButtonLink.addEventListener('click', async function (event) {
            window.location.href = "arbimatch.html?id=" + record.id;
        });
        //Ajout des éléments à la carte
        arbitrageButton.appendChild(arbitrageButtonLink);
        card.appendChild(cardHeader);
        if (record.team1 && record.team2) {
            cardBody.appendChild(cardTitle);
        }
        cardBody.appendChild(cardText);
        if (record.name !== "") {
            cardBody.appendChild(cardDescr);
        }
        cardBody.appendChild(arbitrageButton);
        card.appendChild(cardBody);
        //Ajout de la carte au container
        container.appendChild(card);
    });
}

//Gestion des informations dans la modal
if (window.location.href.includes("arbitrage.html")) {
    //Création de la modal
    const modal = document.getElementById('modalAddMatch');
    const modalDialog = document.createElement('div');
    modalDialog.className = "modal-dialog";
    const modalContent = document.createElement('div');
    modalContent.className = "modal-content";
    const modalHeader = document.createElement('div');
    modalHeader.className = "modal-header";
    const modalTitle = document.createElement('h5');
    modalTitle.className = "modal-title";
    modalTitle.innerHTML = "Ajouter un match";
    const modalButton = document.createElement('button');
    modalButton.type = "button";
    modalButton.className = "btn-close";
    modalButton.setAttribute("data-bs-dismiss", "modal");
    modalButton.setAttribute("aria-label", "Close");
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(modalButton);
    modalContent.appendChild(modalHeader);
    const modalBody = document.createElement('div');
    modalBody.className = "modal-body";
    const modalForm = document.createElement('form');
    modalForm.id = "addMatchForm";
    const modalFormDivEquipe = document.createElement('div');
    modalFormDivEquipe.className = "mb-3";
    const modalFormLabelEquipe = document.createElement('label');
    modalFormLabelEquipe.htmlFor = "equipe1";
    modalFormLabelEquipe.className = "form-label";
    modalFormLabelEquipe.innerHTML = "Equipe 1";
    const modalFormSelectEquipe = document.createElement('select');
    modalFormSelectEquipe.className = "form-control";
    modalFormSelectEquipe.id = "equipe1";
    //Affichage des équipes dans le select
    equipeList.forEach(equipe => {
        const modalFormSelectEquipeOption = document.createElement('option');
        modalFormSelectEquipeOption.innerHTML = equipe.name;
        modalFormSelectEquipe.appendChild(modalFormSelectEquipeOption);
    });
    modalFormDivEquipe.appendChild(modalFormLabelEquipe);
    modalFormDivEquipe.appendChild(modalFormSelectEquipe);
    modalForm.appendChild(modalFormDivEquipe);
    const modalFormDivEquipe2 = document.createElement('div');
    modalFormDivEquipe2.className = "mb-3";
    const modalFormLabelEquipe2 = document.createElement('label');
    modalFormLabelEquipe2.htmlFor = "equipe2";
    modalFormLabelEquipe2.className = "form-label";
    modalFormLabelEquipe2.innerHTML = "Equipe 2";
    const modalFormSelectEquipe2 = document.createElement('select');
    modalFormSelectEquipe2.className = "form-control";
    modalFormSelectEquipe2.id = "equipe2";
    //Affichage des équipes dans le select
    equipeList.forEach(equipe => {
        const modalFormSelectEquipe2Option = document.createElement('option');
        modalFormSelectEquipe2Option.innerHTML = equipe.name;
        modalFormSelectEquipe2.appendChild(modalFormSelectEquipe2Option);
    });
    modalFormDivEquipe2.appendChild(modalFormLabelEquipe2);
    modalFormDivEquipe2.appendChild(modalFormSelectEquipe2);
    modalForm.appendChild(modalFormDivEquipe2);
    const modalFormDivSport = document.createElement('div');
    modalFormDivSport.className = "mb-3";
    const modalFormLabelSport = document.createElement('label');
    modalFormLabelSport.htmlFor = "sport";
    modalFormLabelSport.className = "form-label";
    modalFormLabelSport.innerHTML = "Sport";
    const modalFormSelectSport = document.createElement('select');
    modalFormSelectSport.className = "form-control";
    modalFormSelectSport.id = "sport";
    //Affichage des sports dans le select
    sportList.forEach(sport => {
        const modalFormSelectSportOption = document.createElement('option');
        modalFormSelectSportOption.innerHTML = sport.name;
        modalFormSelectSport.appendChild(modalFormSelectSportOption);
    });
    modalFormDivSport.appendChild(modalFormLabelSport);
    modalFormDivSport.appendChild(modalFormSelectSport);
    modalForm.appendChild(modalFormDivSport);
    const modalFormDivDate = document.createElement('div');
    modalFormDivDate.className = "mb-3";
    const modalFormLabelDate = document.createElement('label');
    modalFormLabelDate.htmlFor = "date";
    modalFormLabelDate.className = "form-label";
    modalFormLabelDate.innerHTML = "Date";
    const modalFormInputDate = document.createElement('input');
    modalFormInputDate.type = "date";
    modalFormInputDate.className = "form-control";
    modalFormInputDate.id = "date";
    modalFormDivDate.appendChild(modalFormLabelDate);
    modalFormDivDate.appendChild(modalFormInputDate);
    modalForm.appendChild(modalFormDivDate);
    const modalFormDivTime = document.createElement('div');
    modalFormDivTime.className = "mb-3";
    const modalFormLabelTime = document.createElement('label');
    modalFormLabelTime.htmlFor = "time";
    modalFormLabelTime.className = "form-label";
    modalFormLabelTime.innerHTML = "Heure";
    const modalFormInputTime = document.createElement('input');
    modalFormInputTime.type = "time";
    modalFormInputTime.className = "form-control";
    modalFormInputTime.id = "time";
    modalFormDivTime.appendChild(modalFormLabelTime);
    modalFormDivTime.appendChild(modalFormInputTime);
    modalForm.appendChild(modalFormDivTime);
    const modalFormButtonSubmit = document.createElement('button');
    modalFormButtonSubmit.type = "submit";
    modalFormButtonSubmit.className = "btn btn-primary";
    modalFormButtonSubmit.innerHTML = "Ajouter ce match";
    //Ajout des éléments à la modal
    modalForm.appendChild(modalFormButtonSubmit);
    modalBody.appendChild(modalForm);
    modalContent.appendChild(modalBody);
    modalDialog.appendChild(modalContent);
    modal.appendChild(modalDialog);
}


//Gestion de l'ajout d'un match
if (window.location.href.includes("arbitrage.html")) {
    const addMatchForm = document.getElementById('addMatchForm');
    addMatchForm.addEventListener('submit', async function (event) {
        //Empêche le rechargement de la page
        event.preventDefault();

        //Récupération des données du formulaire
        let equipe1 = document.getElementById('equipe1').value;
        //Récupération de l'id de l'équipe
        equipe1 = equipeList.find(equipe => equipe.name === equipe1);
        let equipe2 = document.getElementById('equipe2').value;
        equipe2 = equipeList.find(equipe => equipe.name === equipe2);
        let sportID = document.getElementById("sport").value;
        //Récupération de l'id du sport
        sportID = sportList.find(sport => sport.name === sportID);
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        //Création de la date de début du match
        const time_start = new Date(date + " " + time + ":00.000Z");
        //Décalage de l'heure de début de 1h pour la gestion du fuseau horaire
        time_start.setHours(time_start.getHours() - 1);
        let currentMode = "";
        if (sportID.name === "badminton") {
            currentMode = "tournoi";
        } else {
            currentMode = "poules"
        }
        const data = {
            "team1": equipe1.id,
            "team2": equipe2.id,
            "sport": sportID.id,
            "heure_debut": time_start.toISOString(),
            "point1": 0,
            "point2": 0,
            "mode": currentMode,
            "status": "waiting",
        };

        try {
            //Ajout du match
            await pb.collection('match').create(data);
            //Rechargement de la page
            window.location.href = "arbitrage.html";
        } catch (error) {
            //Affichage de l'erreur dans la console
            console.error('Erreur d\'ajout du match :', error);
        }
    });
}

const association = [];

//Gestion de la modal de supression d'un match
if (window.location.href.includes("arbitrage.html")) {
    //Création de la modal
    const delMatchDiv = document.getElementById('matchdelJS');
    const delMatchLabel = document.createElement('label');
    delMatchLabel.htmlFor = "matchdel";
    delMatchLabel.className = "form-label";
    delMatchLabel.innerHTML = "Match à supprimer";
    const delMatchSelect = document.createElement('select');
    delMatchSelect.className = "form-control";
    delMatchSelect.id = "matchdel";
    //Affichage des matchs dans le select
    matchList.forEach(record => {

        const delMatchOption = document.createElement('option');
        let time_start = new Date(record.heure_debut);
        if (record.team1 && record.team2) {
            delMatchOption.innerHTML = record.expand.team1.name + " VS " + record.expand.team2.name + " - " + record.expand.sport.name + " - " + time_start.toLocaleString();
        } else {
            delMatchOption.innerHTML = record.name + ' - ' + record.expand.sport.name + " - " + time_start.toLocaleString();
        }
        //Création de l'association entre le nom du match et son id
        const associationElement = {
            "title": delMatchOption.innerHTML,
            "id": record.id,
        }
        //Ajout de l'association dans le tableau
        association.push(associationElement);
        //Ajout de l'option dans le select
        delMatchSelect.appendChild(delMatchOption);
    });
    //Ajout des éléments à la modal
    delMatchDiv.appendChild(delMatchLabel);
    delMatchDiv.appendChild(delMatchSelect);
}

//Gestion de la supression d'un match
if (window.location.href.includes("arbitrage.html")) {
    //Récupération du formulaire
    const delMatchForm = document.getElementById('delMatchForm');
    delMatchForm.addEventListener('submit', async function (event) {
        //Empêche le rechargement de la page
        event.preventDefault();

        //Récupération du nom du match
        let matchID = document.getElementById('matchdel').value;
        //Récupération de l'id du match dans l'association grace au nom du match
        matchID = association.find(match => match.title === matchID);
        try {
            //Supression du match
            await pb.collection('match').delete(matchID.id);
            //Rechargement de la page
            window.location.href = "arbitrage.html"
        } catch (error) {
            //Affichage de l'erreur dans la console
            console.error('Erreur de suppression du match :', error);
        }
    });
}

//Affichage des matchs sur la page d'accueil
//Elle s'appele indox.html ou bien n'as pas d'autre juste /
if (window.location.href.includes("index.html") || window.location.href === "https://interpromo.appen.fr/") {
    //Affichage des matchs
    matchList.forEach(match => {
        let container = document.getElementById('cardContainer');
        const card = document.createElement('div');
        card.className = "card my-3";
        //Ajout de l'id du match à la carte
        card.setAttribute("id", "card" + match.id);
        const cardHeader = document.createElement('div');
        cardHeader.className = "card-header text-center bg-light-subtle ";
        cardHeader.id = "cardHeader" + match.id;
        if (match.status === "waiting") {
            cardHeader.classList.add("text-primary-emphasis");
        } else if (match.status === "in_progress") {
            cardHeader.classList.add("text-warning-emphasis");
        } else if (match.status === "finished") {
            cardHeader.classList.add("text-success-emphasis");
        } else {
            cardHeader.classList.add("text-emphasis-light");
        }
        //Affichage de l'heure de début si le match n'est pas en cours ou a une erreur de statut
        const time_start = new Date(match.heure_debut);
        cardHeader.innerText = time_start.toLocaleString();
        //Affichage des points si le match est en cours ou terminé
        if (match.status === "in_progress") {
            cardHeader.innerText = "";
            const cardHeaderPointDiv = document.createElement('div');
            cardHeaderPointDiv.className = "d-flex justify-content-evenly";
            const cardHeaderPointT1 = document.createElement('p');
            cardHeaderPointT1.id = "pointT1" + match.id;
            cardHeaderPointT1.innerText = match.point1;
            const cardHeaderSeparator = document.createElement('p');
            cardHeaderSeparator.innerText = "-";
            const cardHeaderPointT2 = document.createElement('p');
            cardHeaderPointT2.id = "pointT2" + match.id;
            cardHeaderPointT2.innerText = match.point2;
            if (match.expand.sport.name === "badminton" || match.expand.sport.name === "volleyball") {
                cardHeaderPointT1.innerText = match.point1 + ' (' + match.set1 + ')';
                cardHeaderPointT2.innerText = match.point2 + ' (' + match.set2 + ')';
            }
            cardHeaderPointDiv.appendChild(cardHeaderPointT1);
            cardHeaderPointDiv.appendChild(cardHeaderSeparator);
            cardHeaderPointDiv.appendChild(cardHeaderPointT2);
            cardHeader.appendChild(cardHeaderPointDiv);
        }
        if (match.status === "finished") {
            container = document.getElementById('cardContainer2');
            cardHeader.innerText = "";
            const cardHeaderPointDiv = document.createElement('div');
            cardHeaderPointDiv.className = "d-flex justify-content-evenly";
            const cardHeaderPointT1 = document.createElement('p');
            cardHeaderPointT1.id = "pointT1" + match.id;
            cardHeaderPointT1.innerText = match.point1;
            const cardHeaderSeparator = document.createElement('p');
            cardHeaderSeparator.innerText = "-";
            const cardHeaderPointT2 = document.createElement('p');
            cardHeaderPointT2.id = "pointT2" + match.id;
            cardHeaderPointT2.innerText = match.point2;
            if (match.expand.sport.name === "badminton" || match.expand.sport.name === "volleyball") {
                cardHeaderPointT1.innerText = match.point1 + ' (' + match.set1 + ')';
                cardHeaderPointT2.innerText = match.point2 + ' (' + match.set2 + ')';
            }
            cardHeaderPointDiv.appendChild(cardHeaderPointT1);
            cardHeaderPointDiv.appendChild(cardHeaderSeparator);
            cardHeaderPointDiv.appendChild(cardHeaderPointT2);
            cardHeader.appendChild(cardHeaderPointDiv);
        }
        const cardBody = document.createElement('div');
        cardBody.className = "card-body bg-light-subtle text-emphasis-light";
        //Affichage du nom des équipes
        const cardTitle = document.createElement('h5');
        cardTitle.className = "card-title text-center";
        if (match.team1 && match.team2) {
            cardTitle.innerText = match.expand.team1.name + " VS " + match.expand.team2.name;
        }
        //Affichage du sport
        const cardText = document.createElement('p');
        cardText.className = "card-text text-center text-capitalize mb-0";
        cardText.innerText = match.expand.sport.name;
        const cardDescr = document.createElement('p');
        cardDescr.className = "card-text text-center fw-semibold text-body-secondary";
        cardDescr.innerText = match.name;
        //Affichage du statut
        const cardFooter = document.createElement('div');
        if (match.status === "waiting") {
            cardFooter.className = "card-footer bg-light-subtle text-primary-emphasis";
            cardFooter.id = "cardFooter" + match.id;
            cardFooter.innerHTML = "Match en attente";
        } else if (match.status === "in_progress") {
            cardFooter.className = "card-footer bg-light-subtle text-warning-emphasis";
            cardFooter.id = "cardFooter" + match.id;
            cardFooter.innerHTML = "Match en cours";
        } else if (match.status === "finished") {
            cardFooter.className = "card-footer bg-light-subtle text-success-emphasis";
            cardFooter.id = "cardFooter" + match.id;
            cardFooter.innerHTML = "Match terminé";
        } else {
            cardFooter.className = "card-footer bg-light-subtle text-emphasis-light";
            cardFooter.id = "cardFooter" + match.id;
            cardFooter.innerHTML = "Erreur de statut";
        }
        //Ajout des éléments à la carte
        card.appendChild(cardHeader);
        if (match.team1 && match.team2) {
            cardBody.appendChild(cardTitle);
        }
        cardBody.appendChild(cardText);
        if (match.name !== "") {
            cardBody.appendChild(cardDescr);
        }
        card.appendChild(cardBody);
        card.appendChild(cardFooter);
        //Ajout de la carte au container
        container.appendChild(card);
    });
}


console.log("Backend match loaded!");