# FemtoSurvey (prototype)

A minimal survey application using [surveyjs/survey-library](https://github.com/surveyjs/survey-library) and [jspreadsheet/ce](https://github.com/jspreadsheet/ce), etc..,a great libraries.

## Features
- Spreadsheet widgets (tabular and matrix) included
- a minimal form builder Included. (Only MIT licensed libraries are used.)

## Install

1. Install Amplify CLI
```
$ npm install -g @aws-amplify/cli

```

2. Git clone & Create Amplify AWS Profile
```
$ git clone https://github.com/hide212131/FemtoSurvey.git 
$ cd FemtoSurvey
$ amplify configure
$ npm install
```

3. Deploy and adding configure
```
$ amplify publish
```

From the AWS Amplify console, go to "rewrites and redirects" in your app, click edit, select open text editor, and add the following code

(See: [Redirects for single page web apps (SPA)](https://docs.aws.amazon.com/ja_jp/amplify/latest/userguide/redirects.html))
```
[
    {
        "source": "</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>",
        "target": "/index.html",
        "status": "200",
        "condition": null
    }
]
```

From the AWS AppSync console, open the "Schema" of your app, click on "Edit Schema" and add the access restriction of ` @aws_api_key @aws_cognito_user_pools` as shown below.

```
type ModelSurveyInputConnection @aws_api_key @aws_cognito_user_pools {
type ModelSurveyFormConnection @aws_api_key @aws_cognito_user_pools {
```

## Usage

The procedure for using FemtoSurvey is in the following three steps.
1. Create a new survey
2. Answer Survey
3. View Survey Results

### 1. Create a new survey

FemtoSurvey provides the ability to create a minimal survey that is written using JSON format strings.
(If you want to create a richer survey, we recommend you purchase a license to use SurveyJS.)

To create a new survey, follow the steps below:

1. Click "Create New Survey" from the left menu.
2. Write the title and description.
3. Fill in the question content, select the widget type, and then click the "+" button to add the question. The details of each widget are described below.
4. Added question is a widget's template. Click "pen" type icon and open an editor window containing JSON difinition. 
    Edit the JSON. Make sure that the input in JSON format is valid by having the widget show up in the preview screen.
    The JSON property `name` of each widget needs to be carefully edited. It has to be unique. It is also better to use a name that is easy to understand so that you can refer to it later.
5. Press the button "CREATE SURVEY". That's it!
6. 2 access keys will be displayed." Input Key" and "Result Key". This is a secret keyword (Capability URL) that should be shared only with the person you want to show the information to.
  - INPUT KEY. This is a key that you should only share with people who can answer your survey.
  - RESULT KEY: This is the key to tell only those who can see the survey list.
7. Give the key to the members via chat or email. When doing so, look carefully at the characters in the URL (`/input/` and `/result/`) to make sure that the wrong key is not passed.

#### Exporting and importing forms
You can share the form you have created with others who want to create a similar form. Press the pull-down next to the "Create Survey" button, select "Export Form", and press it to download the json file. Give this file to the person you want. Once you receive the json file, you can drag and drop it into the form window to import the form contents.

### 2. Answer Survey
Those who receive the "Input Key" will be able to answer the survey.
Please fill out the survey and click the "COMPLATE" button.

### 3. View Survey Results
Those who receive the "Result Key" will be able to see the aggregated survey.
Click the "DOWNLOAD" button to download the file in Excel format.

### widgets
Femto Survey allows you to use the basic widgets found in [surveyjs/survey-library](https://github.com/surveyjs/survey-library).
We have also added a few useful widgets.

See the example directory for details.

#### TextField, MultilineText, RadioGroup, Dropdown, Checkbox, Yes/No 
A built-in widget for the SurveyJS library. See  Visit [SurveyJS Examples](https://surveyjs.io/Examples/Library?id=questiontype-text&platform=Reactjs&theme=modern#content-js) and select the JavaScript tab, you will see a json entry for reference. 

#### Select2, Tagbox
A rich select box that can narrow down the candidate choices by partial matching and categorize many choices. Use this instead of a Dropdown (TagBox is for multiple selections and is equivalent to checkbox.). Select2/Tagbox will not use the `choice` property in Dropbox, but will use the `choice2` property instead. For that property, combine `group` and `value` and set the list entry to something like `{"value": "Nissan", "group", "Japan"}`.

#### Table, Spreadsheet

You can use JSpreadSheet to create a "table" with columns having header titles, or a "spreadsheet" without header titles. 

See visit [JSpreadsheet's Getting Started](https://bossanova.uk/jspreadsheet/v4/docs/getting-started) and use the `jspreadsheetProperties` property and set it.

The Table widget maps the json data in the table structure to a single answer item, so when you look at the resulting data table (rows: list of responses, columns: each response item), you will see the embedded json data in a single column. If you want to aggregate the contents of the embedded table data, you will have to use a BI tool (such as PowerQuery) that allows you to drill down into the json data.

## License

MIT License

This software includes the work that is distributed in the Apache License 2.0.
