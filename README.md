# translate extension for blacklake
## right click  to BLTranslate or command + i (ctrl + i )

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

## your can only do translate by right click `BLi18n`