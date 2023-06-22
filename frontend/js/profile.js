var params = new URLSearchParams(location.search);
const nameInput = document.getElementById("name-input");
const emailInput = document.getElementById("email-input");
const phoneInput = document.getElementById("phone-input");
const socialsInput = document.getElementById("socials-input");
const otherInput = document.getElementById("other-input");

var user_key = localStorage.getItem('user_key');
var user_id = localStorage.getItem('user_id');

if (user_id) {
    fetch(`/api/user/${user_id}`)
        .then(resp => resp.json())
        .then(data => {
            nameInput.value = data.name;
            emailInput.value = data.email;
            phoneInput.value = data.phone;
            socialsInput.value = data.socials;
            otherInput.value = data.other;
        })
}

function makeProfile() {
    fetch(`/api/user/${user_key}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'name': nameInput.value,
            'email': emailInput.value,
            'phone': phoneInput.value,
            'socials': socialsInput.value,
            'other': otherInput.value
        })
    })
        .then(resp=>resp.json())
        .then(data=>{
            localStorage.removeItem('warn_setup_profile');
            location.href = '/'
        })
}