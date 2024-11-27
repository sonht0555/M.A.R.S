let divall = null;
const selectedText = window.getSelection().toString();

/* -------- Function Define -------- */
// Update cursor position
function updateRangeText() {
    const selectedText = window.getSelection().toString();
    const range = window.getSelection().getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const existingDiv = document.getElementById('divall');
    const windowH = window.innerHeight;

    if (selectedText !== '') {
        if (!existingDiv) {
            if (rect.right > 0) {
                var divall = document.createElement('divs');
                divall.classList.add('divall');
                divall.id = 'divall';
                document.body.appendChild(divall);

                var marsContent = document.createElement('divs');
                marsContent.classList.add('marsContent');
                marsContent.id = 'marsContent';
                marsContent.textContent = '...';
                divall.appendChild(marsContent);

                var marsFooter = document.createElement('divs');
                marsFooter.classList.add('marsFooter');
                divall.appendChild(marsFooter);

                var lang1 = document.createElement('buttons');
                lang1.classList.add('lang');
                chrome.storage.sync.get(['lang1st'], function(result) {
                    lang1.textContent = result.lang1st;
                })
                lang1.id = 'btn1st';
                marsFooter.appendChild(lang1);

                var lang2 = document.createElement('buttons');
                lang2.classList.add('lang');
                chrome.storage.sync.get(['lang2nd'], function(result) {
                    lang2.textContent = result.lang2nd;
                })
                lang2.id = 'btn2nd';
                marsFooter.appendChild(lang2);

                var lang3 = document.createElement('buttons');
                lang3.classList.add('lang');
                chrome.storage.sync.get(['lang3rd'], function(result) {
                    lang3.textContent = result.lang3rd;
                })
                lang3.id = 'btn3rd';
                marsFooter.appendChild(lang3);

                var load = document.createElement('divs');
                load.classList.add('load');
                load.id = 'load';
                marsFooter.appendChild(load);

                var dot1 = document.createElement('divs');
                dot1.classList.add('dot1');
                load.appendChild(dot1);

                var dot2 = document.createElement('divs');
                dot2.classList.add('dot1');
                load.appendChild(dot2);
                var dot3 = document.createElement('divs');
                dot3.classList.add('dot1');
                load.appendChild(dot3);
                DivHeight = document.getElementById('divall');
                existingDivHeight = DivHeight.offsetHeight;
                divall.style.left = rect.left + 'px';
                if (rect.width < 160) {
                    divall.style.width = 'auto'
                } else {
                    divall.style.width = (rect.width) + 'px'
                }
                if (rect.bottom > (windowH - existingDivHeight - rect.height + window.scrollY)) {
                    divall.style.top = (rect.top - existingDivHeight - 8 + window.scrollY) + 'px';
                } else {
                    divall.style.top = (rect.bottom + 8 + window.scrollY) + 'px';

                }
            } else {
                console.log('Location could not be determined');
            }
        }
    } else {
        if (existingDiv) {
            existingDiv.parentNode.removeChild(existingDiv);
        }
    }
}
// Translation processing
function applyTranslationTooltip(translatedText) {
    marsContent = document.getElementById('marsContent');
    marsContent.textContent = translatedText;
    chrome.storage.sync.set({
        'translatedText': translatedText
    }, function() {});
}

/* -------- Processing Function -------- */
// Process translation after pressing shortcut key
document.addEventListener('keydown', function(event) {
    chrome.storage.sync.get(['tookey'], function(result) {
        const {
            tookey
        } = result;
        const selectedText = window.getSelection().toString();
        const divall = document.getElementById('divall');
        if (divall) {
            divall.parentNode.removeChild(divall);
        } else {
            if (event.key === tookey && selectedText) {
                event.preventDefault();
                chrome.storage.sync.get(['targetLang'], function(result) {
                    const {
                        targetLang: storedTargetLang
                    } = result;
                    if (storedTargetLang) {
                        targetLang = storedTargetLang;
                        translateSelectedText(selectedText, targetLang);
                    }
                });
                chrome.storage.sync.set({
                    'selectedText': selectedText
                }, function() {});
                updateRangeText();

                document.getElementById('btn1st').addEventListener('click', function() {
                    chrome.storage.sync.get(['lang1st'], function(result) {
                        const {
                            lang1st
                        } = result;
                        targetLang = lang1st;
                        chrome.storage.sync.set({
                            'targetLang': targetLang
                        });
                        chrome.storage.sync.set({
                            'selectedText': selectedText
                        }, function() {});
                        translateSelectedText(selectedText, targetLang);
                    });
                });
                document.getElementById('btn2nd').addEventListener('click', function() {
                    chrome.storage.sync.get(['lang2nd'], function(result) {
                        const {
                            lang2nd
                        } = result;
                        targetLang = lang2nd;
                        chrome.storage.sync.set({
                            'targetLang': targetLang
                        });
                        chrome.storage.sync.set({
                            'selectedText': selectedText
                        }, function() {});
                        translateSelectedText(selectedText, targetLang);
                    });
                });
                document.getElementById('btn3rd').addEventListener('click', function() {
                    chrome.storage.sync.get(['lang3rd'], function(result) {
                        const {
                            lang3rd
                        } = result;
                        targetLang = lang3rd;
                        chrome.storage.sync.set({
                            'targetLang': targetLang
                        });
                        chrome.storage.sync.set({
                            'selectedText': selectedText
                        }, function() {});
                        translateSelectedText(selectedText, targetLang);
                    });
                });

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
            }
        }
    })
});
// Check cursor position
document.addEventListener('click', function(event) {
    const divall = document.getElementById('divall');
    if (divall && !divall.contains(event.target)) {
        divall.parentNode.removeChild(divall);
    }
});