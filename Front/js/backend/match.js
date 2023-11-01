console.log("Backend match start loading...");
import PocketBase from '../pocketbase.es.mjs'
import pb from './login.js'

const records = await pb.collection('match').getFullList({
    sort: '+heure_debut',
    expand: 'team1,team2,sport',
});

const equipeList = await pb.collection('equipes').getFullList({});

const sportList = await pb.collection('sport').getFullList({});

//Affichage des matchs sur la page d'accueil
if(window.location.href.includes("index.html")){
    records.forEach(record => {
        const container = document.getElementById('cardContainer');
        const card = document.createElement('div');
        card.className = "card my-3";
        const cardHeader = document.createElement('div');
        cardHeader.className = "card-header text-center bg-light-subtle ";
        if(record.status === "waiting") {
            cardHeader.classList.add("text-primary-emphasis");
        }
        else if(record.status === "in_progress") {
            cardHeader.classList.add("text-warning-emphasis");
        }
        else if(record.status === "finished") {
            cardHeader.classList.add("text-success-emphasis");
        }
        else{
            cardHeader.classList.add("text-emphasis-light");
        }
        const time_start = new Date(record.heure_debut);
        cardHeader.innerText = time_start.toLocaleString();
        const cardBody = document.createElement('div');
        cardBody.className = "card-body bg-light-subtle text-emphasis-light";
        const cardTitle = document.createElement('h5');
        cardTitle.className = "card-title text-center";
        cardTitle.innerText = record.expand.team1.name + " VS " + record.expand.team2.name;
        const cardSubtitle = document.createElement('h6');
        cardSubtitle.className = "card-subtitle text-center";
        cardSubtitle.innerText = record.phase;
        const cardText = document.createElement('p');
        cardText.className = "card-text text-center";
        cardText.innerText = record.expand.sport.name;
        card.appendChild(cardHeader);
        cardBody.appendChild(cardTitle);
        cardBody.appendChild(cardSubtitle);
        cardBody.appendChild(cardText);
        card.appendChild(cardBody);
        container.appendChild(card);
    });
}


//Affichage des matchs sur la page d'arbitrage
if(window.location.href.includes("arbitrage.html")){
    records.forEach(record => {
        const container = document.getElementById('cardContainer');
        const card = document.createElement('div');
        card.className = "card my-3";
        const cardHeader = document.createElement('div');
        cardHeader.className = "card-header text-center bg-light-subtle text-emphasis-light";
        const time_start = new Date(record.heure_debut);
        cardHeader.innerText = time_start.toLocaleString();
        const cardBody = document.createElement('div');
        cardBody.className = "card-body bg-light-subtle text-emphasis-light";
        const cardTitle = document.createElement('h5');
        cardTitle.className = "card-title text-center";
        cardTitle.innerText = record.expand.team1.name + " VS " + record.expand.team2.name;
        const cardSubtitle = document.createElement('h6');
        cardSubtitle.className = "card-subtitle text-center";
        cardSubtitle.innerText = record.phase;
        const cardText = document.createElement('p');
        cardText.className = "card-text text-center";
        cardText.innerText = record.expand.sport.name;
        const arbitrageButton = document.createElement('div');
        arbitrageButton.className = "text-center";
        const arbitrageButtonLink = document.createElement('a');
        if(record.status === "waiting") {
            arbitrageButtonLink.className = "btn btn-primary";
            arbitrageButtonLink.innerHTML = "Démarrer et arbitrer ce match";
        }
        else if(record.status === "in_progress") {
            arbitrageButtonLink.className = "btn btn-warning";
            arbitrageButtonLink.innerHTML = "Arbitrer ce match";
        }
        else if(record.status === "finished") {
            arbitrageButtonLink.className = "btn btn-success";
            arbitrageButtonLink.innerHTML = "Match terminé";
        }
        else{
            arbitrageButtonLink.className = "btn btn-secondary";
            arbitrageButtonLink.innerHTML = "Erreur de statut";
        }
        arbitrageButton.appendChild(arbitrageButtonLink);
        card.appendChild(cardHeader);
        cardBody.appendChild(cardTitle);
        cardBody.appendChild(cardSubtitle);
        cardBody.appendChild(cardText);
        cardBody.appendChild(arbitrageButton);
        card.appendChild(cardBody);
        container.appendChild(card);
    });
}

//Gestion des informations dans la modal
if(window.location.href.includes("arbitrage.html")){
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
    const modalFormDivPhase = document.createElement('div');
    modalFormDivPhase.className = "mb-3";
    const modalFormLabelPhase = document.createElement('label');
    modalFormLabelPhase.htmlFor = "phase";
    modalFormLabelPhase.className = "form-label";
    modalFormLabelPhase.innerHTML = "Phase";
    const modalFormInputPhase = document.createElement('input');
    modalFormInputPhase.type = "text";
    modalFormInputPhase.className = "form-control";
    modalFormInputPhase.id = "phase";
    modalFormDivPhase.appendChild(modalFormLabelPhase);
    modalFormDivPhase.appendChild(modalFormInputPhase);
    modalForm.appendChild(modalFormDivPhase);
    const modalFormButtonSubmit = document.createElement('button');
    modalFormButtonSubmit.type = "submit";
    modalFormButtonSubmit.className = "btn btn-primary";
    modalFormButtonSubmit.innerHTML = "Ajouter ce match";
    modalForm.appendChild(modalFormButtonSubmit);
    modalBody.appendChild(modalForm);
    modalContent.appendChild(modalBody);
    modalDialog.appendChild(modalContent);
    modal.appendChild(modalDialog);
}


//Gestion de l'ajout d'un match
if(window.location.href.includes("arbitrage.html")){
    const addMatchForm = document.getElementById('addMatchForm');
    addMatchForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        let equipe1 = document.getElementById('equipe1').value;
        equipe1 = equipeList.find(equipe => equipe.name === equipe1);
        let equipe2 = document.getElementById('equipe2').value;
        equipe2 = equipeList.find(equipe => equipe.name === equipe2);
        let sportID = document.getElementById("sport").value;
        sportID = sportList.find(sport => sport.name === sportID);
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const phase = document.getElementById('phase').value;
        //Time is one our late
        const time_start = new Date(date + " " + time + ":00.000Z");
        time_start.setHours(time_start.getHours() - 1);
        const data = {
            "team1": equipe1.id,
            "team2": equipe2.id,
            "sport": sportID.id,
            "heure_debut": time_start.toISOString(),
            "point1": 0,
            "point2": 0,
            "status": "waiting",
            "phase": phase,
        };

        try {
            await pb.collection('match').create(data);
            window.location.href = "arbitrage.html";
        } catch (error) {
            console.error('Erreur d\'ajout du match :', error);
        }
    });
}

const association = [];

//Gestion de la modal de supression d'un match
if(window.location.href.includes("arbitrage.html")){
    const delMatchDiv = document.getElementById('matchdelJS');
    const delMatchLabel = document.createElement('label');
    delMatchLabel.htmlFor = "matchdel";
    delMatchLabel.className = "form-label";
    delMatchLabel.innerHTML = "Match à supprimer";
    const delMatchSelect = document.createElement('select');
    delMatchSelect.className = "form-control";
    delMatchSelect.id = "matchdel";
    records.forEach(record => {

        const delMatchOption = document.createElement('option');
        let time_start = new Date(record.heure_debut);
        delMatchOption.innerHTML = record.expand.team1.name + " VS " + record.expand.team2.name + " - " + record.expand.sport.name + " - " + time_start.toLocaleString();
        const associationElement = {
            "title": record.expand.team1.name + " VS " + record.expand.team2.name + " - " + record.expand.sport.name + " - " + time_start.toLocaleString(),
            "id": record.id,
        }
        association.push(associationElement);
        delMatchSelect.appendChild(delMatchOption);
    });
    delMatchDiv.appendChild(delMatchLabel);
    delMatchDiv.appendChild(delMatchSelect);
}

//Gestion de la supression d'un match
if(window.location.href.includes("arbitrage.html")){
    const delMatchForm = document.getElementById('delMatchForm');
    delMatchForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        let matchID = document.getElementById('matchdel').value;
        matchID = association.find(match => match.title === matchID);
        try {
            await pb.collection('match').delete(matchID.id);
            window.location.href = "arbitrage.html"
        } catch (error) {
            console.error('Erreur de suppression du match :', error);
        }
    });
}

console.log(records);

console.log("Backend match loaded!");