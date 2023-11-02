const alertsList = document.querySelectorAll('.alert')// récupère toue les éléments HTML avec la classe alert 
const alerts = [...alertsList].map(elem => new bootstrap.Alert(elem));//instancie des classes Alert pour chaque élément (nécessaire pour que le bouton fermer fonctionne)


function getSportIconHTML(sportName){
    switch(sportName.toLowerCase()){
        case "football":
            return `<span class="material-symbols-outlined">
                sports_soccer
            </span>`
        case "handball":
            return `<span class="material-symbols-outlined">
                sports_handball
            </span>`
        case "volleyball":
            return `<span class="material-symbols-outlined">
                sports_volleyball
            </span>`
        case "basketball":
            return `<span class="material-symbols-outlined">
                sports_basketball
            </span>`
        case "badminton":
            return ``
    }
}

function newGoalAlert(){
    //CHANGE THIS PART WITH REAL VALUE WHEN LINKING TO DATABASE
    let sportName = "Football"
    let teamA = "FCFOUCHE"
    let teamB = "A3 Grammes"
    let scoreTeamA = 1
    let scoreTeamB = 2
    let goalTeamName = "FCFOUCHE"
    let noGoalTeamName = "A3 Grammes"
    let alertsContainer = document.querySelector('body #alertsContainer');
    let alert = `
    <div class="alert alert-success alert-dismissible fade show" role="alert">
        <div class="d-flex align-items-center justify-content-between">
          <h4 class="alert-heading d-inline-flex align-items-center"><span class="material-symbols-outlined">
            scoreboard
          </span>BUT !</h4>
          <h4>${scoreTeamA} - ${scoreTeamB}</h4>
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        <p>${goalTeamName} vient de marquer un but en ${sportName} face à ${noGoalTeamName} !</p>
        <hr>
        <div class="d-flex align-items-center justify-content-between">
          <p class="mb-0 d-inline-flex align-items-center">${getSportIconHTML(sportName)}${sportName}</p>
          <p class="mb-0">${teamA}</p>
          <b><p class="mb-0">${scoreTeamA} - ${scoreTeamB}</p></b>
          <p class="mb-0">${teamB}</p>
        </div>
    </div>
    `
    alertsContainer.insertAdjacentHTML("beforeend", alert)
}