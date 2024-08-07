const setupContainer = document.getElementById("setup-container");
const graphContainer = document.getElementById("graph-container");
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
    graphContainer.hidden = true;
}

if (user_id) {    
    loadAll();
    setInterval(() => {
        pollContact();
    }, 1000);
} else {
    qrContainer.hidden = true;
    profileContainer.hidden = true;
    connectionContainer.hidden = true;
    introContainer.hidden = false;
    graphContainer.hidden = true;
}    

async function pollContact() {
    await fetch(`/api/user/${user_id}/signal`, {
        headers: {
            'User-Key': user_key
        }
    })
        .then(resp => resp.json())
        .then(data => {
            if (data.contact) {
                location.href = `/connect?to=${data.contact_id}&name=${btoa(data.name)}`;
            }
        })
}

async function loadAll() {
    await fetch(`/api/user/${user_id}/all`, {
        headers: {
            'User-Key': user_key
        }
    })
        .then(resp => resp.json())
        .then(data => {
            loadQR(user_id, data.user.name);
            profileItems.appendChild(createProfileItem(data.user));
            data.connections.forEach(item => {
                connectionItems.appendChild(createConnectionItem(item))
            });
            loadGraph(data.graph.nodes, data.graph.edges);
        })
}

function loadGraph(nodes, edges) {
    var cy = cytoscape({
        container: document.getElementById("cy"),
        style: [
            {
                selector: "node",
                style: {
                    label: 'data(name)',
                    width: 50,
                    height: 50,
                    'text-margin-y': -10,
                    'text-background-shape': 'round-rectangle',
                    'text-background-padding': 3,
                    'text-background-opacity': 1,
                    'text-background-color': 'white',
                    'text-border-opacity': 1,
                    'text-border-width': 1,
                    'text-border-color': 'black',
                    'border-width': 3
                }
            },
            {
                selector: 'node[role="user"]',
                style: {
                    'background-color': '#FF6347 '
                }
            },
            {
                selector: 'node[role="friend"]',
                style: {
                    'background-color': '#4682B4'
                }
            },
            {
                selector: "edge",
                style: {
                    'width': 3,
                    'line-color': 'black',
                    'target-arrow-color': 'black',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                    'line-style': 'data(linestyle)'
                  }
            }
        ]
    });

    let unnamed_nodes = new Array();

    nodes.forEach(node => {
        let role;
        if (node.id == user_id) {
            role = "user";
        } else if (node.friend) {
            role = "friend";
        } else {
            role = "unknown";
        }

        if (!node.name) {
            unnamed_nodes.push(node.id);
            return;
        };

        cy.add({
            data: {
                id: node.id,
                name: node.name,
                role: role
            }
        })
    });
    edges.forEach(edge => {
        if (unnamed_nodes.includes(edge.from) || unnamed_nodes.includes(edge.to))
            return;
        
        cy.add({
            data: {
                id: `${edge.to}:${edge.from}`,
                source: edge.from,
                target: edge.to,
                linestyle: edge.invited ? "dashed" : "solid"
            }
        })
    });
    cy.on('tap', 'node', event => {
        let node = event.target;
        let profileButton = document.getElementById(`profile-button-${node.id()}`)
        if (profileButton) {
            profileButton.click();
            if (!profileButton.classList.contains("collapsed"))
                profileButton.scrollIntoView(true);
        }
    });
    cy.layout({
        name: "cose"
    }).run();
}

function createListItem(text, type) {
    let listItem = connectionItemTemplate.cloneNode(true);
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
    button.setAttribute("data-bs-target", `#profile-${item.user_id}`);
    button.setAttribute("id", `profile-button-${item.user_id}`)
    button.children[0].textContent = item.name;
    button.children[1]
    connectionItem.children[1].setAttribute("id", `profile-${item.user_id}`);
    let body = connectionItem.children[1].children[0];
    let list = body.children[0];
    let update_button = body.children[1];
    
    if (item.email) {list.appendChild(createListItem(item.email, "email"))}
    if (item.bio) {list.appendChild(createListItem(item.bio, "bio"))}
    if (item.location) {list.appendChild(createListItem(item.location, "location"))}
    if (item.contact_info) {list.appendChild(createListItem(item.contact_info, "contact info"))}
    if (item.note) {list.appendChild(createListItem(item.note, "note"))}

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
    button.setAttribute("data-bs-target", `#profile-${item.user_id}`);
    button.setAttribute("id", `profile-button-${item.user_id}`)
    button.children[0].textContent = item.name;
    button.children[1].hidden = Boolean(item.note);
    connectionItem.children[1].setAttribute("id", `profile-${item.user_id}`);
    let body = connectionItem.children[1].children[0];
    let list = body.children[0];
    let update_button = body.children[1];
    
    if (item.email) {list.appendChild(createListItem(item.email, "email"))}
    if (item.bio) {list.appendChild(createListItem(item.bio, "bio"))}
    if (item.location) {list.appendChild(createListItem(item.location, "location"))}
    if (item.contact_info) {list.appendChild(createListItem(item.contact_info, "contact info"))}
    if (item.note) {list.appendChild(createListItem(item.note, "note"))}

    update_button.onclick = () => {
        location.href = `/connect?to=${item.user_id}&name=${btoa(item.name)}`;
    };

    return connectionItem;
}

async function loadQR(user_id, user_name) {
    var qrdiv = document.createElement("div");
    var invitation_url = `${location.origin}/connect?to=${user_id}&name=${btoa(user_name)}&notify`;
    console.log(invitation_url);
    new QRCode(qrdiv, {
        text: invitation_url,
        width: 1024,
        height: 1024,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    document.getElementById("qrcode").src = qrdiv.querySelector("canvas").toDataURL();
}

async function loadKey() {
    let user_id, user_key, rest
    [user_id, user_key, ...rest] = keyInput.value.split("/")
    localStorage.setItem("user_id", user_id)
    localStorage.setItem("user_key", user_key)
    location.reload();
}

