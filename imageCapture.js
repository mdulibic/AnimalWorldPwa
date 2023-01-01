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

document
    .getElementById("submit")
    .addEventListener("click", function (event) {
        event.preventDefault();
        if ("serviceWorker" in navigator && "SyncManager" in window) {
            let url = canvas.toDataURL();
            fetch(url)
                .then((res) => res.blob())
                .then((blob) => {
                    let ts = new Date().toISOString();
                    return navigator.serviceWorker.ready;
                })
                .then((swRegistration) => {
                    return swRegistration.sync.register("sync-snaps");
                })
                .then(() => {
                    console.log("Queued for sync");
                    startCapture();
                })
                .catch((error) => {
                    alert(error);
                    console.log(error);
                });
        } else {
            alert("Background sync not supported!");
        }
    });
