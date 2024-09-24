import * as vscode from 'vscode';
import axios from 'axios';  // Ensure axios is installed via npm
import { GoogleGenerativeAI } from '@google/generative-ai'; 

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
  
  // Command to set the docstring format
  let setFormatCommand = vscode.commands.registerCommand('extension.setDocstringFormat', async () => {
    const formats = ['Google', 'NumPy', 'Sphinx'];
    const selectedFormat = await vscode.window.showQuickPick(formats, { placeHolder: 'Select a default docstring format' });
    
    if (selectedFormat) {
      vscode.workspace.getConfiguration().update('autoDoc.docstringFormat', selectedFormat, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage(`Docstring format set to ${selectedFormat}`);
    }
  });

  // Command to generate the docstring for a selected method
  let generateDocstringCommand = vscode.commands.registerCommand('extension.generateDocstring', async () => {
    const editor = vscode.window.activeTextEditor;

    if (editor) {
      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);

      if (selectedText) {
        const docstringFormat = vscode.workspace.getConfiguration().get('autoDoc.docstringFormat');
        
        const response = await generateDocstring(selectedText, docstringFormat as string);
        
        if (response) {
          editor.edit(editBuilder => {
            editBuilder.insert(selection.end, `\n${response}`);
          });
        }
      } else {
        vscode.window.showErrorMessage('No method selected!');
      }
    }
  });

  context.subscriptions.push(setFormatCommand);
  context.subscriptions.push(generateDocstringCommand);
}

// Function to call the Gemini Pro API
async function generateDocstring(methodCode: string, format: string): Promise<string | null> {
  try {
    const prompt = `Generate docstring for the following method in the ${format} format.\n${methodCode}`

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.log(error);
    vscode.window.showErrorMessage(`Error generating docstring: ${error}`);
    return null;
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
