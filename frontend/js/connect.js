params = new URLSearchParams(location.search);

var user_key;
var referrer_id;

const textInput = document.getElementById("connection-info");

if (params.has('to')) {
    referrer_id = params.get('to');

    user_key = localStorage.getItem('user_key');

    if (!user_key) {
        fetch(`/api/user/${referrer_id}`, {method: 'POST'})
        .then(resp => resp.json())
        .then(user => {
            user_key = user.key;
            localStorage.setItem('user_key', user.key);
            localStorage.setItem('user_id', user.id);
        })
    }
}

function makeConnection() {
    fetch(`/api/user/${user_key}/connect/${referrer_id}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'info': textInput.value
        })
    })
    .then(resp => resp.json())
    .then(data => {
        console.log(data);
        location.href = '/'
    })
}
