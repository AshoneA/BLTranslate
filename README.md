# translate extension for blacklake
## right click  to BLTranslate or `cmd+i` (ctrl + i )

## Start

###   you project should have a file named is .bl-custom.json, file content like 
```
  {
    "i18nKey": "0" // your i18n key
  }
```
the file should be ignored

## For Web

right click  to BLTranslate or `cmd+i` (ctrl + i )  
selected text like `text` will translate to <FormattedMessage `defaultMessage={'text'}>`, selected text like `{text}` will translate to `<FormattedMessage defaultMessage={text}>`. in the meantime , select text will auto translate to web-en.json and web-cn.json file.

you can only translate by right click `BLi18n` or `cmd+shift+i` after select text for auto translate to web-en.json and web-cn.json file

## For App

right click  to BLTranslate or `cmd+i` (ctrl + i )  
selected text like `你好` will formatted to `i18nConfigGlobal.t('${appTranslateKey}')`, the extension will find the word in all language file. if it exists,  appTranslateKey is the word key, if not , it will write a new word key to corresponding files first.  
like ``` `${user}, 你好` ``` will be formatted to `i18nConfigGlobal.w('${appTranslateKey}', { user })` with the default param `user` put in already.

