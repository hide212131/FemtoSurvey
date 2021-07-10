/* eslint-disable eqeqeq */
import * as Survey from "survey-react";

type Choice2 = { value: string; group: string } | string;
interface Select2Item {
  id: string;
  text: string;
}
interface Select2Group {
  text: string;
  children: Select2Item[];
}
type Select2Data = Select2Group | Select2Item;

function init(Survey: any, $: any | undefined) {
  $ = $ || window.$;
  var widget = {
    name: "tagbox",
    title: "Tag box",
    iconName: "icon-tagbox",
    widgetIsLoaded: function () {
      return typeof $ == "function" && !!$.fn.select2;
    },
    defaultJSON: {
      choices: ["Item 1", "Item 2", "Item 3"],
    },
    htmlTemplate:
      "<div><select multiple='multiple' style='width: 100%;'></select><textarea></textarea></div>",
    isFit: function (question: Survey.Question) {
      return question.getType() === "tagbox";
    },
    activatedByChanged: function (activatedBy: string) {
      Survey.JsonObject.metaData.addClass(
        "tagbox",
        [
          { name: "hasOther:boolean", visible: false },
          { name: "hasSelectAll:boolean", visible: false },
          { name: "hasNone:boolean", visible: false },
          { name: "otherText", visible: false },
          { name: "selectAllText", visible: false },
          { name: "noneText", visible: false },
        ],
        null,
        "checkbox"
      );
      Survey.JsonObject.metaData.addProperty("tagbox", {
        name: "select2Config",
        category: "general",
        default: null,
      });
      Survey.JsonObject.metaData.addProperty("tagbox", {
        name: "choices2",
        category: "general",
        default: null,
      });
      Survey.JsonObject.metaData.addProperty("tagbox", {
        name: "placeholder",
        category: "general",
        default: "",
      });
      Survey.JsonObject.metaData.addProperty("tagbox", {
        name: "allowAddNewTag:boolean",
        category: "general",
        default: false,
      });
      Survey.matrixDropdownColumnTypes.tagbox = {
        properties: [
          "choices",
          "choices2",
          "choicesOrder",
          "choicesByUrl",
          "optionsCaption",
          "otherText",
          "choicesVisibleIf",
        ],
      };
    },
    fixStyles: function (el: any) {
      el.parentElement.querySelector(".select2-search__field").style.border =
        "none";
    },
    afterRender: function (question: any, el: any) {
      var self = this;
      var select2Config = question.select2Config;
      var settings =
        select2Config && typeof select2Config == "string"
          ? JSON.parse(select2Config)
          : select2Config;
      var $el = $(el).is("select") ? $(el) : $(el).find("select");

      self.willUnmount(question, el);

      if (!settings) settings = {};
      settings.placeholder = question.placeholder;
      settings.tags = question.allowAddNewTag;
      settings.disabled = question.isReadOnly;
      settings.theme = "classic";
      if (!!question.maxSelectedChoices) {
        settings.maximumSelectionLength = question.maxSelectedChoices;
      }

      $el.select2(settings);

      var $otherElement = $(el).find("textarea");
      if (
        !!question.survey &&
        !!question.survey.css &&
        !!question.survey.css.checkbox
      ) {
        $otherElement.addClass(question.survey.css.checkbox.other);
      }
      $otherElement.placeholder = question.otherPlaceHolder;
      $otherElement.bind("input propertychange", function () {
        question.comment = $otherElement.val();
      });
      var updateComment = function () {
        $otherElement.val(question.comment);
        if (question.isOtherSelected) {
          $otherElement.show();
        } else {
          $otherElement.hide();
        }
      };

      self.fixStyles(el);
      // var question: any;
      var updateValueHandler = function () {
        if (question.hasSelectAll && question.isAllSelected) {
          $el
            .val([question.selectAllItemValue.value].concat(question.value))
            .trigger("change");
        } else {
          $el.val(question.value).trigger("change");
        }
        self.fixStyles(el);
        updateComment();
      };
      var updateChoices = function () {
        $el.select2().empty();
        if (settings.ajax) {
          $el.select2(settings);
        } else {
          const data: Select2Data[] = [];
          const choices: string[] = [];
          if (question.choices2) {
            const choices2: Choice2[] = question.choices2 as Choice2[];
            choices2.forEach((choice) => {
              if (typeof choice === "string") {
                const item: Select2Item = {
                  id: choice,
                  text: choice,
                };
                data.push(item);
                choices.push(item.id);
              } else {
                if (choice.group) {
                  const item: Select2Item = {
                    id: choice.value,
                    text: choice.value,
                  };

                  let group = data.find(
                    (d) => d.text === choice.group && "children" in d
                  ) as Select2Group;
                  if (!group) {
                    group = {
                      text: choice.group,
                      children: [],
                    };
                    data.push(group);
                  }
                  group.children.push(item);
                  choices.push(item.id);
                }
              }
            });
          }
          settings.data = data;
          $el.select2(settings);
          question.choices = choices;
        }
        updateValueHandler();
      };
      var isAllItemSelected = function (value: any) {
        return (
          question.hasSelectAll && value === question.selectAllItemValue.value
        );
      };
      question._propertyValueChangedFnSelect2 = function () {
        updateChoices();
      };

      $otherElement.prop("disabled", question.isReadOnly);
      question.readOnlyChangedCallback = function () {
        $el.prop("disabled", question.isReadOnly);
        $otherElement.prop("disabled", question.isReadOnly);
      };
      question.registerFunctionOnPropertyValueChanged(
        "visibleChoices",
        question._propertyValueChangedFnSelect2
      );
      question.valueChangedCallback = updateValueHandler;
      $el.on("select2:select", function (e: any) {
        if (isAllItemSelected(e.params.data.id)) {
          question.selectAll();
        } else {
          question.value = (question.value || []).concat(e.params.data.id);
        }
        updateComment();
      });
      $el.on("select2:unselect", function (e: any) {
        var index = (question.value || []).indexOf(e.params.data.id);
        if (isAllItemSelected(e.params.data.id)) {
          question.clearValue();
        } else if (index !== -1) {
          var val = [].concat(question.value);
          val.splice(index, 1);
          question.value = val;
        }
        updateComment();
      });
      updateChoices();
    },
    willUnmount: function (question: any, el: any) {
      if (!question._propertyValueChangedFnSelect2) return;

      var $select2 = $(el).find("select");
      if (!!$select2.data("select2")) {
        $select2.off("select2:select").select2("destroy");
      }
      question.readOnlyChangedCallback = null;
      question.valueChangedCallback = null;
      question.unRegisterFunctionOnPropertyValueChanged(
        "visibleChoices",
        question._propertyValueChangedFnSelect2
      );
      question._propertyValueChangedFnSelect2 = undefined;
    },
    pdfQuestionType: "checkbox",
  };

  Survey.CustomWidgetCollection.Instance.addCustomWidget(widget, "customtype");
}

if (typeof Survey !== "undefined") {
  init(Survey, window.$);
}

export default init;
