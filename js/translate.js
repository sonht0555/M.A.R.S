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
function translateSelectedText(selectedText, targetLang, prompt) {
    chrome.storage.sync.get(['AI'], function(result) {
        const {
            AI
        } = result;
        if (document.getElementById('marsContent')) {
            document.getElementById('load').style.opacity = '1';
        }
        if (AI) {
            chrome.storage.sync.get(['openApi'], function(result) {
                const openaiApiKey = result.openApi;
                const apiUrl = 'https://api.openai.com/v1/chat/completions';
                const requestData = {
                    model: 'gpt-3.5-turbo',
                    messages: [{
                        role: 'assistant',
                        content: `In the context: ${prompt}, translate to ${targetLang} paragraph of text: ${selectedText}`
                    }, ],
                    temperature: 0.7,
                };
                const requestOptions = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${openaiApiKey}`,
                    },
                    body: JSON.stringify(requestData),
                };

                fetch(apiUrl, requestOptions)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Request failed with status ${response.status}`);
                        }
                        if (document.getElementById('marsContent')) {
                            document.getElementById('load').style.opacity = '0';
                        }
                        return response.json();
                    })
                    .then(data => {
                        const translatedText = data.choices[0].message.content;
                        console.log('Open-AI');
                        console.log('%cContent%c ' + selectedText, '', 'color: #10B981; font-style: italic;');
                        console.log('%cTranslated [' + targetLang + ']%c ' + translatedText, '', 'color: #DD5639; font-style: italic;');
                        setLoadingCursor();
                        if (document.getElementById('marsContent')) {
                            applyTranslationTooltip(translatedText);
                        } else {
                            applyTranslation(translatedText);
                            console.log('prompt', prompt);
                        }
                    })
                    .catch(error => {
                        console.error(error.message);
                    });
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