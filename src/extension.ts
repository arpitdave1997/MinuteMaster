import * as vscode from 'vscode';

function generateDocstringsForFile(document: vscode.TextDocument) {
    const text = document.getText();
    const functionRegex = /def\s+(\w+)\s*\((.*?)\)\s*:/g;
    let match;

    let edits: vscode.TextEdit[] = [];
    const format = vscode.workspace.getConfiguration('autodoc').get('defaultFormat') || 'Google';

    while ((match = functionRegex.exec(text)) !== null) {
        const functionName = match[1];
        const params = match[2].split(',').map(p => p.trim()).filter(p => p);

        // Generate the appropriate docstring
        let docstring = '';
        if (format === 'Google') {
            docstring = generateGoogleStyleDocstring(functionName, params);
        } else if (format === 'Sphinx') {
            docstring = generateSphinxStyleDocstring(functionName, params);
        } else if (format === 'Numpy') {
            docstring = generateNumpyStyleDocstring(functionName, params);
        }

        const position = document.positionAt(match.index + match[0].length);
        edits.push(vscode.TextEdit.insert(position, docstring));
    }

    return edits;
}

// Google-style docstring
function generateGoogleStyleDocstring(functionName: string, params: string[]): string {
    let docstring = `\n    \"\"\"\n    ${functionName} summary.\n\n`;
    if (params.length > 0) {
        docstring += `    Args:\n`;
        params.forEach(param => {
            docstring += `        ${param}: Description.\n`;
        });
    }
    docstring += `    Returns:\n        Description.\n    \"\"\"\n`;
    return docstring;
}

// Sphinx-style docstring
function generateSphinxStyleDocstring(functionName: string, params: string[]): string {
    let docstring = `\n    \"\"\"\n    ${functionName} summary.\n\n`;
    if (params.length > 0) {
        docstring += `    :param ${params.join(', ')}:\n`;
    }
    docstring += `    :returns: Description.\n    \"\"\"\n`;
    return docstring;
}

// Numpy-style docstring
function generateNumpyStyleDocstring(functionName: string, params: string[]): string {
    let docstring = `\n    \"\"\"\n    ${functionName} summary.\n\n`;
    if (params.length > 0) {
        docstring += `    Parameters\n    ----------\n`;
        params.forEach(param => {
            docstring += `    ${param} : type\n        Description.\n`;
        });
    }
    docstring += `    Returns\n    -------\n    type\n        Description.\n    \"\"\"\n`;
    return docstring;
}

export function activate(context: vscode.ExtensionContext) {
    const firstTime = context.globalState.get('firstTime', true);

    if (firstTime) {
        context.globalState.update('firstTime', false);

        vscode.window.showInformationMessage('Select default docstring format:', 'Google', 'Sphinx', 'Numpy')
            .then(selected => {
                if (selected) {
                    vscode.workspace.getConfiguration('autodoc').update('defaultFormat', selected, true);
                }
            });
    }
	
    let disposable = vscode.commands.registerCommand('autodoc.generateDocstrings', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const workspaceEdit = new vscode.WorkspaceEdit();

            const edits = generateDocstringsForFile(document);
            edits.forEach(edit => {
                workspaceEdit.set(document.uri, [edit]);
            });

            vscode.workspace.applyEdit(workspaceEdit);
        }
    });

    let selectFormatCommand = vscode.commands.registerCommand('autodoc.selectDocstringFormat', () => {
        vscode.window.showQuickPick(['Google', 'Sphinx', 'Numpy'], {
            placeHolder: 'Select the default docstring format'
        }).then(selected => {
            if (selected) {
                vscode.workspace.getConfiguration('autodoc').update('defaultFormat', selected, true);
                vscode.window.showInformationMessage(`AutoDoc: Docstring format set to ${selected}`);
            }
        });
    });    

    context.subscriptions.push(disposable);
    context.subscriptions.push(selectFormatCommand);
}

export function deactivate() {}
