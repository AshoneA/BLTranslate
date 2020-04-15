// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as ggTranslate from "@vitalets/google-translate-api";
import * as utils from "./utils/index";

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
  Object.keys(json).forEach((key) => {
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
        const KOPath = path.resolve(
          folderPath,
          "src/utils/locale/languageFiles/koKR/web-ko.json"
        );
        const VIPath = path.resolve(
          folderPath,
          "src/utils/locale/languageFiles/viVN/web-VN.json"
        );
        const CNJson = JSON.parse(fs.readFileSync(CNPath, "utf-8"));
        const languageType = [
          {
            path: ENPath,
            json: JSON.parse(fs.readFileSync(ENPath, "utf-8")),
            type: "en",
          },
          {
            path: KOPath,
            json: JSON.parse(fs.readFileSync(KOPath, "utf-8")),
            type: "ko",
          },
          {
            path: VIPath,
            json: JSON.parse(fs.readFileSync(VIPath, "utf-8")),
            type: "vi",
          },
        ];
        if (!Object.values(CNJson).includes(text)) {
          Promise.all(
            languageType.map((language) =>
              ggTranslate(text, { to: language.type, tld: "cn", client: "gtx" })
            )
          ).then((res: { text: string }[]) => {
            res.forEach((data: { text: string }, index: number) => {
              const { text: TranslateText } = data;
              writeJsonToFile(CNPath, generateJson(CNJson, text));
              writeJsonToFile(
                languageType[index].path,
                generateJson(languageType[index].json, TranslateText)
              );
              vscode.window.showInformationMessage("翻译成功!");
            });
          });
        } else {
          vscode.window.showInformationMessage("已存在该文本!");
        }
      });
  } catch (error) {}
};

const handleAppFormat = (_text: string) => {
  let text = _text;
  if (
    (text.startsWith("'") && text.endsWith("'")) ||
    (text.startsWith('"') && text.endsWith('"'))
  ) {
    text = _text.slice(1, -1);
  }
  const folderPath = vscode.workspace.rootPath || "";
  const i18nDir = path.resolve(folderPath, "app/constants/translations");
  let textKey = "";
  const files = fs.readdirSync(i18nDir);
  files.forEach((file) => {
    if (/zh*/.test(file)) {
      const json = JSON.parse(
        fs.readFileSync(path.resolve(i18nDir, file), "utf-8")
      );
      Object.keys(json).some((t) => {
        if (json[t] === text) {
          textKey = t;
          return true;
        }
        return false;
      });
    }
  });
  // project haven't translate
  if (!textKey) {
    const { i18nKey } = utils.getCustomConfig();
    const CNPath = path.resolve(i18nDir, `zh-${i18nKey}.json`);
    const CNJson = JSON.parse(fs.readFileSync(CNPath, "utf-8"));
    const ENPath = path.resolve(i18nDir, `en-${i18nKey}.json`);
    const KOPath = path.resolve(i18nDir, `ko-${i18nKey}.json`);
    const VIPath = path.resolve(i18nDir, `vi-${i18nKey}.json`);
    const languageType = [
      {
        path: ENPath,
        json: JSON.parse(fs.readFileSync(ENPath, "utf-8")),
        type: "en",
      },
      {
        path: KOPath,
        json: JSON.parse(fs.readFileSync(KOPath, "utf-8")),
        type: "ko",
      },
      {
        path: VIPath,
        json: JSON.parse(fs.readFileSync(VIPath, "utf-8")),
        type: "vi",
      },
    ];
    const maxKey = Math.max(
      ...Object.keys(CNJson).map((key: string) =>
        parseInt(key.replace(`key${i18nKey}-`, ""))
      )
    );
    textKey = `key${i18nKey}-${maxKey + 1}`;
    Promise.all(
      languageType.map((language) =>
        ggTranslate(text, { to: language.type, tld: "cn" })
      )
    ).then((res: { text: string }[]) => {
      res.forEach((data: { text: string }, index: number) => {
        const { text: TranslateText } = data;
        writeJsonToFile(CNPath, {
          ...CNJson,
          [textKey]: text,
        });
        writeJsonToFile(languageType[index].path, {
          ...languageType[index].json,
          [textKey]: TranslateText,
        });
      });
      vscode.window.showInformationMessage("翻译成功!");
    });
  }
  return textKey;
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
      const pkg = utils.getPkgInfo();
      let replaceText = "";
      if (pkg.name === "gc_native") {
        const appTranslateKey = handleAppFormat(text);
        const matchs = text.match(/(\${[^\${}]*})/g);
        if (matchs) {
          replaceText = `i18nConfigGlobal.w('${appTranslateKey}', {${matchs
            .map((v) => v.slice(2, -1))
            .join(", ")}})`;
        } else {
          replaceText = `i18nConfigGlobal.t('${appTranslateKey}')`;
        }
      } else {
        if (text.startsWith("{") && text.endsWith("}")) {
          replaceText = `<FormattedMessage defaultMessage=${text} />`;
        } else {
          replaceText = `<FormattedMessage defaultMessage={'${text}'} />`;
        }
        formatI18n(text);
      }
      TextEditorEdit.replace(selection, replaceText);
      vscode.window.showInformationMessage("Format成功!");
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
