var params = new URLSearchParams(location.search);
const nameInput = document.getElementById("name-input");
const emailInput = document.getElementById("email-input");
const bioInput = document.getElementById("bio-input");
const locationInput = document.getElementById("location-input");
const contactInfoInput = document.getElementById("contact-info-input");
const profileForm = document.getElementById("profile-form");

var user_key = localStorage.getItem('user_key');
var user_id = localStorage.getItem('user_id');


if (user_id) {
    fetch(`/api/user/${user_id}`)
        .then(resp => resp.json())
        .then(data => {
            if (data.name) nameInput.value = data.name;
            if (data.email) emailInput.value = data.email;
            if (data.bio) bioInput.value = data.bio;
            if (data.location) locationInput.value = data.location;
            if (data.contact_info) contactInfoInput.value = data.contact_info;
        })
}

function makeProfile() {
    profileForm.classList.remove('was-validated');
    nameInput.classList.remove('is-invalid');
    emailInput.classList.remove('is-invalid');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nameInput.value.trim())
        nameInput.classList.add('is-invalid');

    if (!emailRegex.test(emailInput.value))
        emailInput.classList.add('is-invalid');

    if (!emailInput.classList.contains('is-invalid') && !nameInput.classList.contains('is-invalid')) {
        fetch(`/api/user/${user_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'User-Key': user_key
            },
            body: JSON.stringify({
                'name': nameInput.value,
                'email': emailInput.value,
                'bio': bioInput.value,
                'location': locationInput.value,
                'contact_info': contactInfoInput.value,
            })
        })
            .then(resp=>resp.json())
            .then(data=>{
                localStorage.removeItem('warn_setup_profile');
                location.href = '/'
            })
    }
}