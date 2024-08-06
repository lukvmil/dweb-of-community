const textInput = document.getElementById("connection-info");
const referrerName = document.getElementById("referrer-name");

const params = new URLSearchParams(location.search);
var setup_profile = localStorage.getItem('warn_setup_profile');


var user_key;
var referrer_id;
var existing_connection = false;


if (params.has('to')) {
    referrer_id = params.get('to');
    referrer_name = params.get('name')

    user_id = localStorage.getItem('user_id');
    user_key = localStorage.getItem('user_key');

    referrerName.innerText = atob(referrer_name)

    if (user_key) {
        fetch(`/api/user/${user_id}/connect/${referrer_id}`, {
            headers: {
                "User-Key": user_key
            }
        })
            .then(resp => resp.json()
            .then(data => ({resp, data})))
            .then(({resp, data}) => {
                if (resp.ok) {
                    console.log(data);
                    if (data.note) {
                        textInput.value = data.note;
                    }
                    existing_connection = true;
                } else {
                    existing_connection = false;
                }
            })
    } else {
        fetch(`/api/user?invited_by=${referrer_id}`, {method: 'POST'})
            .then(resp => resp.json())
            .then(resp => {
                user_key = resp.user_key;
                user_id = resp.user_id;
                localStorage.setItem('user_key', resp.user_key);
                localStorage.setItem('user_id', resp.user_id);
                localStorage.setItem('warn_setup_profile', 'true');
                existing_connection = false;
        })
    }
}

function makeConnection() {
    fetch(`/api/user/${user_id}/connect/${referrer_id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Key': user_key
        },
        body: JSON.stringify({
            'note': textInput.value
        })
    })
    .then(resp => resp.json())
    .then(data => {
        if (localStorage.getItem('warn_setup_profile')) {
            location.href = '/profile';
        } else {
            location.href = '/';
        }
    })
}
