var params = new URLSearchParams(location.search);


function makeProfile() {
    fetch(`/api/user/${user_key}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({

        })
    })
}