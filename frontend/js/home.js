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
const knowledgeItems = document.getElementById("knowledge-items");
const knowledgeItemTemplate = document.getElementById("knowledge-item-template");
const knowledgeGraphSwitch = document.getElementById("knowledge-graph-switch");
const knowledgeObjectCreator = document.getElementById("knowledge-object-creator");

var user_id = localStorage.getItem('user_id');
var user_key = localStorage.getItem('user_key');
var setup_profile = localStorage.getItem('warn_setup_profile');
var cy;
var nodes, edges;

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

    knowledgeGraphSwitch.addEventListener("change", () => {
        loadGraph(nodes, edges, knowledgeGraphSwitch.checked);
    })

} else {
    qrContainer.hidden = true;
    profileContainer.hidden = true;
    connectionContainer.hidden = true;
    introContainer.hidden = false;
    graphContainer.hidden = true;
}

function addKnowledge() {
    let url = knowledgeObjectCreator.value;
    knowledgeObjectCreator.placeholder = "Uploading... (this can take awhile)"
    knowledgeObjectCreator.value = "";
    fetch(`/api/user/${user_id}/knowledge`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            url: url
        })
    })
        .then(resp => resp.json())
        .then(data => {
            loadAll();
            knowledgeObjectCreator.placeholder = "Enter a URL!";
        })
        .catch(err => {
            knowledgeObjectCreator.placeholder = "Upload failed, please try again"
        })
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
            profileItems.innerHTML = '';
            profileItems.appendChild(createProfileItem(data.user));
            
            knowledgeItems.innerHTML = '';
            if (data.knowledge.length == 0) {
                knowledgeItems.innerText = "You haven't added any knowledge objects yet, link a website you want to curate below!"
            } else {
                data.knowledge.forEach(url => {
                    knowledgeItems.appendChild(createKnowledgeItem(url));
                })
            }

            // knowledgeItems.appendChild(createKnowledgeItem());
            connectionItems.innerHTML = '';
            if (data.connections.length == 0) {
                connectionItems.innerText = "You don't have any connections yet"
            } else {
                data.connections.forEach(item => {
                    connectionItems.appendChild(createConnectionItem(item))
                });
            }
            nodes = data.graph.nodes;
            edges = data.graph.edges;
            loadGraph(nodes, edges, knowledgeGraphSwitch.checked);
        })
}

function loadGraph(nodes, edges, show_knowledge) {
    cy = cytoscape({
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
                selector: 'node[role="knowledge"]',
                style: {
                    'background-color': '#FFD700',
                    'border-style': 'dashed',
                    'z-index': -10
                }
            },
            {
                selector: "edge",
                style: {
                    'width': 3,
                    'line-color': 'black',
                    'target-arrow-color': 'black',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier'
                }
            },
            {
                selector: 'edge[role="invited_user"]',
                style: {
                    "line-style": "dashed"
                }
            },
            {
                selector: 'edge[role="user"]',
                style: {

                }
            },
            {
                selector: 'edge[role="knowledge"]',
                style: {
                    // "line-style": "dotted"
                }
            }
        ]
    });

    let unnamed_nodes = new Array();

    nodes.forEach(node => {
        let role;
        if (node.type == "user") {
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
        } else if (node.type == "knowledge") {
            role = "knowledge"
            if (!show_knowledge) return;
        }

        cy.add({
            data: {
                id: node.id,
                name: node.name,
                role: role
            }
        })
    });
    edges.forEach(edge => {
        let role;
        if (edge.type == "user") {
            if (unnamed_nodes.includes(edge.from) || unnamed_nodes.includes(edge.to))
                return;
            if (edge.invited) {
                role = "invited_user"
            } else {
                role = "user";
            }
        } else if (edge.type == "knowledge") {
            role = "knowledge";
            if (!show_knowledge)
                return;
        }

        cy.add({
            data: {
                id: `${edge.to}:${edge.from}`,
                source: edge.from,
                target: edge.to,
                role: role,
                linestyle: edge.invited ? "dashed" : "solid"
            }
        })
    });
    cy.on('tap', 'node', event => {
        let node = event.target;
        if (node.data().role == "knowledge") {
            window.open(node.id());
        } else {
            let profileButton = document.getElementById(`profile-button-${node.id()}`)
            if (profileButton) {
                profileButton.click();
                if (!profileButton.classList.contains("collapsed"))
                    profileButton.scrollIntoView(true);
            }
        }
    });
    cy.layout({
        name: "cose",
        animate: false
    }).run();
}

function createKnowledgeItem(url) {
    let knowledgeItem = knowledgeItemTemplate.cloneNode(true);
    knowledgeItem.hidden = false;
    knowledgeItem.children[0].textContent = url
    knowledgeItem.children[0].href = url
    knowledgeItem.children[1].onclick = () => {
        fetch(`/api/user/${user_id}/knowledge`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                {
                    "url": url
                }
            )
        })
            .then(resp => {
                loadAll();
            })
    }
    return knowledgeItem;
}

function createListItem(text, type) {
    let listItem = connectionItemTemplate.cloneNode(true);
    listItem.hidden = false;
    listItem.children[0].textContent = type;
    // listItem.innerHTML += text;
    listItem.insertAdjacentHTML('afterbegin', text);
    return listItem;
}

// function createKnowledgeItem() {
//     let knowledgeItem = connectionTemplate.cloneNode(true);
//     knowledgeItem.hidden = false;
//     let button = knowledgeItem.children[0].children[0];
//     button.setAttribute("data-bs-target", `#knowledge`);
//     button.setAttribute("id", `knowledge-button`);
//     button.children[0].textContent = "Knowledge Objects";
//     knowledgeItem.children[1].setAttribute("id", `knowledge`);
//     let body = knowledgeItem.children[1].children[0];
//     let list = body.children[0];
//     let update_button = body.children[1];

//     list.appendChild(createListItem("https://en.wikipedia.org/wiki/Decentralized_web", ""));

//     update_button.textContent = 'Add new knowledge object';

//     return knowledgeItem

// }

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

    if (item.email) { list.appendChild(createListItem(item.email, "email")) }
    if (item.bio) { list.appendChild(createListItem(item.bio, "bio")) }
    if (item.location) { list.appendChild(createListItem(item.location, "location")) }
    if (item.contact_info) { list.appendChild(createListItem(item.contact_info, "contact info")) }
    if (item.note) { list.appendChild(createListItem(item.note, "note")) }

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
    button.children[0].textContent = item.name || "New User";
    button.children[1].hidden = Boolean(item.note);
    connectionItem.children[1].setAttribute("id", `profile-${item.user_id}`);
    let body = connectionItem.children[1].children[0];
    let list = body.children[0];
    let update_button = body.children[1];

    if (item.email) { list.appendChild(createListItem(item.email, "email")) }
    if (item.bio) { list.appendChild(createListItem(item.bio, "bio")) }
    if (item.location) { list.appendChild(createListItem(item.location, "location")) }
    if (item.contact_info) { list.appendChild(createListItem(item.contact_info, "contact info")) }
    if (item.note) { list.appendChild(createListItem(item.note, "note")) }

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

