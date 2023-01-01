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