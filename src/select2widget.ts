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
    activatedBy: "property",
    name: "select2",
    widgetIsLoaded: function () {
      return typeof $ == "function" && !!$.fn.select2;
    },
    isFit: function (question: Survey.Question) {
      if (widget.activatedBy == "property")
        return (
          question["renderAs"] === "select2" &&
          question.getType() === "dropdown"
        );
      if (widget.activatedBy == "type")
        return question.getType() === "dropdown";
      if (widget.activatedBy == "customtype")
        return question.getType() === "select2";
      return false;
    },
    activatedByChanged: function (activatedBy: string) {
      if (!this.widgetIsLoaded()) return;
      widget.activatedBy = activatedBy;
      Survey.JsonObject.metaData.removeProperty("dropdown", "renderAs");
      if (activatedBy == "property") {
        Survey.JsonObject.metaData.addProperty("dropdown", {
          name: "renderAs",
          category: "general",
          default: "default",
          choices: ["select2", "default"],
        });
        Survey.JsonObject.metaData.addProperty("dropdown", {
          dependsOn: "renderAs",
          category: "general",
          name: "select2Config",
          visibleIf: function (obj: any) {
            return obj.renderAs == "select2";
          },
        });
        Survey.JsonObject.metaData.addProperty("dropdown", {
          dependsOn: "renderAs",
          category: "general",
          name: "choices2",
          visibleIf: function (obj: any) {
            return obj.renderAs == "select2";
          },
        });
      }
      if (activatedBy == "customtype") {
        Survey.JsonObject.metaData.addClass("select2", [], null, "dropdown");
        Survey.JsonObject.metaData.addProperty("select2", {
          name: "select2Config",
          category: "general",
          default: null,
        });
        Survey.JsonObject.metaData.addProperty("select2", {
          name: "choices2",
          category: "general",
          default: null,
        });
      }
    },
    htmlTemplate:
      "<div><select style='width: 100%;'></select><textarea></textarea></div>",
    afterRender: function (question: Survey.Question, el: any) {
      var select2Config = question.select2Config;
      var settings =
        select2Config && typeof select2Config == "string"
          ? JSON.parse(select2Config)
          : select2Config;
      if (!settings) settings = {};
      var $el = $(el).is("select") ? $(el) : $(el).find("select");
      var $otherElement = $(el).find("textarea");
      $otherElement.addClass(question.cssClasses.other);
      $otherElement.bind("input propertychange", function () {
        if (isSettingValue) return;
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
      var isSettingValue = false;
      var updateValueHandler = function () {
        if (isSettingValue) return;
        isSettingValue = true;
        if ($el.find("option[value='" + (question.value || "") + "']").length) {
          $el.val(question.value).trigger("change");
        } else {
          if (question.value !== null && question.value !== undefined) {
            var newOption = new Option(
              question.value, //TODO if question value is object then need to improve
              question.value,
              true,
              true
            );
            $el.append(newOption).trigger("change");
          }
        }
        updateComment();
        isSettingValue = false;
      };
      var updateChoices = function () {
        $el.select2().empty();
        if (!settings.placeholder && question.showOptionsCaption) {
          settings.placeholder = question.optionsCaption;
          settings.allowClear = true;
        }
        if (!settings.theme) {
          settings.theme = "classic";
        }
        settings.disabled = question.isReadOnly;
        if (settings.ajax) {
          $el.select2(settings);
          question.keepIncorrectValues = true;
        } else {
          const data: Select2Data[] = [];
          if (!!settings.placeholder || question.showOptionsCaption) {
            data.push({ id: "", text: "" });
          }

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
          question.clearIncorrectValues();
          $el.select2(settings);
          question.choices = choices;
        }
        // fixed width accrording to https://stackoverflow.com/questions/45276778/select2-not-responsive-width-larger-than-container
        if (!!el.querySelector(".select2")) {
          el.querySelector(".select2").style.width = "100%";
        }
        if (!!el.nextElementSibling) {
          el.nextElementSibling.style.marginBottom = "1px";
        }
        updateValueHandler();
      };

      $otherElement.prop("disabled", question.isReadOnly);
      question.readOnlyChangedCallback = function () {
        $el.prop("disabled", question.isReadOnly);
        $otherElement.prop("disabled", question.isReadOnly);
      };

      question.registerFunctionOnPropertyValueChanged(
        "visibleChoices",
        function () {
          updateChoices();
        }
      );
      updateChoices();
      $el.on("change", function (e: any) {
        setTimeout(function () {
          question.renderedValue = e.target.value;
          updateComment();
        }, 1);
      });
      $el.on("select2:select", function (e: any) {
        setTimeout(function () {
          question.renderedValue = e.target.value;
          updateComment();
        }, 1);
      });
      $el.on("select2:opening", (e: any) => {
        if ($(this).data("unselecting")) {
          $(this).removeData("unselecting");
          e.preventDefault();
        }
      });
      $el.on("select2:unselecting", (e: any) => {
        $(this).data("unselecting", true);
        setTimeout(function () {
          question.renderedValue = null;
          updateComment();
        }, 1);
      });
      question.valueChangedCallback = updateValueHandler;
      updateValueHandler();
    },
    willUnmount: function (question: any, el: any) {
      question.readOnlyChangedCallback = null;
      question.valueChangedCallback = null;
      var $select2 = $(el).find("select");
      if (!!$select2.data("select2")) {
        $select2
          .off("select2:select")
          .off("select2:unselecting")
          .off("select2:opening")
          .select2("destroy");
      }
    },
  };

  Survey.CustomWidgetCollection.Instance.addCustomWidget(widget);
}

if (typeof Survey !== "undefined") {
  init(Survey, window.$);
}

export default init;
