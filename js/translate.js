let context = null;

/* -------- Function Define -------- */
// The cursor loading each time you translate
function setLoadingCursor() {
    document.body.style.cursor = 'wait';
    setTimeout(() => {
        document.body.style.cursor = 'default';
    }, 500);
}
// Core Translate
function translateSelectedText(selectedText, targetLang, context) {
    chrome.storage.sync.get(['AI'], function(result) {
        const {AI} = result;
        if (document.getElementById('marsContent')) {
            document.getElementById('load').style.opacity = '1';
        }
        if (AI) {
            chrome.storage.sync.get(['GeminiAPI'], async function(result) {
                const GeminiAPI = result.GeminiAPI;
                console.log("GeminiAPI")
                const translatedText = await translateWithGemini(selectedText, targetLang, context, GeminiAPI);
                setLoadingCursor();
                if (document.getElementById('marsContent')) {
                    applyTranslationTooltip(translatedText);
                } else {
                    applyTranslation(translatedText);
                }
            });
        } else {
            const xhrUrl = "https://translate.googleapis.com/translate_a/single?dt=t&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&dt=at&client=gtx&hl=" + targetLang + "&sl=auto&tl=" + targetLang + "&dj=1&source=bubble";
            var xhr = new XMLHttpRequest();
            xhr.open("POST", xhrUrl, false);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const json = JSON.parse(xhr.responseText);
                    const translatedText = json.sentences.map(sentence => sentence.trans).join(' ');
                    console.log('Google-AI');
                    console.log('%cContent%c ' + selectedText, '', 'color: #10B981; font-style: italic;');
                    console.log('%cTranslated [' + targetLang + ']%c ' + translatedText, '', 'color: #DD5639; font-style: italic;');
                    setLoadingCursor();
                    if (document.getElementById('marsContent')) {
                        applyTranslationTooltip(translatedText);
                    } else {
                        applyTranslation(translatedText);
                    }
                    //navigator.clipboard.writeText(translatedText);
                } else {
                    console.error('Request failed with status ' + xhr.status);
                }
                if (document.getElementById('marsContent')) {
                    document.getElementById('load').style.opacity = '0';
                }
            };
            xhr.onerror = function() {
                console.error('Request failed');
                if (document.getElementById('marsContent')) {
                    document.getElementById('load').style.opacity = '0';
                }
            };
            xhr.send("q=" + encodeURIComponent(selectedText));
        }
    });
}
// Gemini Translate
async function translateWithGemini(selectedText, targetLang, context, apiKey) {
    const prompt = `"Translate this into ${targetLang}: [${selectedText}] with context: [${context}] and with only translated content"`;
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{role: "user",parts: [{text: prompt,},],},],
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Error during translation:", error);
      return null;
    }
}