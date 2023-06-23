const textInput = document.getElementById("connection-info");
const referrerName = document.getElementById("referrer-name");

const params = new URLSearchParams(location.search);
var setup_profile = localStorage.getItem('warn_setup_profile');


var user_key;
var referrer_id;


if (params.has('to')) {
    referrer_id = params.get('to');

    user_key = localStorage.getItem('user_key');

    fetch(`/api/user/${referrer_id}`, {method: 'GET'})
    .then(resp => resp.json())
    .then(referrer => {
        referrerName.innerText = referrer.name;
    })

    fetch(`/api/user/${user_key}/connect/${referrer_id}`)
        .then(resp => resp.json())
        .then(data => {
            textInput.value = data.info || "";
        })

    if (!user_key) {
        fetch(`/api/user/${referrer_id}`, {method: 'POST'})
        .then(resp => resp.json())
        .then(user => {
            user_key = user.key;
            localStorage.setItem('user_key', user.key);
            localStorage.setItem('user_id', user.id);
            localStorage.setItem('warn_setup_profile', 'true');
        })
    }
}

function makeConnection() {
    fetch(`/api/user/${user_key}/connect/${referrer_id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'info': textInput.value
        })
    })
    .then(resp => resp.json())
    .then(data => {
        if (setup_profile) {
            location.href = '/profile';
        } else {
            location.href = '/';
        }
    })
}
