const MIN_WIDTH = 20;
const MIN_HEIGHT = 10;
let isSelecting = false;
let startX, startY, endX, endY;
const KEY = 'AIzaSyB5pTOxSimuBHDHB3G-zdDcpbO7LBKM8UY';
//---
const coordinates = document.createElement('div');
coordinates.style.position = 'absolute'
coordinates.style.zIndex = '2147483645';    
coordinates.style.fontFamily = 'arial'; 
coordinates.style.fontSize = '10px'; 
coordinates.style.right = '6px';
coordinates.style.color = 'gray';
coordinates.style.display = "none";
//---
const overlay = document.createElement('div');
overlay.style.position = 'absolute'
overlay.style.zIndex = '2147483645';
overlay.style.width = '100%'
overlay.style.height = '100%'
overlay.style.top = '0'
overlay.style.left = '0'
overlay.style.display = "none";
//---
const selectionBorder = document.createElement('div');
selectionBorder.style.position = 'absolute'
selectionBorder.style.boxSizing = 'border-box';
selectionBorder.style.backgroundColor = 'rgba(16, 185, 129, 0.20)';
selectionBorder.style.pointerEvents = 'none';
selectionBorder.style.zIndex = '2147483646';
selectionBorder.style.display = "none";
//---
const horizontal = document.createElement('div');
horizontal.style.position = 'absolute'
horizontal.style.width = '100%';
horizontal.style.borderTop = '1px dashed gray';
horizontal.style.boxSizing = 'border-box';
horizontal.style.zIndex = '2147483647';
horizontal.style.pointerEvents = 'none';
horizontal.style.display = "none";
//---
const vertical = document.createElement('div');
vertical.style.position = 'absolute'
vertical.style.height = '100%';
vertical.style.borderRight = '1px dashed gray';
vertical.style.boxSizing = 'border-box';
vertical.style.zIndex = '2147483647';
vertical.style.pointerEvents = 'none';
vertical.style.top = '0px';
vertical.style.display = "none";
//---
document.body.appendChild(horizontal);
document.body.appendChild(vertical);
document.body.appendChild(coordinates);
document.body.appendChild(selectionBorder);
document.body.appendChild(overlay);
document.addEventListener('mousemove', (e) => {
    horizontal.style.top = `${e.clientY}px`;
    vertical.style.left = `${e.clientX}px`;
    coordinates.style.top = `${e.clientY + 4}px`;
});
//---
async function captureScreenshot(x, y, width, height) {
    const scale = window.devicePixelRatio;
    x *= scale;
    y *= scale;
    width *= scale;
    height *= scale;
    chrome.runtime.sendMessage({
        type: "captureVisibleTab"
    }, async (response) => {
        if (!response || !response.screenshot) {
            console.error("Failed to capture screenshot.");
            return;
        }
        const img = new Image();
        img.src = response.screenshot;
        img.onload = async () => {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
            const croppedDataUrl = canvas.toDataURL("image/png").split(',')[1]; // Lấy Base64 và loại bỏ tiền tố
            try {
                const data = {
                    requests: [
                        {
                            image: { content: croppedDataUrl },
                            features: [{ type: "DOCUMENT_TEXT_DETECTION" }]
                        }
                    ],
                };
                const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                const result = await response.json();
                const text = result.responses[0]?.fullTextAnnotation?.text || 'No text detected';
                console.log("Detected text:", text);
            } catch (error) {
                console.error("Error during API request:", error);
            }
        };
        img.onerror = () => {
            console.error("Failed to load the screenshot as an image.");
        };
    });
}

const onMouseDown = (e) => {
    isSelecting = true;
    startX = e.clientX;
    startY = e.clientY;
    selectionBorder.style.display = "block";
    selectionBorder.style.left = `${startX}px`;
    selectionBorder.style.top = `${startY}px`;
    selectionBorder.style.width = `0px`;
    selectionBorder.style.height = `0px`;
};

const onMouseMove = (e) => {
    if (!isSelecting) return;

    endX = e.clientX;
    endY = e.clientY;

    const x = Math.min(startX, endX);
    const y = Math.min(startY, endY);
    const width = Math.abs(startX - endX);
    const height = Math.abs(startY - endY);

    selectionBorder.style.left = `${x}px`;
    selectionBorder.style.top = `${y}px`;
    selectionBorder.style.width = `${width}px`;
    selectionBorder.style.height = `${height}px`;
    coordinates.textContent = `${width}px ${height}px`
};

const onMouseUp = () => {
    if (!isSelecting) return;

    isSelecting = false;
    const x = Math.min(startX, endX) + window.scrollX; // Thêm scrollX
    const y = Math.min(startY, endY) + window.scrollY; // Thêm scrollY
    const width = Math.abs(startX - endX);
    const height = Math.abs(startY - endY);

    if (width < MIN_WIDTH || height < MIN_HEIGHT) {
        selectionBorder.style.display = "none";
        return;
    }

    selectionBorder.style.display = "none";
    horizontal.style.display = "none";
    vertical.style.display = "none";
    overlay.style.display = "none";
    coordinates.style.display = "none";


    captureScreenshot(x, y, width, height);

    document.body.removeEventListener("mousedown", onMouseDown);
    document.body.removeEventListener("mousemove", onMouseMove);
    document.body.removeEventListener("mouseup", onMouseUp);
};

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "startSelection") {
        document.body.addEventListener("mousedown", onMouseDown);
        document.body.addEventListener("mousemove", onMouseMove);
        document.body.addEventListener("mouseup", onMouseUp);
        horizontal.style.display = "block";
        vertical.style.display = "block";
        overlay.style.display = "block";
        coordinates.style.display = "block";
    }
});