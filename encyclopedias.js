import { get, set } from "https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm";

let player = document.getElementById("player");
let canvas = document.getElementById("canvas");

let startCapture = function () {
    if (!("mediaDevices" in navigator)) {
        // fallback to file upload button, ili sl.
        // vidjet i custom API-je: webkitGetUserMedia i mozGetUserMedia
        alert("Media stream not working");
    } else {
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: false })
            .then((stream) => {
                player.srcObject = stream;
            })
            .catch((err) => {
                alert("Media stream not working");
                console.log(err);
            });
    }
};
startCapture();
let stopCapture = function () {
    try {
        player.srcObject.getVideoTracks().forEach(function (track) {
            track.stop();
        });
    }
    catch(err) {
        alert(err.message)
    }
};

document.getElementById("capture").addEventListener("click", function (event) {
    try {
        canvas.width = player.width;
        canvas.height = player.height;
        canvas
            .getContext("2d")
            .drawImage(player, 0, 0, canvas.width, canvas.height);
        stopCapture();
    }
    catch(err) {
        alert(err.message)
    }
});

const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const submit = document.getElementById("submit");
submit.addEventListener('click', function (event) {
    event.preventDefault()
    if (titleInput.value.trim() === '' || descriptionInput.value.trim() === '') {
        alert('Please enter valid data!');
    }

    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready
            .then(function(sw) {
                const post = {
                    id: new Date().toISOString(),
                    title: titleInput.value,
                    description: descriptionInput.value
                };
                writeData('sync-encyclopedias', post)
                    .then(function() {
                        return sw.sync.register('sync-new-encyclopedias');
                    })
                    .catch(function(err) {
                        console.log(err);
                    });
            });
    }
});
