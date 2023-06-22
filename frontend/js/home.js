const setupContainer = document.getElementById("setup-container");
const qrContainer = document.getElementById("qr-container");
const profileContainer = document.getElementById("profile-container");
const connectionContainer = document.getElementById("connection-container");
const introContainer = document.getElementById("intro-container");
const keyInput = document.getElementById("key-input");

var user_id = localStorage.getItem('user_id');
var user_key = localStorage.getItem('user_key');
var setup_profile = localStorage.getItem('warn_setup_profile');

if (setup_profile) {
    setupContainer.hidden = false;
    profileContainer.hidden = true;
}

if (user_id) {
    loadQR(user_id);
    loadConnections()
} else {
    qrContainer.hidden = true;
    profileContainer.hidden = true;
    connectionContainer.hidden = true;
    introContainer.hidden = false;
}

function loadKey() {
    let user_key = keyInput.value;
    fetch(`/api/user_id_from_key/${user_key}`)
        .then(resp=>resp.json())
        .then(user=>{
            console.log(user);
            if (user && user.id) {
                localStorage.setItem("user_id", user.id);
                localStorage.setItem("user_key", user_key);
                location.reload();
            }
        })
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
            document.getElementById("qrcode").src = data.url;
        });
}

