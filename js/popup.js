let targetLang = "en";
const settingBtn = document.getElementById('settingBtn');
const setContent = document.getElementById('setContent');
const tranContent = document.getElementById('tranContent');
const noti = document.getElementById('noti');
const lang1st = document.getElementById('lang-1st');
const lang2nd = document.getElementById('lang-2nd');
const lang3rd = document.getElementById('lang-3rd');
const key1st = document.getElementById('key-1st');
const key2nd = document.getElementById('key-2nd');
const key3rd = document.getElementById('key-3rd');
const btn1st = document.getElementById('btn1st');
const btn2nd = document.getElementById('btn2nd');
const btn3rd = document.getElementById('btn3rd');
const fun1st = document.getElementById('fun1st');
const fun2nd = document.getElementById('fun2nd');
const fun3rd = document.getElementById('fun3rd');
const tookey = document.getElementById('tookey');
const openApi = document.getElementById('openApi');
const outputTextarea = document.getElementById('outputTextarea');
const inputTextarea = document.getElementById('inputTextarea');
const copy = document.getElementById('copy');
const dele = document.getElementById('dele');
const AI = document.getElementById('AI');
const onOffSwitch = document.getElementById('onOffSwitch');

/* -------- Function Define -------- */
// Check validate
function checkValidate() {
    chrome.storage.sync.get(['lang1st', 'lang2nd', 'lang3rd', 'key1st', 'key2nd', 'key3rd', 'tookey'], function(result) {
        const {lang1st,lang2nd,lang3rd,key1st,key2nd,key3rd,tookey} = result;
        const isSettingRequired = [lang1st, lang2nd, lang3rd, key1st, key2nd, key3rd, tookey].some(item => item === "" || item === undefined);

        settingBtn.classList.toggle('active', isSettingRequired);
        setContent.classList.toggle('set-disable', !isSettingRequired);
        tranContent.classList.toggle('set-disable', isSettingRequired);
        noti.classList.toggle('set-disable', !isSettingRequired);

        document.getElementById('lang-1st').classList.toggle('validate', lang1st === "" || lang1st === undefined);
        document.getElementById('lang-2nd').classList.toggle('validate', lang2nd === "" || lang2nd === undefined);
        document.getElementById('lang-3rd').classList.toggle('validate', lang3rd === "" || lang3rd === undefined);
        document.getElementById('key-1st').classList.toggle('validate', key1st === "" || key1st === undefined);
        document.getElementById('key-2nd').classList.toggle('validate', key2nd === "" || key2nd === undefined);
        document.getElementById('key-3rd').classList.toggle('validate', key3rd === "" || key3rd === undefined);
        document.getElementById('tookey').classList.toggle('validate', tookey === "" || tookey === undefined);
    });
}
// Translation processing
function applyTranslation(translatedText) {
    document.getElementById('outputTextarea').value = translatedText;
    autoExpand(document.getElementById('outputTextarea'));
    chrome.storage.sync.set({
        'translatedText': translatedText
    }, function() {});
}
// Copy and Delete button hande click
function checkTextarea(image) {
    chrome.storage.sync.get(['selectedText'], function(result) {
        const text = result.selectedText;
        if (text !== '') {
            image.style.display = "block";
        } else {
            image.style.display = "none";
        }
    });
}
// Button Translation handle click
function handleButtonClick(langKey) {
    chrome.storage.sync.get([langKey], function(result) {
        const lang = result[langKey];
        targetLang = lang;
        chrome.storage.sync.set({
            'targetLang': targetLang
        });
        const selectedText = document.getElementById('inputTextarea').value;
        chrome.storage.sync.set({
            'selectedText': selectedText
        }, function() {});
        const prompt = document.getElementById('prompt').value
        translateSelectedText(selectedText, targetLang, prompt);
    });
}
// Get data into storage
function getDataInStorage(elementId, storageKey) {
    document.getElementById(elementId).addEventListener('change', function() {
        var value = this.value;
        var data = {};
        data[storageKey] = value;
        chrome.storage.sync.set(data);
    });
}
// Auto change size Text Area
function autoExpand(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight + 14) + 'px';
}

/* -------- Setting Function -------- */
// GoogleAI - OpenAI text change
AI.addEventListener('change', function() {
    const AI = this.checked;
    chrome.storage.sync.set({
        'AI': AI
    });
    if (this.checked) {
        Google.classList.add('tc');
        GPT.classList.remove('tc');
        document.getElementById('flag-logo').textContent = 'Open';
    } else {
        Google.classList.remove('tc');
        GPT.classList.add('tc');
        document.getElementById('flag-logo').textContent = 'Google';
    }
});
// Setting toggle
settingBtn.addEventListener('click', function() {
    settingBtn.classList.toggle('active');
    setContent.classList.toggle('set-disable');
    tranContent.classList.toggle('set-disable');
});
// Setting -> Select Function Key 1st
fun1st.addEventListener('change', function() {
    var value = this.value;
    chrome.storage.sync.set({
        'fun1st': value
    });
    console.log('fun1st:', value);
});
// Setting -> Select Output language 1st
btn1st.addEventListener('click', function() {
    handleButtonClick('lang1st');
});
// Setting -> Select Function Key 2nd
fun2nd.addEventListener('change', function() {
    var value = this.value;
    chrome.storage.sync.set({
        'fun2nd': value
    });
    console.log('fun2nd:', value);
});
// Setting -> Select Output language 2nd
btn2nd.addEventListener('click', function() {
    handleButtonClick('lang2nd');
});
// Setting -> Select Function Key 3rd
fun3rd.addEventListener('change', function() {
    var value = this.value;
    chrome.storage.sync.set({
        'fun3rd': value
    });
    console.log('fun3rd:', value);
});
// Setting -> Select Output language 3rd
btn3rd.addEventListener('click', function() {
    handleButtonClick('lang3rd');
});
// Setting -> On-Off button
onOffSwitch.addEventListener('change', function() {
    const onOffSwitchState = this.checked;
    chrome.storage.sync.set({
        'onOffSwitchState': onOffSwitchState
    });
    if (this.checked) {
        On.classList.remove('tc');
        document.getElementById('langContent').classList.remove('tc');
        document.getElementById('AItrans').classList.remove('tc');
        document.getElementById('settingBtn').classList.remove('tc');
    } else {
        On.classList.add('tc');
        document.getElementById('langContent').classList.add('tc');
        document.getElementById('AItrans').classList.add('tc');
        document.getElementById('settingBtn').classList.add('tc');
    }
});
// Setting -> Select ShortCut Key
tookey.addEventListener('change', function() {
    var value = this.value;
    chrome.storage.sync.set({
        'tookey': value
    });
    console.log('tookey:', value);
});
// Setting -> Input API
openApi.addEventListener('change', function() {
    var value = this.value;
    chrome.storage.sync.set({
        'openApi': value
    });
});

/* -------- Main Function -------- */
// Auto expand
inputTextarea.addEventListener('input', function() {
    autoExpand(inputTextarea);
});
// Translation after ENTER
inputTextarea.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        const selectedText = document.getElementById('inputTextarea').value;
        chrome.storage.sync.set({
            'selectedText': selectedText
        }, function() {});
        if (selectedText.trim() !== '') {
            const prompt = document.getElementById('prompt').value;
            translateSelectedText(selectedText, targetLang, prompt);
        } else {
            outputTextarea.value = '';
            outputTextarea.placeholder = 'No translation content';
            chrome.storage.sync.set({
                'translatedText': ''
            }, function() {});
        }
    } else {
        outputTextarea.value = ''
        autoExpand(outputTextarea);
    }
    if (event.key === "Enter") {
        checkTextarea(copy);
        checkTextarea(dele);
    }
});
// Delete button
dele.addEventListener('click', () => {
    inputTextarea.value = outputTextarea.value = '';
    copy.style.display = "none";
    dele.style.display = "none";
    autoExpand(inputTextarea);
    chrome.storage.sync.set({
        selectedText: '',
        translatedText: ''
    });
});
// Copy button
copy.addEventListener('click', () => {
    outputTextarea.value = 'Copied to clipboard!'
    chrome.storage.sync.get(['translatedText'], (result) => {
        const text = result.translatedText;
        navigator.clipboard.writeText(text)
        setTimeout(function() {
            outputTextarea.value = text;
        }, 600);
    });
});
// Check validate processing
document.addEventListener('change', function () {
    checkValidate();
});

/* -------- DOMContentLoaded -------- */
document.addEventListener('DOMContentLoaded', function() {
    checkTextarea(copy);
    checkTextarea(dele);
    autoExpand(inputTextarea);
    autoExpand(outputTextarea);
    getDataInStorage('lang-1st', 'lang1st');
    getDataInStorage('lang-2nd', 'lang2nd');
    getDataInStorage('lang-3rd', 'lang3rd');
    getDataInStorage('key-1st', 'key1st');
    getDataInStorage('key-2nd', 'key2nd');
    getDataInStorage('key-3rd', 'key3rd');
    chrome.storage.sync.get(['onOffSwitchState', 'AI', 'lang1st', 'lang2nd', 'lang3rd', 'key1st', 'key2nd', 'key3rd', 'translatedText', 'selectedText', 'targetLang', 'tookey', 'fun1st', 'fun2nd', 'fun3rd', 'openApi'], function(result) {
        if (result.onOffSwitchState !== undefined) {
            onOffSwitch.checked = result.onOffSwitchState;
            if (result.onOffSwitchState == true) {
                On.classList.remove('tc');
                document.getElementById('langContent').classList.remove('tc');
                document.getElementById('AItrans').classList.remove('tc');
                document.getElementById('settingBtn').classList.remove('tc');
            } else {
                On.classList.add('tc');
                document.getElementById('langContent').classList.add('tc');
                document.getElementById('AItrans').classList.add('tc');
                document.getElementById('settingBtn').classList.add('tc');
            }
        }
        if (result.AI !== undefined) {
            AI.checked = result.AI;
            if (result.AI == true) {
                Google.classList.add('tc');
                GPT.classList.remove('tc');
                document.getElementById('flag-logo').textContent = 'Open';
            } else {
                Google.classList.remove('tc');
                GPT.classList.add('tc');
                document.getElementById('flag-logo').textContent = 'Google';
            }
        }
        btn1st.textContent = result.lang1st; 
        btn2nd.textContent = result.lang2nd; 
        btn3rd.textContent = result.lang3rd; 
        if (result.lang1st !== undefined) {
            lang1st.value = result.lang1st;
        }
        if (result.lang2nd !== undefined) {
            lang2nd.value = result.lang2nd;
        }
        if (result.lang3rd !== undefined) {
            lang3rd.value = result.lang3rd;
        }
        if (result.key1st !== undefined) {
            key1st.value = result.key1st;
        }
        if (result.key2nd !== undefined) {
            key2nd.value = result.key2nd;
        }
        if (result.key3rd !== undefined) {
            key3rd.value = result.key3rd;
        }
        if (result.fun1st !== undefined) {
            fun1st.value = result.fun1st;
        }
        if (result.fun2nd !== undefined) {
            fun2nd.value = result.fun2nd;
        }
        if (result.fun3rd !== undefined) {
            fun3rd.value = result.fun3rd;
        }
        if (result.tookey !== undefined) {
            tookey.value = result.tookey;
        }
        if (result.openApi !== undefined) {
            openApi.value = result.openApi;
        }
        if (result.translatedText) {
            outputTextarea.value = result.translatedText;
            autoExpand(outputTextarea);
        }
        if (result.selectedText) {
            inputTextarea.value = result.selectedText;
            autoExpand(inputTextarea);
        }
        const {
            targetLang: storedTargetLang
        } = result;
        if (storedTargetLang) {
            targetLang = storedTargetLang;
        }
    });

    // function translation button
    const buttons = ['btn1st', 'btn2nd', 'btn3rd'].map(id => document.getElementById(id));
    chrome.storage.sync.get(['activeButton'], function(result) {
        const activeButtonId = result.activeButton;
        if (activeButtonId) {
            const activeButton = document.getElementById(activeButtonId);
            if (activeButton) {
                activeButton.classList.add('s1');
            }
        }
    });
    buttons.forEach((button) => {
        button.addEventListener('click', function() {
            buttons.forEach(btn => btn.classList.remove('s1'));
            button.classList.add('s1');
            chrome.storage.sync.set({
                'activeButton': button.id
            });
        });
    });
});

