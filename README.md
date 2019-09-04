# translate extension for blacklake
## right click  to BLTranslate or `cmd+i` (ctrl + i )

selected text like `text` will translate to <FormattedMessage `defaultMessage={'text'}>`

selected text like `{text}` will translate to `<FormattedMessage defaultMessage={text}>`

## auto translate to web-en.json and web-cn.json file
if you project has a file named is .bl-custom.json, file content like 
```
  {
    "i18nKey": "0" // your i18n key
  }
```
the file will be ignored

## you can only translate by right click `BLi18n` or `cmd+shift+i` after select text