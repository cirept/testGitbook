const AutofillReplacerTool = (function () {

  //https://sso.cdk.com/adfs/ls/idpinitiatedsignon.aspx
  //okta


  const autofillTagListURL = "https://raw.githubusercontent.com/cirept/autofillReplacer/master/assets/json/autofill_list.json";
  /* eslint-disable */
  const myStyles = GM_getResourceURL("toolStyles");
  const lastestChanges = GM_getResourceURL("changeLog");
  const toolInstructions = GM_getResourceURL("toolInstructions");
  /* eslint-enable */
  const webID = document.getElementById("_webId").value;
  const locale = document.getElementById("_locale").value;
  const defaultAutofillList = [{
      "autofillTag": "***How to Separate Words***",
      "searchTerms": "Separate words with --> ;"
    },
    {
      "autofillTag": "***Example***",
      "searchTerms": "*`*like*`*;*`*this*`*;*`*you*`*;*`*see*`*"
    },
    {
      "autofillTag": "%DEALER_NAME%",
      "searchTerms": "SEARCH_FOR_ME"
    },
    {
      "autofillTag": "%FRANCHISES%",
      "searchTerms": "SEARCH_FOR_ME"
    },
    {
      "autofillTag": "%STREET%",
      "searchTerms": "SEARCH_FOR_ME"
    },
    {
      "autofillTag": "%CITY%",
      "searchTerms": "SEARCH_FOR_ME"
    },
    {
      "autofillTag": "%STATE%",
      "searchTerms": "SEARCH_FOR_ME"
    },
    {
      "autofillTag": "%STATE_FULL_NAME%",
      "searchTerms": "SEARCH_FOR_ME"
    },
    {
      "autofillTag": "%ZIP%",
      "searchTerms": "SEARCH_FOR_ME"
    },
    {
      "autofillTag": "%PHONE%",
      "searchTerms": "SEARCH_FOR_ME"
    },
    {
      "autofillTag": "%NEW_PHONE%",
      "searchTerms": "SEARCH_FOR_ME"
    },
    {
      "autofillTag": "%USED_PHONE%",
      "searchTerms": "SEARCH_FOR_ME"
    },
    {
      "autofillTag": "%SERVICE_PHONE%",
      "searchTerms": "SEARCH_FOR_ME"
    },
    {
      "autofillTag": "%PARTS_PHONE%",
      "searchTerms": "SEARCH_FOR_ME"
    }
  ];
  const activeAutofillList = [];  // TODO fix all issue resulting from moving this to a its own object

  /**
   * Custom Tool Console Logging for debugging purposes
   * @param {string} message - Message to write to the console.
   * @param {object} obj - the object to display in the console message
   */
  function log(message, obj) {
    /* eslint-disable */
    if (obj) {
      // remove comment to enable console logs
      console.log(`Autofill Tool : ${message}`, obj);
    } else {
      console.log(`Autofill Tool : ${message}`);
    }
    /* eslint-enable */
  }

  /**
   * Custom Tool Console Logging for debugging purposes
   * @param {string} message - Message to write to the console.
   * @param {boolen} returnResolve - returns resolved
   * @return {object} if resolve is true, returns empty resolve
   */
  function log(message, returnResolve = false) {
    /* eslint-disable */
    if (returnResolve) {
      // remove comment to enable console logs
      console.log(`Autofill Tool : ${message}`);
      return Promise.resolve();
    } else {
      console.log(`Autofill Tool : ${message}`);
    }
    /* eslint-enable */
  }

  //
  // Tool Elements
  //

  const wsmEditorTools = document.createElement("div");
  const autofillOptionsContainer = document.createElement("div");
  const messageDisplay = document.createElement("div");
  const buttonOptions_row1 = document.createElement("div");
  const buttonOptions_row2 = document.createElement("div");
  const actionContainer = document.createElement("div");
  const listContainer = document.createElement("div");
  const autofillOptionsList = document.createElement("ul");
  const allAutofillsList = document.createElement("ul");
  const minimizeList_button = document.createElement("button");
  const defaultReset_button = document.createElement("button");
  const applyAutofills_button = document.createElement("button");
  const addAutofill_button = document.createElement("button");
  const changeLog_button = document.createElement("button");
  const instructions_button = document.createElement("button");
  const reportBug = document.createElement("a");
  const requestEnhancement = document.createElement("a");

  // wsm editor tools props
  wsmEditorTools.classList.add("customEditorTools");

  // autofill options container props
  autofillOptionsContainer.classList.add("autofillOptionsContainer");
  autofillOptionsContainer.classList.add("hide");

  // minimize list element props
  minimizeList_button.classList.add("minimizeList");
  minimizeList_button.classList.add("btn");
  minimizeList_button.classList.add("btn-sm");
  minimizeList_button.classList.add("btn-wd");
  minimizeList_button.classList.add("btn-autofill-tool");
  minimizeList_button.title = "show list";
  minimizeList_button.type = "button";
  minimizeList_button.innerHTML = "<i class='fas fa-eye fa-lg'></i>";

  // autofill options list props
  autofillOptionsList.id = "autofillOptions";
  autofillOptionsList.classList.add("autofillOptions");

  // message display props
  messageDisplay.id = "toolMessageDisplay";
  messageDisplay.classList.add("container-fluid");
  messageDisplay.textContent = `Autofill tag text replacer tool - version ${GM_info.script.version}`;

  // default reset button props
  defaultReset_button.id = "defaultReset";
  defaultReset_button.classList.add("btn");
  defaultReset_button.classList.add("btn-sm");
  defaultReset_button.classList.add("btn-danger");
  defaultReset_button.classList.add("m-1");
  defaultReset_button.classList.add("col");
  defaultReset_button.title = "Reset Values";
  defaultReset_button.innerHTML = "<i class='fas fa-redo fa-lg'></i>";

  // apply autofill button props
  applyAutofills_button.id = "applyAutofills";
  applyAutofills_button.classList.add("btn");
  applyAutofills_button.classList.add("btn-sm");
  applyAutofills_button.classList.add("btn-wd");
  applyAutofills_button.classList.add("btn-success");
  applyAutofills_button.type = "button";
  applyAutofills_button.title = "apply autofills";
  applyAutofills_button.innerHTML = "<i class='fas fa-magic fa-lg'></i>";

  // add button props
  addAutofill_button.id = "addAutofill";
  addAutofill_button.classList.add("btn");
  addAutofill_button.classList.add("btn-sm");
  addAutofill_button.classList.add("btn-autofill-tool");
  addAutofill_button.classList.add("m-1");
  addAutofill_button.classList.add("col");
  addAutofill_button.dataset.toggle = "modal";
  addAutofill_button.dataset.target = "#autofillListModal";
  addAutofill_button.value = "addAutofill";
  addAutofill_button.title = "Add Autofill";
  addAutofill_button.innerHTML = "<i class='fas fa-plus fa-lg'></i>";

  // change log button props
  changeLog_button.id = "viewLatestChanges";
  changeLog_button.classList.add("btn");
  changeLog_button.classList.add("btn-sm");
  changeLog_button.classList.add("btn-info");
  changeLog_button.classList.add("col");
  changeLog_button.classList.add("m-1");
  changeLog_button.dataset.toggle = "modal";
  changeLog_button.dataset.target = "#lastestChangesModal";
  changeLog_button.innerHTML = "<i class='fas fa-file-alt'></i>";
  changeLog_button.title = "Latest Changes";

  // report bug link props
  reportBug.id = "reportBug";
  reportBug.classList.add("btn");
  reportBug.classList.add("btn-sm");
  reportBug.classList.add("btn-warning");
  reportBug.classList.add("col");
  reportBug.classList.add("m-1");
  reportBug.href = "https://github.com/cirept/autofillReplacer/issues/new?template=bug_report.md";
  reportBug.innerHTML = "<i class='fas fa-bug'></i>";
  reportBug.target = "_blank";
  reportBug.title = "Report Bug";

  // request enhancement link props
  requestEnhancement.id = "requestEnhancement";
  requestEnhancement.classList.add("btn");
  requestEnhancement.classList.add("btn-sm");
  requestEnhancement.classList.add("btn-primary");
  requestEnhancement.classList.add("col");
  requestEnhancement.classList.add("m-1");
  requestEnhancement.href = "https://github.com/cirept/autofillReplacer/issues/new?template=feature_request.md";
  requestEnhancement.innerHTML = "<i class='fas fa-splotch'></i>";
  requestEnhancement.title = "Request Enhancement";
  requestEnhancement.target = "_blank";

  // view instructions button props
  instructions_button.id = "toolInstructions";
  instructions_button.classList.add("btn");
  instructions_button.classList.add("btn-sm");
  instructions_button.classList.add("btn-info");
  instructions_button.classList.add("col");
  instructions_button.classList.add("m-1");
  instructions_button.dataset.toggle = "modal";
  instructions_button.dataset.target = "#toolInstructionsModal";
  instructions_button.innerHTML = "<i class='fas fa-info'></i>";
  instructions_button.title = "Instructions";

  // button options container row 1 props
  buttonOptions_row1.classList.add("row");

  // button options container row 2 props
  buttonOptions_row2.classList.add("row");

  // tool button actions container props
  actionContainer.classList.add("list-action-container");
  actionContainer.classList.add("container-fluid");

  // autofill list props
  allAutofillsList.tabIndex = "4";
  allAutofillsList.id = "allAutofillsList";

  // list container props
  listContainer.classList.add("list-container");
  listContainer.classList.add("container-fluid");

  // attach bottom buttons
  buttonOptions_row1.appendChild(addAutofill_button);
  buttonOptions_row1.appendChild(defaultReset_button);
  buttonOptions_row2.appendChild(reportBug);
  buttonOptions_row2.appendChild(requestEnhancement);
  buttonOptions_row2.appendChild(changeLog_button);
  buttonOptions_row2.appendChild(instructions_button);

  // attach button container to container wrapper
  actionContainer.appendChild(buttonOptions_row1);
  actionContainer.appendChild(buttonOptions_row2);

  // attach autofill list to list container
  listContainer.appendChild(autofillOptionsList);

  // attach all elements to "toggable" container
  autofillOptionsContainer.appendChild(messageDisplay);
  autofillOptionsContainer.appendChild(listContainer);
  autofillOptionsContainer.appendChild(actionContainer);
  // autofillOptionsContainer.appendChild(allAutofillsList);

  // attach tool container to main tool container
  wsmEditorTools.appendChild(applyAutofills_button);
  wsmEditorTools.appendChild(minimizeList_button);
  wsmEditorTools.appendChild(autofillOptionsContainer);

  //
  // Functions
  //

  /**
   * Loads all the tool styles
   */
  function loadAutofillStyles() {
    return new Promise((resolve, reject) => {
      // default styles
      const autofillStyles = document.createElement("link");

      // default style link props
      autofillStyles.id = "autofill-styles";
      autofillStyles.rel = "stylesheet";
      autofillStyles.href = myStyles;
      document.head.appendChild(autofillStyles);
      // resolve or reject
      if (document.getElementById("autofill-styles")) {
        resolve("Success!");
      } else {
        reject("Autofill Tool styles were not attached.");
      }
    });
  }

  /**
   * Gets the state JSON information
   * Resolves an array of state objects with the name and abbreviations
   */
  function getLocaleAbbreviationInformation() {
    return new Promise((resolve, reject) => {
      const options = {
        // url: `https://raw.githubusercontent.com/cirept/autofillReplacer/develop/assets/json/locale_${locale}.json`,
        url: `https://raw.githubusercontent.com/cirept/autofillReplacer/master/assets/json/locale_${locale}.json`,
        dataType: "json"
      };

      // get file data
      jQuery.ajax(options).done((data) => {
        // return the STATE json object
        resolve(data);
      }).fail((error) => {
        reject(error.responseText);
      }).always();
    });
  }

  /**
   * Set the Full State Name
   */
  function setFullStateName(stateList) {
    // filter the array of states down to the matching state.
    const filteredStates = stateList.filter((state) => {

      // destructuring
      const {
        abbreviation
      } = state;

      // return value if it matches the current state.
      return getActiveAutofillEntryByTag("%STATE%").searchTerms === abbreviation;
    });

    // display console message that no match was found
    if (filteredStates.length > 1 || filteredStates.length < 1) {
      // set value to the default value
      log("Region not supported by the tool");
      // reject("No Match Found");
    }
    // set STATE FULL NAME to matched state
    else /*if(filteredStates.length === 1)*/ {
      getActiveAutofillEntryByTag("%STATE_FULL_NAME%").searchTerms = filteredStates[0].name;

      // display confirmation message
      log("State Full Name Added");
    }

    return new Promise((resolve) => {
      resolve("Full State Name Set");
    });
  }

  /**
   *  Generic function to perform ajax requests.  I wanted to make my own.  =]
   *
   * @param {object} options - the ajax request options
   * @returns the data that is recieved from the ajax request
   */
  function fetch(options) {
    return new Promise((resolve, reject) => {
      jQuery.ajax(options).done((data) => {
        resolve(data);
      }).fail((error) => {
        reject(error);
      }).always();
    });
  }

  /**
   * Returns the autofill tag entry from the active list
   * @param {object} autofillTag - the autofill tag to return from default list
   */
  function getActiveAutofillEntryByTag(autofillTag) {
    return activeAutofillList.find(autofill => autofill.autofillTag === autofillTag);
  }

  /**
   * Populate the values for the default autofill tags
   * @param {object} data - the html data that was recieved from the Website Settings of DCC
   */
  function populateActiveAutofillList(data) {
    return new Promise((resolve, reject) => {
      const myDiv = document.createElement("div");

      // myDiv props
      // attach data to div element in order to query elements within
      myDiv.innerHTML = data;

      const franchises = myDiv.querySelector("select#associatedFranchises").options;
      const myLength = franchises.length;
      const myFranchises = [];

      // create franchises string
      for (let x = 0; x < myLength; x += 1) {
        myFranchises.push(franchises[x].textContent);
      }

      // fill out autofill list with website settings information
      getActiveAutofillEntryByTag("%DEALER_NAME%").searchTerms = myDiv.querySelector("input[name='name']").value;
      getActiveAutofillEntryByTag("%STREET%").searchTerms = myDiv.querySelector("input#contact_address_street1").value;
      getActiveAutofillEntryByTag("%CITY%").searchTerms = myDiv.querySelector("input#contact_address_city").value;
      getActiveAutofillEntryByTag("%ZIP%").searchTerms = myDiv.querySelector("input#contact_address_postalCode").value;
      getActiveAutofillEntryByTag("%STATE%").searchTerms = myDiv.querySelector("select#contact_address_state").value;
      getActiveAutofillEntryByTag("%PHONE%").searchTerms = myDiv.querySelector("input[name='contact_phone_number']").value;

      if (data) {
        // display confirmation message
        log("Website Settings Information Loaded");
        resolve("Website Settings Set");
      } else {
        reject("populateActiveAutofillList failed : Website Settings Not Received");
      }
    });
  }

  /**
   * Fill in the default autofill list with a default value
   */
  function verifyActiveAutofillListValues() {
    return new Promise((resolve) => {
      const myKeys = Object.keys(activeAutofillList);

      // set the default value to SEARCH_FOR_ME if values are blank
      myKeys.map((autofill) => {
        if (activeAutofillList[String(autofill)] === "") {
          activeAutofillList[String(autofill)] = "SEARCH_FOR_ME";
        }
      });

      resolve("Default Values Verified");
    });
  }

  /**
   * Get data from "Settings" to autofill into the defaults list
   */
  function setGeneralInfo() {
    return new Promise((resolve) => {
      // path to open the website settings tab
      const siteSettingsURL = `editSiteSettings.do?webId=${webID}&locale=${locale}&pathName=editSettings`;
      const options = {
        url: siteSettingsURL,
        dataType: "html"
      };

      // getLocaleAbbreviationInformation
      // Get Website Information
      fetch(options)
        .then((websiteSettingsData) => populateActiveAutofillList(websiteSettingsData))
        .then(() => getLocaleAbbreviationInformation())
        .then((stateListObject) => setFullStateName(stateListObject))
        .then(() => resolve("Default Website Settings Set"))
        .catch((error) => {
          log("Issue with Website Information Encountered", error);

          // Display message that local is not supported by tool
          if (error.includes("404")) {
            log("Locale Not Supported");
          }

          log("Return Promise");
          resolve("Default Settings Loaded without Full State Name");
        });
    });
  }

  /**
   * Fill in the values for the default phone number autofill tags
   * @param {object} data - the HTML code for the Phone numbers section of the settings in WSM
   */
  function populateDefaultPhoneNumbers(data) {
    const myDiv = document.createElement("div");

    // attach data to div in order to query elements
    myDiv.innerHTML = data;

    // save query information to tool variable
    getActiveAutofillEntryByTag("%PHONE%").searchTerms = myDiv.querySelector("input[name*='(__primary_).ctn']").value;
    getActiveAutofillEntryByTag("%NEW_PHONE%").searchTerms = myDiv.querySelector("input[name*='(__new_).ctn']").value;
    getActiveAutofillEntryByTag("%USED_PHONE%").searchTerms = myDiv.querySelector("input[name*='(__used_).ctn']").value;
    getActiveAutofillEntryByTag("%SERVICE_PHONE%").searchTerms = myDiv.querySelector("input[name*='(__service_).ctn']").value;
    getActiveAutofillEntryByTag("%PARTS_PHONE%").searchTerms = myDiv.querySelector("input[name*='(__parts_).ctn']").value;

    // resolve
    return new Promise((resolve) => {
      resolve("Phone Numbers Set");
    });
  }

  /**
   *   Get Phone Numbers from website settings
   */
  function setPhoneNumbers() {
    return new Promise((resolve) => {
      // build website settings URL path
      const webID = document.getElementById("siWebId").querySelector("label.displayValue").textContent;
      const siteSettingsURL = `editDealerPhoneNumbers.do?webId=${webID}&locale=${locale}&pathName=editSettings`;
      const options = {
        url: siteSettingsURL,
        dataType: "html"
      };

      fetch(options)
        .then((phoneNumberInfo) => populateDefaultPhoneNumbers(phoneNumberInfo))
        .then(() => {
          log("Phone Numbers Added");
          resolve("Phone Numbers Added")
        });
    });
  }

  /**
   * jQuery functions for animate css
   */
  jQuery.fn.extend({
    animateCss(animationName) {
      const animationEnd = "webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend";
      this.addClass(`animated ${animationName}`).one(animationEnd, () => {
        jQuery(this).removeClass(`animated ${animationName}`);
      });
      return this;
    }
  });

  /**
   * Will show or hide the tool"s panel
   * will also update the button"s icon and hover text
   */
  function toggleToolPanel() {
    // toggle panel
    autofillOptionsContainer.classList.toggle("hide");

    if (autofillOptionsContainer.classList.contains("hide")) {
      minimizeList_button.innerHTML = "<i class='fas fa-eye fa-lg'></i>";
      minimizeList_button.title = "show list";
    } else {
      minimizeList_button.innerHTML = "<i class='fas fa-eye-slash fa-lg'></i>";
      minimizeList_button.title = "hide list";
    }
  }

  /**
   *Updates the tool display message
   *
   * @param {string} message - the message to display
   * @param {string} animationType - the type of animation to use
   */
  function updateDisplayMessage(message, animationType = "tada") {
    // update display message
    messageDisplay.innerText = message;
    jQuery("#toolMessageDisplay").animateCss(animationType);
  }

  /**
   * Build a generic list item to use through out the tool
   * @param {string} autofill - the text that will be used to fill in the autofillTag div
   * @param {string} text - the text that will be used as the input value, DEFAULT value = "SEARCH_FOR_ME"
   */
  function listItem(autofill, text = "SEARCH_FOR_ME") {
    console.log("creating listItem", text);
    const listElement = document.createElement("li");
    const label = document.createElement("div");
    const myInput = document.createElement("input");
    const myPointer = document.createElement("i");
    const removeMeContainer = document.createElement("div");
    const removeMe = document.createElement("i");

    // main list element props
    listElement.classList.add("autofillEntry");
    listElement.classList.add("row");
    listElement.dataset.autofillTag = autofill;

    // label element props
    label.classList.add("autofillTag");
    label.textContent = autofill;

    // input area props
    myInput.type = "text";
    myInput.classList.add("regEx");
    myInput.title = text;
    myInput.value = text;

    // arrow icon props
    myPointer.classList.add("fas");
    myPointer.classList.add("fa-long-arrow-alt-right");
    myPointer.classList.add("fa-lg");
    myPointer.classList.add("arrow");

    // remove element props
    removeMeContainer.classList.add("js-remove");
    removeMeContainer.title = "click to remove";
    removeMeContainer.onclick = (e) => {
      // removes list item from tool
      e.currentTarget.parentElement.remove();
      // saves state
      saveAutofillParameters();
      // display message to user that item was removed
      updateDisplayMessage("Item Removed");
      // remove disabled from the autofill options list
      removeDisable(e.currentTarget.parentElement);
    };

    // remove me font icon
    removeMe.classList.add("fas");
    removeMe.classList.add("fa-times");
    removeMe.classList.add("fa-lg");
    removeMeContainer.appendChild(removeMe);

    // build list item
    listElement.appendChild(myInput);
    listElement.appendChild(myPointer);
    listElement.appendChild(label);
    listElement.appendChild(removeMeContainer);

    console.log("creating listItem complete");

    return listElement;
  }

  /**
   * save autofill parameter list to local storage
   * @param {Object} obj - parameter list to save
   */
  function saveAutofillParameters() {
    const myArrayObj = convertActiveListToObject();
    const saveMe = JSON.stringify(myArrayObj);
    saveToLocalStorage("AutofillReplacerTool", saveMe);
  }

  /**
   * save object to local storage
   * @param {string} name - object to be saved into local storage
   * @param value - the value to save
   */
  function saveToLocalStorage(name, value) {
    localStorage.setItem(name, value);
  }

  /**
   * creating an array of the configured autofill tags
   * Also performs simple validation to prevent empty values being saved
   * @return {object} myArrayObj - returns object array of autofill entries in list
   */
  function convertActiveListToObject() {
    let myArrayObj = [];

    // loop through configured autofills
    Array.from(autofillOptionsList.children).map((element) => {
      let autofillTag = element.querySelector(".autofillTag").innerText; // trim it just in case the manual autofill input is triggerd
      let regexInput = element.querySelector(".regEx").value.trim();
      let saveAutofill = {};

      // validate input
      // use default phrase if autofill is empty
      if (regexInput === "") {
        regexInput = "SEARCH_FOR_ME";
      }

      // add data to autofill object to save
      saveAutofill["autofillTag"] = autofillTag;
      saveAutofill["searchTerms"] = regexInput;

      // add autofill entry to the save array
      myArrayObj.push(saveAutofill);
    });

    return myArrayObj;
  }

  /**
   * Scan autofill drop down list and remove disable class
   * @param {object} elem - element being removed from the configured list
   */
  function removeDisable(elem) {
    const autofillTag = elem.dataset.autofillTag;
    const disabledAutofills = document.getElementById("allAutofillsList")
      .querySelectorAll(".autofill-list-item.disabled"); // query page for all disabled autofill elements
    const match = Array.from(disabledAutofills)
      .find(autofill => autofillTag === autofill.dataset.autofillTag); // search disabled autofills for match

    // remove disabled class if there is a match
    match && document.querySelector(`.autofill-list-item.disabled[data-autofill-tag="${match.dataset.autofillTag}"]`)
      .classList.remove("disabled");
  }

  /**
   * disabled "magic" button if an entry is blank
   */
  function toggleMagicButton() {
    if (autofillOptionsList.getElementsByClassName("myError").length >= 1) {
      applyAutofills_button.classList.add("disabled");
    } else {
      applyAutofills_button.classList.remove("disabled");
    }
  }

  /**
   * Show error if input search field is empty
   */
  function validateList() {
    if (autofillOptionsList.getElementsByClassName("myError").length > 0) {
      updateDisplayMessage("Please enter a word to search for.", "flash");
    } else {
      if (applyAutofills_button.classList.contains("disabled")) {
        applyAutofills_button.classList.remove("disabled");
      }

      if (messageDisplay.textContent !== "") {
        messageDisplay.textContent = "";
      }
    }
  }

  /**
   * Updates the inputs hover text
   * @param {object} e - the event object
   *
   */
  function updateInputTitle(e) {
    e.target.title = e.target.value;
  }

  /**
   * will bind all new option list with a on text change listener
   * @param {element} elem - new autofill list option
   */
  function bindTextChangeListener(elem) {
    jQuery(elem).find("input").on("keyup", saveAutofillParameters);
    jQuery(elem).find("input").on("keyup", updateInputTitle);
    jQuery(elem).find("input").on("keyup", toggleMagicButton);
    jQuery(elem).find("input").on("keyup", validateList);
    jQuery(elem).find("input").on("keyup", () => {
      updateDisplayMessage("Changes Saved", "flash");
    });
  }

  /**
   * retrive object from local storage
   * retrive object from local storage
   * @param {object} obj - object to be saved into local storage
   * @return {object} the ACTIVE Autofill list retrived from localStorage
   */
  function getFromLocalStorage() {
    if (localStorage.getItem("AutofillReplacerTool")) {
      return JSON.parse(localStorage.getItem("AutofillReplacerTool"));
    }
    return activeAutofillList;
  }

  /**
   * will construct the autofill display area.
   * Will use data in local storage, if it exists
   * Otherwise defaults to Website information
   * @return {object} Promise.resolve
   */
  function buildActiveAutofillList() {
    console.log("build active autofill list start");
    // set the array to either data from Local Storage OR the default active list
    const mapME = getFromLocalStorage() || defaultAutofillList;

    console.log("mapping these autofills", mapME);

    // build autofill list options
    mapME.map((autofill) => {
      const {
        autofillTag,
        searchTerms
      } = autofill;
      let listElement = listItem(autofillTag, searchTerms);

      // bind list item elements
      bindTextChangeListener(listElement);

      // attach to legend list
      autofillOptionsList.append(listElement);
    });

    console.log("build active autofill list complete");

    return Promise.resolve("Active Autofill List Built");
  }

  /**
   * resets all the autofill parameters to the default list
   * @param {string} message - the message to show when the tool resets
   */
  function resetAutofills(message) {
    // erase current list
    autofillOptionsList.innerHTML = "";
    // remove stored variables from memory
    localStorage.removeItem("AutofillReplacerTool");
    console.log("current local storage for autoreplace tool", localStorage.AutofillReplacerTool);
    // build default list
    buildActiveAutofillList();
    // reset apply button if it is disabled
    toggleMagicButton();
    // update display message
    updateDisplayMessage(message);
    // save new values
    saveAutofillParameters();

    // 
    // disabledAutofills();
    // disableActiveAutofillOptions();
  }

  /**
   * Reset all disabled autofills in the Autofills List Modal
   */
  function resetAllDisabledAutofills() {
    console.log("reset all disabled autofills");
    const disabledElements = document.getElementById("autofillListModal").querySelectorAll(".autofill-list-item.disabled");

    console.log(disabledElements);
    // remove all disabled classes from the autofills list
    if (disabledElements.length > 0) {
      // loop through HTML collection of query results
      for (let z = 0; z < disabledElements.length; z += 1) {
        // console.log(autofillElement);
        disabledElements[z].classList.remove("disabled");
      }
    }

    console.log("reset all disabled autofills complete");
  }

  /**
   * Reset configured autofill tags to the default list
   * @param {boolean} confirm - should the user be prompted before reset?
   * @param {string} message - the message to show when the tool resets
   */
  function resetValues(confirm, message) {
    if (confirm && window.confirm("Reset Values?")) {
      resetAutofills(message);
      resetAllDisabledAutofills();
      disableActiveAutofillOptions();
    }

    if (!confirm) {
      resetAutofills(message);
      resetAllDisabledAutofills();
      disableActiveAutofillOptions();
    }
  }

  /**
   * Converts the autofill tags in local memory to simple array
   * @return {object} autofill - contains a simple array with AUTOFILL tags ONLY
   */
  function localDataToString() {
    const localData = getFromLocalStorage();
    const autofill = [];
    const keys = Object.keys(localData);

    log("localDataToString", localData);

    keys.map((value) => {
      autofill.push(value);
    });

    return autofill;
  }

  /**
   * Actions to be performed after the user selects an Autofill Options from the Auotfill Modal
   * 
   * Creates an active menu item that the tool will use to replace text with autofill tags
   * @param {object} liElement - liElement that will get it"s onclick event binded
   * @param {string} tag - the autofill tag for the ACTIVE list element
   */
  function addSelectedAutofillToList(liElement, tag) {
    const listElement = listItem(tag); // create the LI element in memory

    // disabled the li element in the options modal
    liElement.classList.add("disabled");
    // add the newly created ACTIVE li element to the ACTIVE list
    autofillOptionsList.appendChild(listElement);
    // bind list item elements
    bindTextChangeListener(listElement);
    // save state of new list
    saveAutofillParameters();
    // confirmation message
    updateDisplayMessage("Autofill Added to List");
  }

  /**
   * Scans the autofill options list and disables items already
   * added to the active list
   */
  function attachAddToActiveEvent() {
    const allAutofillsList = document.querySelectorAll("li.autofill-list-item");

    // loop through HTML collection and attach onclick event listener
    for (let option of allAutofillsList) {
      option.onclick = () => {
        return addSelectedAutofillToList(option, option.dataset.autofillTag);
      }
    }

    // resolve promise
    return new Promise((resolve) => {
      resolve("Autofills Click Events Attached");
    });
  }

  /**
   * Scans the autofill options list and disables items in the
   * ALL Autofill Tag Modal Pop up already
   * added to the active list
   */
  function disableActiveAutofillOptions() {
    console.log("disabled active autofills");
    // query DOM for elements
    const autofillListItems = document.getElementById("allAutofillsList").querySelectorAll("li.autofill-list-item");

    // loop through the HTML collection query search results
    for (let z = 0; z < autofillListItems.length; z += 1) {
      // loop through active autofill list and disable it on the Modal Pop Up
      activeAutofillList.map((autofill) => {
        const {
          autofillTag
        } = autofill;

        // apply disabled class to element
        autofillListItems[z].innerText === autofillTag && autofillListItems[z].classList.add("disabled");
      });

    }

    console.log("disabled active autofills complete");

    // return resolve
    return Promise.resolve("Autofills Disabled");
  }

  /**
   * Create the list elements for the autofill options list modal
   * @param {object} autofillListData - the autofill object containing all the autofill options
   */
  function createAutofillListOptions(autofillListData) {
    return new Promise((resolve, reject) => {
      // loop through each autofill object and add it to the list.
      autofillListData.map((autofill) => {
        const {
          autofill: tag,
          description,
        } = autofill;

        // create "li" for each autofill tag in the list
        const myListItem = document.createElement("li");
        // attach new "li" to main list
        const tooltipText = description ? description : "**No tooltip information available**";

        // list item props
        myListItem.textContent = tag;
        myListItem.classList.add("btn");
        myListItem.classList.add("btn-light");
        myListItem.classList.add("autofill-list-item");
        myListItem.dataset.autofillTag = tag;
        myListItem.title = tooltipText;

        // add the list element to the "drop down" list
        allAutofillsList.appendChild(myListItem);
      });

      // resolve or reject
      if (allAutofillsList.childElementCount > 0) {
        resolve("Autofill Selection List Created");
      } else {
        reject("Autofill List Selection was not create");
      }
    });
  }

  /**
   * create treewalker to navigate DOM and return all TEXT nodes
   * @param {object} base - base element to crawl for text nodes
   * @return {array} wordArray - array containing all text nodes on the page
   */
  function treeWalk(base) {
    const treeWalker = document.createTreeWalker(base, NodeFilter.SHOW_TEXT, null, false);
    const wordArray = [];

    while (treeWalker.nextNode()) {
      if (treeWalker.currentNode.nodeType === 3 && treeWalker.currentNode.textContent.trim() !== "") {
        wordArray.push(treeWalker.currentNode);
      }
    }
    return wordArray;
  }

  /**
   * Escape characters to prevent malacious input from user
   */
  RegExp.escape = function (s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  };

  /**
   * Test if phone number
   * Checked format = 000-0000
   * @param {string} text - the text to verify
   */
  function phoneNumberText(text) {
    const phoneRegex = /((\(\d{3}\) ?)|(\d{3}-))?\d{3}-\d{4}/g;

    if (phoneRegex.test(text)) {
      return RegExp.escape(text);
    }
    return `\\b${RegExp.escape(text)}\\b`;
  }

  /**
   * Replaced matching words/phrases with the corresponding autofill tags
   * @param {array} wordList - array containing all the visible text in the edit area
   * @param {string} regReplace - text string to search for
   */
  function replaceText(wordList, regReplace) {
    wordList.forEach((n) => {
      let text = n.nodeValue;

      // iterate through autofill array and replace matches in text
      // replace all instances of "findMe" with "autofillTag"
      for (const autofillTag in regReplace) {
        const findMe = regReplace[autofillTag];

        // if split phrases are needed
        if (findMe.indexOf(";") > -1) {
          const findArray = findMe.split(";");
          const arrayLength = findArray.length;
          for (let a = 0; a < arrayLength; a += 1) {
            const searchText = findArray[a].trim();
            const findThis = phoneNumberText(searchText);
            const myRegex = new RegExp(findThis, "gi");

            if (searchText === "") {
              continue;
            }

            text = text.replace(myRegex, autofillTag);
          }
        } else {
          const findThis = phoneNumberText(findMe);
          const myRegex = new RegExp(findThis, "gi");
          text = text.replace(myRegex, autofillTag);
        }
      }

      n.nodeValue = text;
    });
  }

  /**
   * loop through word list array and replace text with autofill tags
   * @param {object} baseElem - base element to find and replace text with autofill tags
   * @param {array} regReplace - object array that contains the regExpressions and corresponding autofill tags
   */
  function useAutofillTags(baseElem, regReplace) {
    let wordList;
    const baseLength = baseElem.length;

    for (let z = 0; z < baseLength; z += 1) {
      // get all visible text on page
      wordList = treeWalk(baseElem[z]);
      replaceText(wordList, regReplace);
    }
  }

  /**
   * Replace text on a CMS style input window
   * @param {array} recordEditWindow - array of DOM input elements
   * @param {regex} regReplace - list of regex values
   */
  function replaceTextCMS(recordEditWindow, regReplace) {
    // pass elements with children as base element for autofill replacing
    useAutofillTags(recordEditWindow, regReplace);

    // change focus between text area to trigger text saving.
    const recordLendth = recordEditWindow.length;
    for (let z = 0; z < recordLendth; z += 1) {
      jQuery(recordEditWindow[z]).focus();
    }
  }

  /**
   * will walk through edittable portion of WSM window and perform text
   * replacing with data contained in the list area of tool
   */
  function autofills() {
    // WSM MAIN WINDOW LOGIC
    const contentFrame = jQuery("iframe#cblt_content").contents();
    const siteEditorIframe = contentFrame.find("iframe#siteEditorIframe").contents();
    let viewerIframe;
    let cmsIframe;
    let myChild;
    let recordEditWindow;
    const regReplace = getFromLocalStorage(); // get stored autofill tags from local storage

    // run CMS Content Pop Up edit window IF WINDOW IS OPEN
    if (window.location.pathname.indexOf("editSite") >= 0 &&
      siteEditorIframe.find("div#hiddenContentPopUpOuter").hasClass("opened")) {
      // save contents of cms content edit frame
      cmsIframe = siteEditorIframe.find("iframe#cmsContentEditorIframe").contents();

      // if quick CMS editor is open
      recordEditWindow = cmsIframe.find("div.main-wrap").find(".input-field").find("div[data-which-field='copy']");

      // pass elements with children as base element for autofill replacing
      replaceTextCMS(recordEditWindow, regReplace);
    } else if (window.location.pathname.indexOf("editSite") >= 0 &&
      !siteEditorIframe.find("div#hiddenContentPopUpOuter").hasClass("opened")) {
      // get contens of iframe
      viewerIframe = siteEditorIframe.find("iframe#viewer").contents();

      // return array of elements that have children
      myChild = viewerIframe.find("body").children().filter(function (index, value) {
        if (value.children.length !== 0) {
          return this;
        }
      });

      // pass elements with children as base element for autofill replacing
      useAutofillTags(myChild, regReplace);
    } else if (window.location.pathname.indexOf("cms") >= 0) {
      // CMS LOGIC

      // get contens of iframe
      recordEditWindow = contentFrame.find("div.main-wrap").find(".input-field").find("div[data-which-field='copy']");

      // pass elements with children as base element for autofill replacing
      replaceTextCMS(recordEditWindow, regReplace);
    }
  }

  /**
   * Determine if the current website is different
   */
  function webIDToolReset() {
    const currentWebID = getWebID();
    if (getItemFromLocalStorage("webID") !== currentWebID) {
      resetValues(false, "New Web ID Detected, Values Reset");
      // save webid
      saveToLocalStorage("webID", currentWebID);
    }
  }

  /**
   * Grabs the web id from the input at the top right
   * of the WSM page.
   * @return {string} the web id for the current site.
   */
  function getWebID() {
    return document.querySelector("#siWebId .displayValue").innerText;
  }

  /**
   * Gets data item from local storage
   * @param {string} name - the name of the local storage item to return
   * @return the value for the data item or "No Data Found" message
   */
  function getItemFromLocalStorage(name) {
    return window.localStorage.getItem(name) === null ?
      "No Data Found in Local Storage" :
      window.localStorage.getItem(name);
  }

  /**
   * Attach events to tool buttons
   */
  function attachButtonEvents() {
    // minimize list button
    minimizeList_button.onclick = toggleToolPanel;
    // reset tool button
    defaultReset_button.onclick = () => {
      resetValues(true, "Values Reset");
    };
    // apply autofill button
    applyAutofills_button.onclick = autofills;
  }

  /**
   * Converts a markdown string (github flavored) into HTML
   * @param {string} data - the markdown string text to be converted into HTML
   */
  function convertMarkdownToHTML(data) {
    return new Promise((resolve) => {
      const conv = new showdown.Converter();
      showdown.setFlavor("github");
      const changeLogData = conv.makeHtml(data);
      // resolve converted data
      resolve(changeLogData);
    });
  }

  /**
   * Builds a modal and attaches it to the webpage.
   * @param {string} name - the name of the modal
   * @param {string} html - the content of the modal
   */
  function attachModal(name, html) {
    return new Promise((resolve, reject) => {
      // build latest changes modal
      const myModal = document.createElement("div");
      // add the modal content + the Latest Changes Markdown Doc Content
      myModal.innerHTML = `
        <div class="modal fade" id="${name}Modal" tabindex="-1" role="dialog" aria-labelledby="${name}Title" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
              <div class="modal-body">
                ${html}
              </div>
            </div>
          </div>
        </div>
      `;

      // attach modal to page
      document.body.appendChild(myModal);

      if (document.getElementById(`${name}Modal`)) {
        resolve(`${name} Modal Attached`);
      } else {
        reject(`${name} Modal Not Attached`);
      }
    });
  }

  /**
   * Start events to build the autofill "drop down menu"
   * @return {object} a Promise.resolve
   */
  function buildAutofillListModal() {
    const options = {
      url: autofillTagListURL,
      dataType: "json"
    };

    return fetch(options)
      .then(data => createAutofillListOptions(data))
      .then(() => attachModal("autofillList", allAutofillsList.outerHTML))
      .then(() => disableActiveAutofillOptions())
      .then(() => attachAddToActiveEvent())
      .then(() => log("Autofill Modal Complete", true))
    // .resolve();
    // .then(() => {
    //   return () => Promise.resolve;
    // });

    // return Promise.resolve("Autofill Modal Complete");
  }

  /**
   * builds and attaches the latest changes modal to the webpage.
   * @return {object} a Promise.resolve
   */
  function buildLatestChangesModal() {
    const options = {
      url: lastestChanges,
      dataType: "text"
    };

    // get latest changes data
    return fetch(options)
      .then(data => convertMarkdownToHTML(data))
      .then(HTMLdata => attachModal("lastestChanges", HTMLdata))
      .then(() => log("Latest Changes Modal Complete", true))
    // .then(() => {
    //   return () => Promise.resolve;
    // });

    // return Promise.resolve("Latest Changes Modal Complete");
  }

  /**
   * builds and attaches the latest changes modal to the webpage.
   * @return {object} a Promise.resolve
   */
  function buildInstructionsModal() {
    const options = {
      url: toolInstructions,
      dataType: "text"
    };

    // get instructions data
    return fetch(options)
      .then(data => convertMarkdownToHTML(data))
      .then(HTMLdata => attachModal("toolInstructions", HTMLdata))
      .then(() => log("Instructions Modal Complete", true))
    // .then(() => {
    //   return () => Promise.resolve;
    // });

    // return Promise.resolve("Instructions Modal Complete");
  }

  /**
   * Attaches the main tool container to the webpage and adds event
   * listeners to buttons
   * @return {object} a Promise.resolve
   */
  function buildMainTool() {
    // log("attacing tool to page");
    // attach tool elements to page
    document.querySelector("header.wsmMainHeader").appendChild(wsmEditorTools);
    // attach button events
    attachButtonEvents();

    // console.log("attached to page", document.querySelector(".customEditorTools"));
    return Promise.resolve("Main Tool Complete");
  }

  /**
   * Sets up autofill tool
   */
  function setup() {


    buildAutofillListModal();
    // .then(() => log("buildAutofillListModal resolve recieved"));
    buildLatestChangesModal();
    // // .then(result => log(result));
    // .then(() => log("buildLatestChangesModal resolve recieved"));
    buildInstructionsModal();
    //   // .then(result => log(result));
    // .then(() => log("buildInstructionsModal resolve recieved"));
    buildActiveAutofillList();
    //   // .then(result => log(result));
    // .then(result => log("buildActiveAutofillList resolve recieved"));
    buildMainTool();
    // .then(result => log("buildMainTool resolve recieved"));
    webIDToolReset();

    // console.log("Autofill Tool Setup Complete");
    // return Promise.all([buildAutofillListModal, buildLatestChangesModal, buildInstructionsModal, buildActiveAutofillList])
    //   .then(() => buildMainTool())
    //   .then(() => {
    //     webIDToolReset();
    //     return () => Promise.resolve;
    //   });
    // .then(() => Promise.resolve("Autofill Tool Setup Complete"));
    // .then(() => console.log("Autofill Tool Setup Complete"));
  }

  /**
   * main function to start the program
   */
  function main() {
    // run tool
    // Load Tool Styles
    loadAutofillStyles()
      .then(() => setGeneralInfo())
      .then(() => setPhoneNumbers())
      .then(() => verifyActiveAutofillListValues())
      .then(() => setup())
      // .then(() => buildMainTool())
      // .then(() => {
      //   window.onload = setup;
      // })
      .catch(error => {
        log("Failed to Load Tool Styles", error);
      });
  }

  //
  // Run Tool
  //

  window.onload = main;
  // main();
}());