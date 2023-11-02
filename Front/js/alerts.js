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

function deleteAlert(alertId){
    const alert = bootstrap.Alert.getOrCreateInstance(`body #alertsContainer #${alertId}`)
    alert.close()
}

function newGoalAlert(match, goalTeam){
    let alertsContainer = document.querySelector('body #alertsContainer');
    let alert = `
    <div id="${match.id}${match.point1}_${match.point2}" class="alert alert-success alert-dismissible fade show" role="alert">
        <div class="d-flex align-items-center justify-content-between">
          <h4 class="alert-heading d-inline-flex align-items-center"><span class="material-symbols-outlined">
            scoreboard
          </span>BUT !</h4>
          <h4>${match.point1} - ${match.point2}</h4>
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        <p>${goalTeam == "team1" ? match.expand.team1.name : match.expand.team2.name} vient de marquer un but en ${match.expand.sport.name} face à ${goalTeam == "team1" ? match.expand.team2.name : match.expand.team1.name} !</p>
        <hr>
        <div class="d-flex align-items-center justify-content-between">
          <p class="mb-0 d-inline-flex align-items-center">${getSportIconHTML(match.expand.sport.name)}${match.expand.sport.name}</p>
          <p class="mb-0">${match.expand.team1.name}</p>
          <b><p class="mb-0">${match.point1} - ${match.point2}</p></b>
          <p class="mb-0">${match.expand.team2.name}</p>
        </div>
    </div>
    `
    alertsContainer.insertAdjacentHTML("beforeend", alert)
    setTimeout(deleteAlert, 5000, `${match.id}${match.point1}_${match.point2}`)
}