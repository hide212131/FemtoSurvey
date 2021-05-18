import * as Survey from "survey-react";
const jspreadsheet = require("jspreadsheet-ce");

var widget = {
  //the widget name. It should be unique and written in lowcase.
  name: "spreadsheet",
  //the widget title. It is how it will appear on the toolbox of the SurveyJS Editor/Builder
  title: "Jspreadsheet wedget",
  //the name of the icon on the toolbox. We will leave it empty to use the standard one
  iconName: "",
  //If the widgets depends on third-party library(s) then here you may check if this library(s) is loaded
  widgetIsLoaded: function () {
    //return typeof $ == "function" && !!$.fn.select2; //return true if jQuery and select2 widget are loaded on the page
    return true; //we do not require anything so we just return true.
  },
  //SurveyJS library calls this function for every question to check, if it should use this widget instead of default rendering/behavior
  isFit: function (question: Survey.Question) {
    //we return true if the type of question is spreadsheet
    return question.getType() === "spreadsheet";
    //the following code will activate the widget for a text question with inputType equals to date
    //return question.getType() === 'text' && question.inputType === "date";
  },
  //Use this function to create a new class or add new properties or remove unneeded properties from your widget
  //activatedBy tells how your widget has been activated by: property, type or customType
  //property - it means that it will activated if a property of the existing question type is set to particular value, for example inputType = "date"
  //type - you are changing the behaviour of entire question type. For example render radiogroup question differently, have a fancy radio buttons
  //customType - you are creating a new type, like in our example "spreadsheet"

  activatedByChanged: function (activatedBy: string) {
    //we do not need to check acticatedBy parameter, since we will use our widget for customType only
    //We are creating a new class and derived it from text question type. It means that text model (properties and fuctions) will be available to us
    //signaturepad is derived from "empty" class - basic question class
    //Survey.JsonObject.metaData.addClass("signaturepad", [], null, "empty");
    Survey.JsonObject.metaData.addClass("spreadsheet", [], undefined, "empty");

    //Add new property(s)
    //For more information go to https://surveyjs.io/Examples/Builder/?id=addproperties#content-docs/
    Survey.JsonObject.metaData.addProperties("spreadsheet", [
      { name: "jspreadsheetProperties" },
    ]);
  },

  //If you want to use the default question rendering then set this property to true. We do not need any default rendering, we will use our our htmlTemplate
  isDefaultRender: false,
  //You should use it if your set the isDefaultRender to false
  htmlTemplate: "<div></div>",
  //The main function, rendering and two-way binding
  afterRender: function (question: Survey.Question, el: any) {
    const properties = question["jspreadsheetProperties"];
    const jss = jspreadsheet(el, {
      ...properties,
      data: properties.data === undefined ? [[]] : properties.data,
    });

    jss.options.onchange = () => {
      question.value = jss.getJson();
    };

    question.valueChangedCallback = () => {
      jss.setData(question.value);
    };

    // initialize
    question.valueChangedCallback();
  },
  //Use it to destroy the widget. It is typically needed by jQuery widgets
  willUnmount: function (question: Survey.IQuestion, el: any) {
    //We do not need to clear anything in our simple example
    //Here is the example to destroy the image picker
    //var $el = $(el).find("select");
    //$el.data('picker').destroy();
  },
};

//Register our widget in singleton custom widget collection
Survey.CustomWidgetCollection.Instance.addCustomWidget(widget, "customtype");
