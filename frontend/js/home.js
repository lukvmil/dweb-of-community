user_id = localStorage.getItem('user_id');

if (user_id) {
    loadQR(user_id);
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
            console.log(data.url);
            document.getElementById("qrcode").src = data.url;
        });
}

