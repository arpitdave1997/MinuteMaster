"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const generative_ai_1 = require("@google/generative-ai");
// This method is called when your extension is activated
function activate(context) {
    // Command to set the docstring format
    let setFormatCommand = vscode.commands.registerCommand('extension.setDocstringFormat', () => __awaiter(this, void 0, void 0, function* () {
        const formats = ['Google', 'NumPy', 'Sphinx'];
        const selectedFormat = yield vscode.window.showQuickPick(formats, { placeHolder: 'Select a default docstring format' });
        if (selectedFormat) {
            vscode.workspace.getConfiguration().update('autoDoc.docstringFormat', selectedFormat, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`Docstring format set to ${selectedFormat}`);
        }
    }));
    // Command to generate the docstring for a selected method
    let generateDocstringCommand = vscode.commands.registerCommand('extension.generateDocstring', () => __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            const selectedText = editor.document.getText(selection);
            if (selectedText) {
                const docstringFormat = vscode.workspace.getConfiguration().get('autoDoc.docstringFormat');
                const response = yield generateDocstring(selectedText, docstringFormat);
                if (response) {
                    editor.edit(editBuilder => {
                        editBuilder.insert(selection.end, `\n${response}`);
                    });
                }
            }
            else {
                vscode.window.showErrorMessage('No method selected!');
            }
        }
    }));
    context.subscriptions.push(setFormatCommand);
    context.subscriptions.push(generateDocstringCommand);
}
// Function to call the Gemini Pro API
function generateDocstring(methodCode, format) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const prompt = `Generate docstring for the following method in the ${format} format.\n${methodCode}`;
            const genAI = new generative_ai_1.GoogleGenerativeAI((_a = process.env.GEMINI_API_KEY) !== null && _a !== void 0 ? _a : "");
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = yield model.generateContent(prompt);
            return result.response.text();
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error generating docstring: ${error}`);
            return null;
        }
    });
}
// This method is called when your extension is deactivated
function deactivate() { }
//# sourceMappingURL=extension.js.map