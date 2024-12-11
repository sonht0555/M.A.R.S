const MIN_WIDTH=20,MIN_HEIGHT=10;let startX,startY,endX,endY,isSelecting=!1;const coordinates=document.createElement("div");coordinates.style.position="fixed",coordinates.style.zIndex="2147483645",coordinates.style.fontFamily="arial",coordinates.style.fontSize="10px",coordinates.style.right="6px",coordinates.style.color="gray",coordinates.style.display="none";const overlay=document.createElement("div");overlay.style.position="fixed",overlay.style.zIndex="2147483645",overlay.style.width="100%",overlay.style.height="100%",overlay.style.top="0",overlay.style.left="0",overlay.style.display="none";const selectionBorder=document.createElement("div");selectionBorder.style.position="fixed",selectionBorder.style.boxSizing="border-box",selectionBorder.style.backgroundColor="rgba(16, 185, 129, 0.20)",selectionBorder.style.pointerEvents="none",selectionBorder.style.zIndex="2147483646",selectionBorder.style.display="none";const horizontal=document.createElement("div");horizontal.style.position="fixed",horizontal.style.width="100%",horizontal.style.borderTop="1px dashed gray",horizontal.style.boxSizing="border-box",horizontal.style.zIndex="2147483647",horizontal.style.pointerEvents="none",horizontal.style.display="none";const vertical=document.createElement("div");async function captureScreenshot(e,t,o,n){chrome.storage.sync.get(["VisionAPI"],(async function(s){const r=s.VisionAPI;if(!r)return chrome.storage.sync.set({selectedText:"🤌 Please insert Vision API key ⇢ M.A.R.S settings.",translatedText:""},(function(){})),void chrome.runtime.sendMessage({type:"openPop"});const i=window.devicePixelRatio;e*=i,t*=i,o*=i,n*=i,chrome.runtime.sendMessage({type:"captureVisibleTab"},(async s=>{if(!s||!s.screenshot)return void console.error("Failed to capture screenshot.");const l=new Image;l.src=s.screenshot,l.onload=async()=>{const s=document.createElement("canvas");s.width=o,s.height=n;const a=s.getContext("2d"),d=e-window.scrollX*i,c=t-window.scrollY*i;a.drawImage(l,d,c,o,n,0,0,o,n),s.toBlob((async e=>{try{await navigator.clipboard.write([new ClipboardItem({"image/png":e})]),console.log("Image copied to clipboard successfully!")}catch(e){console.error("Failed to copy image to clipboard:",e)}}));const y=s.toDataURL("image/png").split(",")[1];try{const e={requests:[{image:{content:y},features:[{type:"DOCUMENT_TEXT_DETECTION"}]}]},t=await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${r}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)}),o=await t.json(),n=o.responses[0]?.fullTextAnnotation?.text||"No text detected";chrome.storage.sync.set({selectedText:n,translatedText:""},(function(){})),chrome.runtime.sendMessage({type:"openPop"})}catch(e){console.error("Error during API request:",e)}},l.onerror=()=>{console.error("Failed to load the screenshot as an image.")}}))}))}vertical.style.position="fixed",vertical.style.height="100%",vertical.style.borderRight="1px dashed gray",vertical.style.boxSizing="border-box",vertical.style.zIndex="2147483647",vertical.style.pointerEvents="none",vertical.style.top="0px",vertical.style.display="none",document.body.appendChild(horizontal),document.body.appendChild(vertical),document.body.appendChild(coordinates),document.body.appendChild(selectionBorder),document.body.appendChild(overlay),document.addEventListener("mousemove",(e=>{horizontal.style.top=`${e.clientY}px`,vertical.style.left=`${e.clientX}px`,coordinates.style.top=`${e.clientY+4}px`}));const onMouseDown=e=>{isSelecting=!0,startX=e.clientX,startY=e.clientY,selectionBorder.style.display="block",selectionBorder.style.left=`${startX}px`,selectionBorder.style.top=`${startY}px`,selectionBorder.style.width="0px",selectionBorder.style.height="0px"},onMouseMove=e=>{if(!isSelecting)return;endX=e.clientX,endY=e.clientY;const t=Math.min(startX,endX),o=Math.min(startY,endY),n=Math.abs(startX-endX),s=Math.abs(startY-endY);selectionBorder.style.left=`${t}px`,selectionBorder.style.top=`${o}px`,selectionBorder.style.width=`${n}px`,selectionBorder.style.height=`${s}px`,coordinates.textContent=`${n}px ${s}px`},onMouseUp=()=>{if(!isSelecting)return;isSelecting=!1;const e=Math.min(startX,endX)+window.scrollX,t=Math.min(startY,endY)+window.scrollY,o=Math.abs(startX-endX),n=Math.abs(startY-endY);o<20||n<10?selectionBorder.style.display="none":(selectionBorder.style.display="none",horizontal.style.display="none",vertical.style.display="none",overlay.style.display="none",coordinates.style.display="none",coordinates.textContent="",captureScreenshot(e,t,o,n),document.body.removeEventListener("mousedown",onMouseDown),document.body.removeEventListener("mousemove",onMouseMove),document.body.removeEventListener("mouseup",onMouseUp))};chrome.runtime.onMessage.addListener((e=>{"startSelection"===e.type&&(document.body.addEventListener("mousedown",onMouseDown),document.body.addEventListener("mousemove",onMouseMove),document.body.addEventListener("mouseup",onMouseUp),horizontal.style.display="block",vertical.style.display="block",overlay.style.display="block",coordinates.style.display="block")}));