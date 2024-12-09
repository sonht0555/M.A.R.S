let context = null;
/* -------- Function Define -------- */
// The cursor loading each time you translate
function setLoadingCursor() {
    document.body.style.cursor = 'wait';
    setTimeout(() => {
        document.body.style.cursor = 'default';
    }, 500);
}
// En to English
function langCodeToName(code) {
    const languageMap = {
        af: "Afrikaans",
        sq: "Albanian",
        am: "Amharic",
        ar: "Arabic",
        hy: "Armenian",
        az: "Azerbaijani",
        eu: "Basque",
        be: "Belarusian",
        bn: "Bengali",
        bs: "Bosnian",
        bg: "Bulgarian",
        ca: "Catalan",
        ceb: "Cebuano",
        ny: "Chichewa",
        "zh-CN": "Chinese (Simplified)",
        "zh-TW": "Chinese (Traditional)",
        co: "Corsican",
        hr: "Croatian",
        cs: "Czech",
        da: "Danish",
        nl: "Dutch",
        en: "English",
        eo: "Esperanto",
        et: "Estonian",
        tl: "Filipino",
        fi: "Finnish",
        fr: "French",
        fy: "Frisian",
        gl: "Galician",
        ka: "Georgian",
        de: "German",
        el: "Greek",
        gu: "Gujarati",
        ht: "Haitian Creole",
        ha: "Hausa",
        haw: "Hawaiian",
        iw: "Hebrew",
        hi: "Hindi",
        hmn: "Hmong",
        hu: "Hungarian",
        is: "Icelandic",
        ig: "Igbo",
        id: "Indonesian",
        ga: "Irish",
        it: "Italian",
        ja: "Japanese",
        jw: "Javanese",
        kn: "Kannada",
        kk: "Kazakh",
        km: "Khmer",
        rw: "Kinyarwanda",
        ko: "Korean",
        ku: "Kurdish (Kurmanji)",
        ky: "Kyrgyz",
        lo: "Lao",
        la: "Latin",
        lv: "Latvian",
        lt: "Lithuanian",
        lb: "Luxembourgish",
        mg: "Malagasy",
        ms: "Malay",
        ml: "Malayalam",
        mt: "Maltese",
        mi: "Maori",
        mr: "Marathi",
        mn: "Mongolian",
        my: "Myanmar (Burmese)",
        ne: "Nepali",
        no: "Norwegian",
        ps: "Pashto",
        fa: "Persian",
        pl: "Polish",
        pt: "Portuguese",
        pa: "Punjabi",
        ro: "Romanian",
        ru: "Russian",
        sm: "Samoan",
        gd: "Scots Gaelic",
        sr: "Serbian",
        st: "Sesotho",
        sn: "Shona",
        sd: "Sindhi",
        si: "Sinhala",
        sk: "Slovak",
        sl: "Slovenian",
        so: "Somali",
        es: "Spanish",
        su: "Sundanese",
        sw: "Swahili",
        sv: "Swedish",
        tg: "Tajik",
        ta: "Tamil",
        tt: "Tatar",
        te: "Telugu",
        th: "Thai",
        tr: "Turkish",
        tk: "Turkmen",
        uk: "Ukrainian",
        ur: "Urdu",
        ug: "Uyghur",
        uz: "Uzbek",
        vi: "Vietnamese",
        cy: "Welsh",
        xh: "Xhosa",
        yi: "Yiddish",
        yo: "Yoruba",
        zu: "Zulu",
    };
    return languageMap[code] || code;
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
                const translatedText = await translateWithGemini(selectedText, targetLang, context, GeminiAPI);
                setLoadingCursor();
                if (document.getElementById('marsContent')) {
                    applyTranslationTooltip(translatedText);
                } else {
                    applyTranslation(translatedText);
                }
                console.log('Gemini-AI');
                console.log('%cContent%c ' + selectedText, '', 'color: #10B981; font-style: italic;');
                console.log('%cTranslated [' + targetLang + ']%c ' + translatedText, '', 'color: #DD5639; font-style: italic;');
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
                    setLoadingCursor();
                    if (document.getElementById('marsContent')) {
                        applyTranslationTooltip(translatedText);
                    } else {
                        applyTranslation(translatedText);
                    }
                    console.log('Google-AI');
                    console.log('%cContent%c ' + selectedText, '', 'color: #10B981; font-style: italic;');
                    console.log('%cTranslated [' + targetLang + ']%c ' + translatedText, '', 'color: #DD5639; font-style: italic;');
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
    const prompt = `"Translate the following text into ${langCodeToName(targetLang)}: [${selectedText}] with the context: [${context}]. Provide only the translated text as output, without any additional explanations."`;
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