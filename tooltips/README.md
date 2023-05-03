# Relume Tooltips Script

This script is included in all of the tooltip components from [Relume Library's UI Elements](https://library.relume.io/ui-elements?ui-elements-categories=all). It adds 2 features:

1. Flip the tooltip to the opposite direction, to keep it within the viewport:

[Screencast from 2023-04-06 10-14-10.webm](https://user-images.githubusercontent.com/6022042/230241244-70c6fad0-af31-4608-b6a3-e135b64c6909.webm)

2. Slide the tooltip along the perpendicular axis, to keep it within the viewport:

[Screencast from 2023-04-06 10-16-40.webm](https://user-images.githubusercontent.com/6022042/230241536-adb972a1-fce3-4ed7-91b2-eef2a9877fbd.webm)

## Building

```
npx uglify-js --mangle --compress -- tooltips.js
```
