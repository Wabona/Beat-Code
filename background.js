let latestServerResponse = null;

chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    if (request.action === "popupOpened" && latestServerResponse) {
        chrome.runtime.sendMessage({ action: "serverResponse", data: latestServerResponse });
    }
});

chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    if (request.action === "takeScreenshot") {
        console.log("Taking Screenshot...");
        chrome.tabs.captureVisibleTab(null, {format: 'png'}, function(image) {
            const base64 = image.split(",")[1]
            console.log("Base 64 image: ", base64);
            sendBase64ToServer(base64);
        });
    }
});

function sendBase64ToServer(base64) {
    const url = "http://localhost:3000/generate-quiz";
    const data = {image: base64};

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        chrome.runtime.sendMessage({action: "serverResponse", data: data})
        latestServerResponse = data;
    })
    .catch((error) => {
        console.log('Error' , error);
    })
}

  