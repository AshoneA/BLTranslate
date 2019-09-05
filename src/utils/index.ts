import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export const getPkgInfo = () => {
  const folderPath = vscode.workspace.rootPath || "";
  const pkgPath = path.resolve(folderPath, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  console.log("pkg", pkg);
  return pkg;
};

export const getCustomConfig = (): { i18nKey: string } => {
  const folderPath = vscode.workspace.rootPath;
  const customeConfig = require(folderPath + "/.bl-custom.json");
  return customeConfig;
};
