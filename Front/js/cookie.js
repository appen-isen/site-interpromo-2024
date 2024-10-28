document.cookie = "icons=wifi_tethering,trophy,fitness_center,login; expires=Fri, 10 Nov 2023 12:00:00 UTC; path=/";

document.cookie = "hideImage=true; expires=Fri, 10 Nov 2023 12:00:00 UTC; path=/";

function getCookie(name) {
    let value = "; " + document.cookie;
    let parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
}

let iconData = getCookie("icons");

let iconList = iconData.split(",");

let iconContainer = document.querySelectorAll(".icons-display");

for (let i = 0; i < iconContainer.length; i++) {
    let icon = document.createElement("span");
    icon.className = "material-symbols-outlined";
    icon.innerHTML = iconList[i];
    iconContainer[i].appendChild(icon);
}

//Cache le logo appen

let hideImage = getCookie("hideImage");

if (hideImage === "true") {
    document.querySelector(".logo-appen").style.display = "none";
} else {
    document.querySelector(".logo-appen").style.display = "block";
}
