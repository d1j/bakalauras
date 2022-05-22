const USER_API_URL = "http://localhost:8000";

function getFormData($form) {
  var unindexed_array = $form.serializeArray();
  var indexed_array = {};

  $.map(unindexed_array, function (n, i) {
    indexed_array[n["name"]] = n["value"];
  });

  return indexed_array;
}

var testScrapeAttribs = localStorage.getItem("testScrapeAttribs") || 1;
var commandAttribs = localStorage.getItem("commandAttribs") || 1;

function getAttribInputTemplate(groupName, num) {
  return `<div class="input-group">
                <input type="text" class="form-control" id="${groupName}-attribute-${num}" name="attr-${num}" placeholder="attr=value" required/>
                <i class="btn input-group-addon delete-field ${groupName} bi bi-dash-circle"></i>
            </div>`;
}

function appendAttribsOnInit(groupName, totalNumAttribs) {
  for (let i = 2; i <= totalNumAttribs; i++) {
    let inputTemplate = getAttribInputTemplate(groupName, i);
    $(inputTemplate).insertBefore(`.${groupName}.help-block`);
  }
}

function showPasswordToggle() {
  let pswd_id = this.id.substr(0, this.id.lastIndexOf("-"));
  let x = document.getElementById(pswd_id);
  x.type = x.type === "password" ? "text" : "password";
}

function toggleValueAttributes(groupName, option) {
  if (option === "tag_attributes") {
    valueId = `#${groupName}-value-group`;
    $(`${valueId} :input`).attr("disabled", true);
    $(valueId).hide();

    attrId = `#${groupName}-attributes-group`;
    $(`${attrId} :input`).attr("disabled", false);
    $(attrId).show();
  } else {
    valueId = `#${groupName}-value-group`;
    $(`${valueId} :input`).attr("disabled", false);
    $(valueId).show();

    attrId = `#${groupName}-attributes-group`;
    $(`${attrId} :input`).attr("disabled", true);
    $(attrId).hide();
  }
}

const getGroupNameFromID = (targetedElement) => {
  return targetedElement.id.substr(0, targetedElement.id.indexOf("-"));
};

$(document).ready(function () {
  ["scr_command", "scr_test_scrape"].forEach((groupName) => {
    toggleValueAttributes(groupName, localStorage.getItem(`${groupName}-option`));
  });

  $(".scr_err-msg, .scr_success-msg").each(function () {
    $(this).hide();
  });

  let username = localStorage.getItem("username");
  usernameText = username ? `Logged in as: ${username}` : "Welcome! Log in";
  $("#scr_login-status-username").text(usernameText);

  $("#scr_login-password-check, #scr_register-password-check").click(showPasswordToggle);

  $("#scr_command-option, #scr_test_scrape-option").change(function () {
    let groupName = getGroupNameFromID(this);
    toggleValueAttributes(groupName, $(this).val());
  });

  if (testScrapeAttribs > 1) {
    appendAttribsOnInit("scr_test_scrape", testScrapeAttribs);
  }
  if (commandAttribs > 1) {
    appendAttribsOnInit("scr_command", commandAttribs);
  }

  $(".add-field").click(function () {
    let groupName = this.id.substr(0, this.id.indexOf("-"));
    let numAttribs = null;
    switch (groupName) {
      case "scr_command":
        if (commandAttribs > 9) return;
        localStorage.setItem("commandAttribs", ++commandAttribs);
        break;
      case "scr_test_scrape":
        if (testScrapeAttribs > 9) return;
        localStorage.setItem("testScrapeAttribs", ++testScrapeAttribs);
        break;
    }
    let inputTemplate = getAttribInputTemplate(groupName, numAttribs);
    $(inputTemplate).insertBefore(`.${groupName}.help-block`);
  });

  $(".fields").on("click", ".delete-field", function (e) {
    if ($(e.target).hasClass("scr_test_scrape")) {
      localStorage.setItem("testScrapeAttribs", --testScrapeAttribs);
    } else if ($(e.target).hasClass("scr_command")) {
      localStorage.setItem("commandAttribs", --commandAttribs);
    }
    $(this).parent().remove();
  });

  ["input", "select"].forEach((tag) => {
    $(tag).each(function () {
      $(this).val(localStorage.getItem(this.id));
    });

    $(tag).change(function () {
      localStorage.setItem([this.id], this.value);
    });
  });

  $("#scr_test_scrape-current-url, #scr_schedule-current-url").click(function () {
    groupName = getGroupNameFromID(this);
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      $(`#${groupName}-url`).val(tabs[0].url);
    });
  });

  $("#src_logout-button").click(function () {
    $(".delete-field").click();

    ["scr_command", "scr_test_scrape"].forEach((groupName) => {
      toggleValueAttributes(groupName, "xpath");
    });

    localStorage.clear();
    $("form").each(function () {
      $(this).trigger("reset");
    });
    $("#scr_login-status-username").text("Welcome! Log in");
  });

  const handleFormFail = (groupName) => {
    return (data) => {
      if (data.status === 400) {
        err_data = data.responseJSON;
        for (const [key, value] of Object.entries(data.responseJSON)) {
          obj = $(`#${groupName}-err-msg-${key}`);
          obj.text(value[0]);
          obj.show();
        }
      }
    };
  };

  const getFullURL = ($targetedForm) => {
    path = $targetedForm.attr("action");
    return USER_API_URL + path;
  };

  const hideMessages = (groupName) => {
    $(`.${groupName}-err-msg, #${groupName}-err-msg`).each(function () {
      $(this).text("");
      $(this).hide();
    });
    $(`#${groupName}-success-msg`).each(function () {
      $(this).hide();
    });
  };

  const sendRequest = (url, formData, groupName) => {
    $.post(url, formData)
      .done(function (data) {
        $(`#${groupName}-success-msg`).each(function () {
          $(this).show();
        });
      })
      .fail(handleFormFail(groupName));
  };

  $("#scr_register-form").submit(function (e) {
    e.preventDefault();
    let formData = getFormData($(this));
    formData["password2"] = formData["password"];
    let url = getFullURL($(this));
    let groupName = getGroupNameFromID(this);
    hideMessages(groupName);
    sendRequest(url, formData, groupName);
    return false;
  });

  $("#scr_login-form").submit(function (e) {
    e.preventDefault();
    let formData = getFormData($(this));
    let url = getFullURL($(this));
    let groupName = getGroupNameFromID(this);
    hideMessages(groupName);
    $.post(url, formData)
      .done(function (data) {
        $(`#${groupName}-success-msg`).each(function () {
          $(this).show();
        });
        for (const [key, value] of Object.entries(data)) {
          localStorage.setItem([key], value);
        }
        localStorage.setItem("username", formData["username"]);
        $("#scr_login-status-username").text(`Logged in as: ${formData["username"]}`);
      })
      .fail(function (data) {
        obj = $(`#${groupName}-err-msg`);
        obj.text(data.responseJSON["detail"]);
        obj.show();
      });
    return false;
  });

  const sendCreateRequest = (url, formData, token, groupName, entity) => {
    $.ajax({
      url,
      type: "POST",
      data: JSON.stringify(formData),
      dataType: "json",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    })
      .done(function (data) {
        $(`#${groupName}-success-msg`).each(function () {
          $(this).html(`${entity} created. ${entity} ID: <b>${data.id}</b>`);
          $(this).show();
        });
      })
      .fail(function (data) {
        console.log(data);
        obj = $(`#${groupName}-err-msg`);
        obj.text("Unexpected error occurred. Try again later.");
        obj.show();
      });
  };

  $("#scr_schedule-form").submit(function (e) {
    e.preventDefault();
    let formData = getFormData($(this));
    formData.active = $("#scr_schedule-activate").is(":checked");
    if (formData.description.replace(/\s/g, "") === "") delete formData.description;
    try {
      formData.start_date = new Date(formData.start_date).toISOString();
    } catch (err) {
      formData.start_date = new Date().toISOString();
    }

    let url = getFullURL($(this));
    let groupName = getGroupNameFromID(this);
    let token = localStorage.getItem("access");
    hideMessages(groupName);
    sendCreateRequest(url, formData, token, groupName, "Schedule");
    return false;
  });

  const processFormValue = (formData) => {
    if (formData.option == "tag_attributes") {
      formData.value = {};
      for (const [key, value] of Object.entries(formData)) {
        if (key.startsWith("attr")) {
          // https://stackoverflow.com/questions/4607745/split-string-only-on-first-instance-of-specified-character
          const [attr, ...rest] = value.split("=");
          const attr_value = rest.join("=");
          formData.value[attr] = attr_value;
          delete formData[key];
        }
      }
      formData.value = JSON.stringify(formData.value);
    } else {
      for (const [key, value] of Object.entries(formData)) {
        if (key.startsWith("attr")) {
          delete formData[key];
        }
      }
    }
  };

  $("#scr_command-form").submit(function (e) {
    e.preventDefault();
    let formData = getFormData($(this));
    formData.active = $("#scr_schedule-activate").is(":checked");
    if (formData.description.replace(/\s/g, "") === "") delete formData.description;
    processFormValue(formData);
    formData.html_scrape_schedule = +formData.html_scrape_schedule;
    let url = getFullURL($(this));
    let groupName = getGroupNameFromID(this);
    let token = localStorage.getItem("access");
    hideMessages(groupName);
    sendCreateRequest(url, formData, token, groupName, "Command");
    return false;
  });

  $("#scr_test_scrape-form").submit(function (e) {
    e.preventDefault();
    let formData = getFormData($(this));
    processFormValue(formData);
    let sendData = {
      url: formData.url,
      commands: [
        {
          command_id: 1,
          option: formData.option,
          value: formData.value,
        },
      ],
    };
    if (formData.html_tag) sendData.commands[0].html_tag = formData.html_tag;
    console.log(sendData);
    let url = getFullURL($(this));
    let groupName = getGroupNameFromID(this);
    let token = localStorage.getItem("access");
    hideMessages(groupName);
    $.ajax({
      url,
      type: "POST",
      data: JSON.stringify(sendData),
      dataType: "json",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    })
      .done(function (data) {
        $(`#${groupName}-success-msg`).each(function () {
          console.log(data);
          results = data["1"];
          if (results.success) {
            msg = "";
            if (results.result.length > 1) {
              msg = `Multiple values found: <b>${results.result}</b>`;
            } else {
              msg = `Found value: <b>${results.result}</b>`;
            }
            $(this).html(msg);
            $(this).show();
          } else {
            obj = $(`#${groupName}-err-msg`);
            obj.text(results.result[0]);
            obj.show();
          }
        });
      })
      .fail(function (data) {
        console.log(data);
        obj = $(`#${groupName}-err-msg`);
        obj.text("Unexpected error occurred. Try again later.");
        obj.show();
      });
    return false;
  });
});
