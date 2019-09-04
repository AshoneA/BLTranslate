// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as ggTranslate from "@vitalets/google-translate-api";

interface JsonObj {
  [key: string]: string;
}

const generateJson = (json: JsonObj, text: string) => {
  const obj: JsonObj = {};
  const folderPath = vscode.workspace.rootPath;
  let maxKey = 0;
  let baseRegex: RegExp;
  const customeConfig = require(folderPath + "/.bl-custom.json");
  const { i18nKey } = customeConfig;
  baseRegex = RegExp(`^key-${i18nKey}-\\d+`);
  maxKey = Math.max(
    ...Object.keys(json).map((key: string) => {
      if (baseRegex.test(key)) {
        return parseInt(key.replace(`key-${i18nKey}-`, ""));
      }
      return 0;
    })
  );
  Object.keys(json).forEach(key => {
    obj[key] = json[key];
    if (key === `key-${i18nKey}-${maxKey}`) {
      obj[`key-${i18nKey}-${maxKey + 1}`] = text;
    }
  });
  return obj;
};

const writeJsonToFile = (path: string, json: Object) => {
  fs.writeFile(path, JSON.stringify(json, null, 2), (err: any) => {
    if (err) {
      console.log(err);
    }
  });
};

const formatI18n = (text: string) => {
  // get root path
  const folderPath = vscode.workspace.rootPath || "";
  try {
    vscode.workspace.fs
      .readFile(vscode.Uri.file(folderPath + "/.bl-custom.json"))
      .then(async () => {
        const CNPath = path.resolve(
          folderPath,
          "src/utils/locale/languageFiles/zhCN/web-cn.json"
        );
        const ENPath = path.resolve(
          folderPath,
          "src/utils/locale/languageFiles/enUS/web-en.json"
        );
        const CNJson = JSON.parse(fs.readFileSync(CNPath, 'utf-8'));
        const ENJson = JSON.parse(fs.readFileSync(ENPath, 'utf-8'));
        if (!Object.values(CNJson).includes(text)) {
          ggTranslate(text, { to: "en", tld: "cn" }).then(
            (res: { text: string }) => {
              const { text: ENText } = res;
              writeJsonToFile(CNPath, generateJson(CNJson, text));
              writeJsonToFile(ENPath, generateJson(ENJson, ENText));
              vscode.window.showInformationMessage("翻译成功!");
            }
          );
        } else {
          vscode.window.showInformationMessage("已存在该文本!");
        }
      });
  } catch (error) {}
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "vscode-translate" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerTextEditorCommand(
    "extension.BLTranslate",
    (TextEditor, TextEditorEdit) => {
      // The code you place here will be executed every time your command is executed
      const selection = TextEditor.selections[0];
      const text = TextEditor.document.getText(selection);
      let replaceText = "";
      if (text.startsWith("{") && text.endsWith("}")) {
        replaceText = `<FormattedMessage defaultMessage=${text} />`;
      } else {
        replaceText = `<FormattedMessage defaultMessage={'${text}'} />`;
      }
      TextEditorEdit.replace(selection, replaceText);
      vscode.window.showInformationMessage("Format成功!");
      formatI18n(text);
    }
  );

  let disposable2 = vscode.commands.registerTextEditorCommand(
    "extension.BLi18n",
    (TextEditor, TextEditorEdit) => {
      // The code you place here will be executed every time your command is executed
      const selection = TextEditor.selections[0];
      const text = TextEditor.document.getText(selection);
      formatI18n(text);
    }
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(disposable2);
}

// this method is called when your extension is deactivated
export function deactivate() {}
