document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('js-editor');
    const runBtn = document.getElementById('run-btn');
    const clearEditorBtn = document.getElementById('clear-editor-btn');
    const clearConsoleBtn = document.getElementById('clear-console-btn');
    const consoleOutput = document.getElementById('console-output');
    const previewArea = document.getElementById('preview-area');
    const resetPreviewBtn = document.getElementById('reset-preview-btn');

    const originalPreviewHTML = previewArea.innerHTML;

    // Custom console implementation
    const customConsole = {
        log: (...args) => {
            const message = args.map(arg => {
                if (typeof arg === 'object') return JSON.stringify(arg);
                return String(arg);
            }).join(' ');
            appendLog(message);
        },
        error: (...args) => {
            const message = args.map(arg => String(arg)).join(' ');
            appendLog(message, 'error');
        }
    };

    function appendLog(message, type = '') {
        const div = document.createElement('div');
        div.className = `log-message ${type}`;
        div.textContent = message;
        consoleOutput.appendChild(div);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    function runCode() {
        const code = editor.value;
        appendLog('Executing code...', 'system');

        try {
            // We use a function constructor to execute code in a controlled scope
            // We provide access to our custom console and common DOM elements
            const execute = new Function('console', 'document', 'preview', code);
            execute(customConsole, document, previewArea);
        } catch (err) {
            customConsole.error(err);
        }
    }

    runBtn.addEventListener('click', runCode);

    clearEditorBtn.addEventListener('click', () => {
        editor.value = '';
    });

    clearConsoleBtn.addEventListener('click', () => {
        consoleOutput.innerHTML = '<div class="log-message system">Console cleared.</div>';
    });

    resetPreviewBtn.addEventListener('click', () => {
        previewArea.innerHTML = originalPreviewHTML;
        appendLog('Preview area reset.', 'system');
    });

    // Support Cmd/Ctrl + Enter to run
    editor.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            runCode();
        }
    });
});
