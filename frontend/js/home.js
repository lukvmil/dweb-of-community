const setupContainer = document.getElementById("setup-container");
const qrContainer = document.getElementById("qr-container");
const profileContainer = document.getElementById("profile-container");
const connectionContainer = document.getElementById("connection-container");

var user_id = localStorage.getItem('user_id');
var setup_profile = localStorage.getItem('setup_profile');

setupContainer.hidden = Boolean(setup_profile);
profileContainer.hidden = !Boolean(setup_profile);

if (user_id) {
    loadQR(user_id);
} else {
    // qrContainer.hidden = true;
    // profileContainer.hidden = true;
    // connectionContainer.hidden = true;
}

function loadQR(user_id) {
    fetch(`/api/qr`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({"url": `${location.origin}/connect?to=${user_id}`})
    })
        .then(resp=>resp.json())
        .then(data=>{
            console.log(data.url);
            document.getElementById("qrcode").src = data.url;
        });
}

