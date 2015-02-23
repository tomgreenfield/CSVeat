# CSVeat

Build an Adapt course structure from a CSV file.

## Installation

Note: requires [Node.js](http://nodejs.org) to be installed.

From the command line, run:
```
npm install -g csveat
```

## Usage

* The JSON will be written in the directory you run this command from:
```
csveat <file>
```

* A CSV should be exported from Excel in the following style, where co-05 is a sub-menu and co-10, co-15 & co-20 are pages:

 Course | Content Object | Content Object | Article | Block | Component | Type
 ------ | -------------- | -------------- | ------- | ----- | --------- | ----
 p101   | co-05          | co-10          | a-05    | b-05  | c-05      | text
        |                |                |         | b-10  | c-10      | graphic
        |                |                |         | b-15  | c-15      | hotgraphic
        |                | co-15          | a-10    | b-20  | c-20      | narrative
        |                |                |         | b-25  | c-25      | accordion
        |                |                |         |       | c-30      | blank
        |                |                | a-15    | b-30  | c-35      | media
        | co-20          |                | a-20    | b-35  | c-40      | mcqsingle
        |                |                |         |       | c-45      | mcqmultiple2
        |                |                |         | b-40  | c-50      | mcqmultiple1
        |                |                |         |       | c-55      | matching
        |                |                |         | b-45  | c-60      | textinput
        |                |                |         | b-50  | c-65      | gmcq
        |                |                |         | b-55  | c-70      | slider
* The first row needs to be the headers.
* You may have 1 to ∞ content object columns.
* Please see [here](https://github.com/tomgreenfield/AdaptHelper/tree/master/Snippets) for the snippets referenced. Use the tab triggers in the type column.