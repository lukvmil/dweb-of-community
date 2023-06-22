const setupContainer = document.getElementById("setup-container");
const qrContainer = document.getElementById("qr-container");
const profileContainer = document.getElementById("profile-container");
const connectionContainer = document.getElementById("connection-container");
const introContainer = document.getElementById("intro-container");
const keyInput = document.getElementById("key-input");
const connectionTemplate = document.getElementById("connection-template");
const connectionItemTemplate = document.getElementById("connection-item-template");
const connectionItems = document.getElementById("connection-items");
const profileItems = document.getElementById("profile-items");

var user_id = localStorage.getItem('user_id');
var user_key = localStorage.getItem('user_key');
var setup_profile = localStorage.getItem('warn_setup_profile');

if (setup_profile) {
    setupContainer.hidden = false;
    profileContainer.hidden = true;
}

if (user_id) {
    loadQR(user_id);
    loadConnections(user_key);
    loadUser(user_id);
} else {
    qrContainer.hidden = true;
    profileContainer.hidden = true;
    connectionContainer.hidden = true;
    introContainer.hidden = false;
}

function loadUser(user_id) {
    fetch(`/api/user/${user_id}`)
        .then(resp => resp.json())
        .then(item => {
            profileItems.appendChild(createProfileItem(item));
        })
}

function loadConnections(user_key) {
    fetch(`/api/user/${user_key}/connect`)
        .then(resp=>resp.json())
        .then(connections=>{
            connections.sort((a,b) => {
                return new Date(b.timestamp) - new Date(a.timestamp);
            });
            connections.forEach(item => {
                console.log(item.timestamp);
                console.log(item.info);
                connectionItems.appendChild(createConnectionItem(item));
            })
        })
}

function createListItem(text, type) {
    let listItem = connectionItemTemplate.cloneNode(true);
    console.log(text, type);
    listItem.hidden = false;
    listItem.children[0].textContent = type;
    // listItem.innerHTML += text;
    listItem.insertAdjacentHTML('afterbegin', text);
    return listItem;
}

function createProfileItem(item) {
    let connectionItem = connectionTemplate.cloneNode(true);
    connectionItem.hidden = false;
    let button = connectionItem.children[0].children[0];
    button.setAttribute("data-bs-target", `#connection-${item.id}`);
    button.children[0].textContent = item.name;
    button.children[1]
    connectionItem.children[1].setAttribute("id", `connection-${item.id}`);
    let body = connectionItem.children[1].children[0];
    let list = body.children[0];
    let update_button = body.children[1];
    
    if (item.email) {list.appendChild(createListItem(item.email, "email"))}
    if (item.location) {list.appendChild(createListItem(item.location, "location"))}
    if (item.phone) {list.appendChild(createListItem(item.phone, "phone"))}
    if (item.socials) {list.appendChild(createListItem(item.socials, "social"))}
    if (item.other) {list.appendChild(createListItem(item.other, "other"))}
    if (item.info) {list.appendChild(createListItem(item.info, "note"))}

    update_button.textContent = 'Update profile';
    update_button.onclick = () => {
        location.href = `/profile`;
    };

    return connectionItem;
}

function createConnectionItem(item) {
    let connectionItem = connectionTemplate.cloneNode(true);
    connectionItem.hidden = false;
    let button = connectionItem.children[0].children[0];
    button.setAttribute("data-bs-target", `#connection-${item.id}`);
    button.children[0].textContent = item.name;
    button.children[1].hidden = Boolean(item.info);
    connectionItem.children[1].setAttribute("id", `connection-${item.id}`);
    let body = connectionItem.children[1].children[0];
    let list = body.children[0];
    let update_button = body.children[1];
    
    if (item.email) {list.appendChild(createListItem(item.email, "email"))}
    if (item.location) {list.appendChild(createListItem(item.location, "location"))}
    if (item.phone) {list.appendChild(createListItem(item.phone, "phone"))}
    if (item.socials) {list.appendChild(createListItem(item.socials, "social"))}
    if (item.other) {list.appendChild(createListItem(item.other, "other"))}
    if (item.info) {list.appendChild(createListItem(item.info, "note"))}

    update_button.onclick = () => {
        location.href = `/connect?to=${item.id}`;
    };

    return connectionItem;
}

function loadKey() {
    let user_key = keyInput.value;
    fetch(`/api/user_id_from_key/${user_key}`)
        .then(resp=>resp.json())
        .then(user=>{
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

