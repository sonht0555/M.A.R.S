let originalText = '';
let clipboardText = null;
let currentInput = null;
let savedInputSelection = null;
let savedTextSelection = null;
let undoStack = [];

/* -------- Function Define -------- */
// Check the object being clicked
function handleInputEvent(event) {
    if ((event.target.tagName === 'INPUT') || (event.target.tagName === 'TEXTAREA') || (event.target.tagName === 'SELECT')) {
        currentInput = event.target;
        console.log ("1", selectedText);
    } else {
        currentInput = null;
        console.log ("2", currentInput);
    }
}
// Translation processing
function applyTranslation(translatedText) {
    if (currentInput) {
        savedInputSelection = {
            start: currentInput.selectionStart,
            end: currentInput.selectionEnd
        };
        originalText = currentInput.value;
        const inputClick = currentInput;
        saveToStack('input', originalText, savedInputSelection, inputClick, null);
        const currentValue = currentInput.value;
        const newValue = currentValue.slice(0, savedInputSelection.start) + translatedText + currentValue.slice(savedInputSelection.end);
        navigator.clipboard.writeText(translatedText);
        currentInput.value = newValue;
        currentInput.setSelectionRange(savedInputSelection.start, savedInputSelection.start + translatedText.length);
    } else {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        savedTextSelection = selection.getRangeAt(0);
        originalText = savedTextSelection.toString();
        saveToStack('text', originalText, null, null, savedTextSelection);
        navigator.clipboard.writeText(translatedText);
        savedTextSelection.deleteContents(); 
        savedTextSelection.insertNode(document.createTextNode(translatedText));
    }
}

/* -------- Processing Function -------- */
// Check the user click status
document.addEventListener('select', handleInputEvent);
document.addEventListener('mouseup', handleInputEvent);
document.addEventListener('copy', () => {
    clipboardText = document.getSelection().toString();
});
document.addEventListener('mouseup', () => {
    const selectedText = window.getSelection().toString();
    //updateRangeText();
    if (!selectedText) {
        currentInput = null;
    }
});
// Process translation after pressing shortcut key
document.addEventListener('keydown', async (event) => {
    chrome.storage.sync.get(['onOffSwitchState', 'lang1st', 'lang2nd', 'lang3rd','key1st', 'key2nd', 'key3rd','fun1st', 'fun2nd', 'fun3rd'], async function (result) {
            const { onOffSwitchState, lang1st, lang2nd, lang3rd, key1st, key2nd, key3rd, fun1st, fun2nd, fun3rd } = result;
            if (!onOffSwitchState) return;
            const selectedText = window.getSelection().toString();
            // Translation process
            const handleTranslation = (triggerKey, funKey, lang) => {
                if (event[funKey || 'metaKey'] && event.key === triggerKey) {
                    event.preventDefault();
                    event.stopPropagation();
                    translateSelectedText(selectedText || clipboardText, lang);
                }
            };
            // Translation processing
            handleTranslation(key1st, fun1st, lang1st);
            handleTranslation(key2nd, fun2nd, lang2nd);
            handleTranslation(key3rd, fun3rd, lang3rd);
            // Undo
            if (event.metaKey && event.key === 'z') {
                event.preventDefault();
                undoLastAction(event); 
            }
        }
    );
});

function saveToStack(type, originalText, inputRange, inputSelected, textRange) {
    if (undoStack.length >= 20) {
        undoStack.shift(); 
    }
    if (type === 'input') {
        undoStack.push({
            type: 'input',
            text: originalText,
            range: inputRange,
            input: inputSelected,
        });
    } else if (type === 'text') {
        undoStack.push({
            type: 'text',
            text: originalText,
            range: textRange,
        });
    }
    console.log("undoStack", undoStack);
}

function undoLastAction() {
    if (undoStack.length > 0) {
        const lastState = undoStack.pop();
        if (lastState.type === 'input') {
            lastState.input.value = lastState.text; 
            lastState.input.setSelectionRange(lastState.range.start, lastState.range.end);
        } else if ((lastState.type === 'text')) {
            lastState.range.deleteContents();
            lastState.range.insertNode(document.createTextNode(lastState.text));
        }
        console.log('Undo');
    }
}
