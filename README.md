# nTask
An open-source Progressive Web App, created for aim to use as 'Class Schedule". Powered by React, Dexie, jQuery.
![nTask Cover](https://raw.githubusercontent.com/aomkirby123/nTask/master/screenshot/cover.min.jpg)
Based on class schedule (as weekly task)

## Introduction
Written in HTML5, CSS3, JavaScript ES6 with React.js, and Dexie.js (Consumed as node module). Written as Progressive Web App with full offline support.

## Stucture
Structure for development

### Directory
Direcotry access

```
| nTask
|
|--| Public (Where index.html file can access)
|  |
|  |--| app (Service worker association)
|     | img
|     | js (JavaScript, in case of no React. Is deprecated)
|
|--| src (Where React association file can access)
   |
   |--| css (An css file for React to render)
      | fontawesome
      | fonts
      | img (Where React can access, some icons, and banner)
      | react-component (Where React extended class is located)
      | index.js (Main React file)
```
### React Access
React access map

```
| index.js
|
|--| react-component
   |
   |--| alert.js (Deprecated)
      | page.js (Where page is rendered) - Class: Page, Title
      | tabs-bar.js (Where tab bar is rendered) - Class: Tabs
      | update-container (Where update screen is rendered) - Class: Page, Title
```

### IndexedDB
Acess map of Indexed database

```
| dbnames (Generated DB of Dexie.js)
| mist (Where data is stored)
   | Task (Indexed: day, staticStart)
      | day: 0-6 (Based on week day)
      | displayTime: "StartTime ~ endTime"
      | id: ID of task
      | staticStart: Start Time - Use to determined if task is done of not
      | subject: Data of 
      | time
      |   | startHour
      |   | startMinute
      |   | endHour
      |   | endMinute
      | timeDiff: Display time diff
```

## Note
To beta tester: There's some microtransaction that doesn't supported in React version, yet!

## Developer note
As I said to myself, this is not the cleanest code at all, I have just used to with React then integrated an existed project to React, and this is the result of the consequence.
