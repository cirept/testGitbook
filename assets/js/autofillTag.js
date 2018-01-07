/*global document, location, localStorage, Sortable, NodeFilter, window, GM_info, GM_setValue, GM_getValue, GM_listValues */

/* ----------------------------------------
NOTES:
- Animate CSS only works with jQuery.
---------------------------------------- */

var Autofill = (function () {
    'use strict';

    let shared = {
        /**
         * Tampermonkey function.
         * Save value to local storage for program to use.
         * @param {string} variable The variable that will be looked up.
         * @param {bool} val The value that the variable will be set too.
         */
        'saveValue': function (variable, val) {
            GM_setValue(variable, val); // eslint-disable-line new-cap
        },
        /**
         * Tampermonkey function.
         * Get value to local storage for program to use.
         * @param {string} variable The variable that will be looked up.
         * @return {bool} The saved value of current variable.
         */
        'getValue': function (variable) {
            return GM_getValue(variable, false); // eslint-disable-line new-cap
        },
        /**
         * Tampermonkey function.
         * to retrieve all the program variables from local storage.
         * @return {object} The list of saved values.
         */
        'programVariables': function () {
            return GM_listValues(); // eslint-disable-line new-cap
        },
        'programData': function () {
            let allVariables = this.programVariables(); // global function
            let length = allVariables.length;
            let a = 0;
            let varList = {};
            let key = '';
            let value = '';
            // add variables to list
            for (a; a < length; a += 1) {
                key = allVariables[a];
                value = this.getValue(key);
                varList[key] = value;
            }

            return varList;
        },
    };

    let myURL = 'https://raw.githubusercontent.com/cirept/WSMupgrades/master/json/autofillTags2.json';
    let defaultList = {
        '%DEALER_NAME%': 'SEARCH_FOR_ME',
        '%FRANCHISES%': 'SEARCH_FOR_ME',
        '%STREET%': 'SEARCH_FOR_ME',
        '%CITY%': 'SEARCH_FOR_ME',
        '%STATE%': 'SEARCH_FOR_ME',
        '%ZIP%': 'SEARCH_FOR_ME',
        '%PHONE%': 'SEARCH_FOR_ME',
        '%NEW_PHONE%': 'SEARCH_FOR_ME',
        '%USED_PHONE%': 'SEARCH_FOR_ME',
        '%SERVICE_PHONE%': 'SEARCH_FOR_ME',
        '%PARTS_PHONE%': 'SEARCH_FOR_ME',
    };

    // ----------------------------------------
    // autofill menu
    // ----------------------------------------

    // Container
    let autofillTool = document.createElement('div');
    autofillTool.id = 'autofillTool';

    // toggle Tab
    let autofillTab = document.createElement('div');
    autofillTab.id = 'autofillToolTab';
    autofillTab.classList.add('hide');

    // Main Tool Container
    let autofillToolContainer = document.createElement('div');
    autofillToolContainer.id = 'autofillToolContainer';
    autofillToolContainer.classList.add('hide');

    // "Active" Autofill Listing Container
    let autofillOptionsContainer = document.createElement('div');
    autofillOptionsContainer.id = 'autofillOptionsContainer';
    autofillOptionsContainer.classList.add('hide');

    // minimize list element
    let minimizeList = document.createElement('div');
    minimizeList.classList.add('minimizeList');
    minimizeList.title = 'Show Tool';
    minimizeList.innerHTML = 'Autofill Tool<br><i class="fas fa-eye fa-lg"></i>';

    autofillTab.appendChild(minimizeList);

    // "Active" Autofill list
    let autofillOptionsList = document.createElement('ul');
    autofillOptionsList.id = 'autofillOptions';

    // message area 'at the top of the tool'
    let messageDisplay = document.createElement('div');
    messageDisplay.id = 'toolMessageDisplay';
    messageDisplay.textContent = `Autofill tag text replacer tool v${GM_info.script.version}`;

    // Reset button
    let defaultReset = document.createElement('button');
    defaultReset.id = 'defaultReset';
    defaultReset.classList.add('myButts');
    defaultReset.classList.add('secondary');
    defaultReset.title = 'Reset Values';
    defaultReset.innerHTML = '<i class="fas fa-redo fa-lg"></i>';

    // Apply autofill button
    let applyAutofills = document.createElement('button');
    applyAutofills.id = 'applyAutofills';
    applyAutofills.classList.add('myButts');
    applyAutofills.type = 'button';
    applyAutofills.title = 'apply autofills';
    applyAutofills.innerHTML = '<i class="fas fa-magic fa-lg"></i>';

    // add autofill button
    let addButton = document.createElement('button');
    addButton.id = 'addAutofill';
    addButton.classList.add('myButts');
    addButton.value = 'addAutofill';
    addButton.title = 'Add Autofill';
    addButton.innerHTML = '<i class="fas fa-plus fa-lg"></i>';

    // autofill options drop down list
    let autofillDropdown = document.createElement('ul');
    autofillDropdown.tabIndex = '4';
    autofillDropdown.classList.add('autofill-dropdown');
    autofillDropdown.classList.add('hide');

    // autofill modes
    // ----------------------------------------
    let modeContainer = document.createElement('div');
    modeContainer.id = 'modeContainer';
    modeContainer.classList.add('vertical');

    let modeTitle = document.createElement('div');
    modeTitle.textContent = 'modes';

    // Add button Icon
    let lightbulbIcon = document.createElement('i');
    lightbulbIcon.classList.add('fas', 'fa-lightbulb', 'fa-lg');
    lightbulbIcon.setAttribute('data-fa-transform', 'shrink-3');

    // highlight autofills
    let highlightAutofillsButt = document.createElement('button');
    highlightAutofillsButt.classList.add('modes');
    highlightAutofillsButt.classList.add('secondary');
    highlightAutofillsButt.classList.add('myButts');
    highlightAutofillsButt.dataset.feature = 'highlight';
    highlightAutofillsButt.title = 'highlight';
    highlightAutofillsButt.type = 'button';

    // attach button icon
    highlightAutofillsButt.appendChild(lightbulbIcon);

    // Exchange Icon
    let exchangeIcon = document.createElement('i');
    exchangeIcon.classList.add('fas', 'fa-exchange', 'fa-lg');
    exchangeIcon.setAttribute('data-fa-transform', 'shrink-3');

    // replace autofills
    let replaceAutofillsButt = document.createElement('button');
    replaceAutofillsButt.classList.add('modes');
    replaceAutofillsButt.classList.add('secondary');
    replaceAutofillsButt.classList.add('myButts');
    replaceAutofillsButt.dataset.feature = 'replace';
    replaceAutofillsButt.title = 'replace';
    replaceAutofillsButt.type = 'button';

    // attach button icon
    replaceAutofillsButt.appendChild(exchangeIcon);

    // build mode container
    modeContainer.appendChild(modeTitle);
    modeContainer.appendChild(replaceAutofillsButt);
    modeContainer.appendChild(highlightAutofillsButt);

    autofillOptionsContainer.appendChild(autofillOptionsList);
    autofillOptionsContainer.appendChild(defaultReset);
    autofillOptionsContainer.appendChild(addButton);
    autofillOptionsContainer.appendChild(autofillDropdown);

    autofillToolContainer.appendChild(applyAutofills);
    autofillToolContainer.appendChild(messageDisplay);
    autofillToolContainer.appendChild(autofillOptionsContainer);
    autofillToolContainer.appendChild(modeContainer);

    autofillTool.appendChild(autofillToolContainer);
    autofillTool.appendChild(autofillTab);

    // attach tool elements to page
    document.body.appendChild(autofillTool);

    /**
     * jQuery functions for animate css
     */
    jQuery.fn.extend({
        'animateCss': function (animationName, callback) {
            var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
            this.addClass('animated ' + animationName).one(animationEnd, function () {
                jQuery(this).removeClass('animated ' + animationName);
                if (callback) {
                    callback();
                }
            });
            return this;
        },
    });

    /**
     *   Load local tool settings
     *   Mode : Replace or Highlight
     */
    function loadToolSettings() {
        let toolSettings = shared.programData();

        if (Object.keys(toolSettings).length > 0) {

            // this will run if there is tool settings available in local storage
            if (toolSettings.mode.indexOf('replacer') > -1) {

                // set REPALCER as ACTIVE mode
                replaceAutofillsButt.classList.add('active');
                replaceAutofillsButt.classList.remove('secondary');
                replaceAutofillsButt.title = 'replace *active*';

            } else if (toolSettings.mode.indexOf('highlight') > -1) {

                // set HIGHLIGHT as ACTIVE mode
                highlightAutofillsButt.classList.add('active');
                highlightAutofillsButt.classList.remove('secondary');
                highlightAutofillsButt.title = 'highlight *active*';
            }
        } else {
            // this will run if the operator is using the tool for the first time

            // set REPALCER as ACTIVE mode
            replaceAutofillsButt.classList.add('active');
            // save MODE in local storage
            shared.saveValue('mode', 'replacer');
        }
    }

    /**
     * Get data from 'Settings' to autofill into the defaults list
     */
    function defaultValues() {

        let webID = document.getElementById('siWebId').querySelector('label.displayValue').textContent;
        let siteSettingsURL = `editSiteSettings.do?webId=${webID}&locale=en_US&pathName=editSettings`;

        jQuery.get(siteSettingsURL, function (data) {

            let myDiv = document.createElement('div');
            myDiv.innerHTML = data;
            let franchises = myDiv.querySelector('select#associatedFranchises').options;
            let myLength = franchises.length;
            let myFranchises = [];

            // create franchises string
            for (let x = 0; x < myLength; x += 1) {
                myFranchises.push(franchises[x].textContent);
            }

            defaultList['%DEALER_NAME%'] = myDiv.querySelector('input[name="name"]').value;
            defaultList['%STREET%'] = myDiv.querySelector('input#contact_address_street1').value;
            defaultList['%CITY%'] = myDiv.querySelector('input#contact_address_city').value;
            defaultList['%ZIP%'] = myDiv.querySelector('input#contact_address_postalCode').value;
            defaultList['%STATE%'] = myDiv.querySelector('select#contact_address_state').value;
            defaultList['%PHONE%'] = myDiv.querySelector('input[name="contact_phone_number"]').value;
            defaultList['%FRANCHISES%'] = myFranchises.join(', ');

        }, 'html');

    }

    /**
     *   Get Phone Numbers
     */
    function defaultPhoneNumber() {
        let webID = document.getElementById('siWebId').querySelector('label.displayValue').textContent;
        let siteSettingsURL = `editDealerPhoneNumbers.do?webId=${webID}&locale=en_US&pathName=editSettings`;

        jQuery.get(siteSettingsURL, function (data) {
            let myDiv = document.createElement('div');
            myDiv.innerHTML = data;

            defaultList['%PHONE%'] = myDiv.querySelector('input[name*="(__primary_).ctn"]').value;
            defaultList['%NEW_PHONE%'] = myDiv.querySelector('input[name*="(__new_).ctn"]').value;
            defaultList['%USED_PHONE%'] = myDiv.querySelector('input[name*="(__used_).ctn"]').value;
            defaultList['%SERVICE_PHONE%'] = myDiv.querySelector('input[name*="(__service_).ctn"]').value;
            defaultList['%PARTS_PHONE%'] = myDiv.querySelector('input[name*="(__parts_).ctn"]').value;

        }, 'html');
    }

    // ----------------------------------------
    // INTERNAL FUNCTIONS - START
    // ----------------------------------------

    /**
     * Build a generic list item to use through out the tool
     * @param {string} autofill - the text that will be used to fill in the autofillTag div
     * @param {string} text - the text that will be used as the input value
     */
    function listItem(autofill, text) {

        if (!text) {
            text = 'SEARCH_FOR_ME';
        }

        let listElement = document.createElement('li');
        listElement.classList.add('autofillEntry');

        let grabHandle = document.createElement('span');
        grabHandle.classList.add('my-handle');
        grabHandle.title = 'drag to re-order';
        grabHandle.innerHTML = '<i class="fas fa-sort"></i>';

        let label = document.createElement('div');
        label.classList.add('autofillTag');
        label.textContent = autofill;

        let myInput = document.createElement('input');
        myInput.type = 'text';
        myInput.classList.add('regEx');
        myInput.title = 'enter search string';
        myInput.value = text;
        myInput.onkeypress = function () {
            this.style.width = (this.value.length + 1) * 8 + 'px';
        };

        let myPointer = document.createElement('i');
        myPointer.classList.add('fas');
        myPointer.classList.add('fa-long-arrow-alt-right');
        myPointer.classList.add('leftMarg');
        myPointer.classList.add('fa-lg');

        let removeMeContainer = document.createElement('div');
        removeMeContainer.classList.add('js-remove');
        removeMeContainer.title = 'click to remove';

        let removeMe = document.createElement('i');
        removeMe.classList.add('fas');
        removeMe.classList.add('fa-times');
        removeMe.classList.add('fa-lg');

        removeMeContainer.appendChild(removeMe);

        // build list item
        listElement.appendChild(grabHandle);
        listElement.appendChild(myInput);
        listElement.appendChild(myPointer);
        listElement.appendChild(label);
        listElement.appendChild(removeMeContainer);

        return listElement;
    }

    /**
     * save object to local storage
     * @param {object} obj - object to be saved into local storage
     */
    function saveToLocalStorage(myObj) {

        console.log('autofill : saving');
        let saveMe = JSON.stringify(myObj);
        localStorage.setItem('autofillVariables', saveMe);
    }

    /**
     * creating an array of the configured autofill tags
     * Also performs simple validation to prevent empty values being saved
     * return {object} myObj - returns object array of autofill entries in list
     */
    function createArray() {

        let myObj = [];
        let saveAutofill = {};
        let autofillTag = '';
        let myRegex = '';
        let regexInput;
        let $myThis;

        // loop through configured autofills
        for (let z = 0; z < autofillOptionsList.children.length; z += 1) {

            $myThis = jQuery(autofillOptionsList.children[z]);
            autofillTag = jQuery.trim($myThis.find('.autofillTag').text()); // trim it just in case the manual autofill input is triggerd
            regexInput = $myThis.find('.regEx');
            myRegex = regexInput.val().trim();

            // validate input
            // do not save until input  empty
            if (myRegex === '') {
                autofillOptionsList.children[z].classList.add('myError');
                applyAutofills.classList.add('disabled');
                messageDisplay.textContent = 'Please enter a word to search for.';
                continue;
            } else {
                if (autofillOptionsList.children[z].classList.contains('myError')) {
                    autofillOptionsList.children[z].classList.remove('myError');
                }
            }

            saveAutofill[autofillTag] = myRegex;
        }

        myObj.push(saveAutofill);

        return myObj;
    }

    /**
     * save current state of the list, only if the configured list
     * has no errors
     */
    function saveState() {

        sortable.save();
        saveToLocalStorage(createArray());
    }

    /**
     * disabled 'magic' button if an entry is blank
     */
    function toggleMagicButton() {

        if (autofillOptionsList.getElementsByClassName('myError').length >= 1) {
            applyAutofills.classList.add('disabled');
        } else {
            applyAutofills.classList.remove('disabled');
        }
    }

    /**
     * Show error if input search field is empty
     */
    function validateList() {

        if (autofillOptionsList.getElementsByClassName('myError').length > 0) {
            messageDisplay.textContent = 'Please enter a word to search for.';
            jQuery('#toolMessageDisplay').animateCss('flash');
        } else {
            if (applyAutofills.classList.contains('disabled')) {
                applyAutofills.classList.remove('disabled');
            }

            if (messageDisplay.textContent !== '') {
                messageDisplay.textContent = '';
            }
        }
    }

    /**
     * will bind all new option list with a on text change listener
     * @param {element} elem - new autofill list option
     */
    function bindTextChangeListener(elem) {

        jQuery(elem).find('input').on('change', saveState);
        jQuery(elem).find('input').on('change', toggleMagicButton);
        jQuery(elem).find('input').on('change', validateList);
        jQuery(elem).find('input').on('keyup', saveState);
        jQuery(elem).find('input').on('keyup', toggleMagicButton);
        jQuery(elem).find('input').on('keyup', validateList);
    }

    /**
     * retrive object from local storage
     * retrive object from local storage
     * @param {object} obj - object to be saved into local storage
     */
    function getFromLocalStorage() {
        let returnMe;
        if (localStorage.getItem('autofillVariables') === null) {
            console.log('autofill : no local data');
            returnMe = defaultList;
        } else {
            console.log('autofill : local data found');
            returnMe = JSON.parse(localStorage.getItem('autofillVariables'));
            returnMe = returnMe[0];
        }
        return returnMe;
    }

    /**
     * will construct the autofill display area.
     * Will use data in local storage, if it exists
     */
    function buildAutofillOptions() {
        // console.log('begin buildAutofillOptions');
        let regReplace = getFromLocalStorage();
        let listElement;

        // build autofill list options IF there is a list that already exists
        if (regReplace) {
            // console.log('in IF statement');
            // loop through Legend Content list
            for (let key in regReplace) {

                if (regReplace.hasOwnProperty(key)) {

                    if (key === '') {
                        continue;
                    }
                    // debugger;
                    listElement = listItem(key, regReplace[key]);

                    // attach to legend list
                    autofillOptionsList.append(listElement);

                    // bind list item elements
                    bindTextChangeListener(listElement); // PROBLEM FUNCTION
                }
            }
        }
    }

    // ----------------------------------------
    // INTERNAL FUNCTIONS - END
    // ----------------------------------------

    // ----------------------------------------
    // METHODS - START
    // ----------------------------------------
    /**
     * Will show or hide the tool's panel
     * will also update the button's icon and hover text
     */
    function toggleToolPanel() {

        // all the animation END events
        let animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        let $autofillTool = jQuery('#autofillTool');
        let $autofillToolTab = jQuery('#autofillToolTab');

        if (autofillToolContainer.classList.contains('hide')) {

            // remove hide class from AUTOFILL TOOl Container
            autofillToolContainer.classList.remove('hide');
            autofillToolContainer.classList.add('show');
            // remove hide class from the AUTOFILL LIST OPTIONS container
            autofillOptionsContainer.classList.remove('hide');
            autofillOptionsContainer.classList.add('show');
            // animate the tool tab "show" action
            $autofillTool.animateCss('slideInDown');


        } else if (autofillToolContainer.classList.contains('show')) {

            // Slide the tool container up
            $autofillTool.animateCss('slideOutUp', function () {
                // remove hide class from AUTOFILL TOOL Container
                autofillToolContainer.classList.toggle('show');
                autofillToolContainer.classList.toggle('hide');
                // remove hide class from the AUTOFILL LIST OPTIONS container
                autofillOptionsContainer.classList.toggle('show');
                autofillOptionsContainer.classList.toggle('hide');

                // apply a slide down animation to the tab
                $autofillToolTab.animateCss('slideInDown', function () {
                    // unbind animation events
                    $autofillTool.off(animationEnd);
                    $autofillToolTab.off(animationEnd);
                });
            });
        }

        // Show active autofill list
        //        autofillOptionsContainer.classList.toggle('hide');

        // transform modes panel
        /*
        if (modeContainer.classList.contains('horizontal')) {
            modeContainer.classList.toggle('horizontal');
            modeContainer.classList.toggle('vertical');
        } else {
            modeContainer.classList.toggle('vertical');
            modeContainer.classList.toggle('horizontal');
        }
        */

        // transform button icon
        if (minimizeList.title.indexOf('Hide Tool') > -1) {
            minimizeList.innerHTML = 'Autofill Tool<br><i class="fas fa-eye fa-lg"></i>';
            minimizeList.title = 'Show Tool';
        } else {
            minimizeList.innerHTML = 'Autofill Tool<br><i class="fas fa-eye-slash fa-lg"></i>';
            minimizeList.title = 'Hide Tool';
        }
    }

    /**
     * Reset configured autofill tags to the default list
     */
    function resetValues() {

        if (window.confirm('Reset Values?')) {
            // erase current list
            autofillOptionsList.innerHTML = '';
            // remove stored variables from memory
            localStorage.removeItem('autofillVariables');
            // build default list
            buildAutofillOptions();
            // reset apply button if it is disabled
            toggleMagicButton();
            // update display message
            messageDisplay.textContent = 'Values Reset';
            jQuery('#toolMessageDisplay').animateCss('bounceIn');
            // save new values
            saveState();
        }
    }

    /**
     * create treewalker to navigate DOM and return all TEXT nodes
     * @param {object} base - base element to crawl for text nodes
     * @return {array} wordArray - array containing all text nodes on the page
     */
    function treeWalk(base) {

        let treeWalker = document.createTreeWalker(base, NodeFilter.SHOW_TEXT, null, false);
        let wordArray = [];

        while (treeWalker.nextNode()) {
            if (treeWalker.currentNode.nodeType === 3 && treeWalker.currentNode.textContent.trim() !== '') {
                wordArray.push(treeWalker.currentNode);
            }
        }
        return wordArray;
    }

    /**
     * Test if phone number
     * Checked format = 000-0000
     */
    function phoneNumberText(text) {

        let phoneRegex = /((\(\d{3}\) ?)|(\d{3}-))?\d{3}-\d{4}/g;

        if (phoneRegex.test(text)) {
            return RegExp.escape(text);
        }
        return '\\b' + RegExp.escape(text) + '\\b';
    }

    // --------------------------------------------------------------------------------
    // REPLACE AUTOFILL MODE
    // --------------------------------------------------------------------------------

    /**
     * Replaced matching words/phrases with the corresponding autofill tags
     * @param {array} wordList - array containing all the visible text in the edit area
     * @param {string} regReplace - text string to search for
     */
    function replaceText(wordList, regReplace) {

        wordList.forEach(function (n) {

            let text = n.nodeValue;

            // iterate through autofill array and replace matches in text
            // replace all instances of 'findMe' with 'autofillTag'
            for (let autofillTag in regReplace) {
                let findMe = regReplace[autofillTag];

                // if split phrases are needed
                if (findMe.indexOf('``') > -1) {
                    let findArray = findMe.split('``');
                    let arrayLength = findArray.length;
                    for (let a = 0; a < arrayLength; a += 1) {
                        let searchText = findArray[a].trim();
                        let findThis = phoneNumberText(searchText);
                        let myRegex = new RegExp(findThis, 'gi');

                        if (searchText === '') {
                            continue;
                        }

                        text = text.replace(myRegex, autofillTag);
                    }
                } else {
                    let findThis = phoneNumberText(findMe);
                    let myRegex = new RegExp(findThis, 'gi');
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
        let baseLength = baseElem.length;

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
        let recordLendth = recordEditWindow.length;
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

        const contentFrame = jQuery('iframe#cblt_content').contents();
        let siteEditorIframe = contentFrame.find('iframe#siteEditorIframe').contents();
        let viewerIframe;
        let cmsIframe;
        let myChild;
        let recordEditWindow;
        let regReplace = getFromLocalStorage(); // get stored autofill tags from local storage

        // run CMS Content Pop Up edit window IF WINDOW IS OPEN
        if (location.pathname.indexOf('editSite') >= 0 && siteEditorIframe.find('div#hiddenContentPopUpOuter').hasClass('opened')) {

            // save contents of cms content edit frame
            cmsIframe = siteEditorIframe.find('iframe#cmsContentEditorIframe').contents();

            // if quick CMS editor is open
            recordEditWindow = cmsIframe.find('div.main-wrap').find('.input-field').find('div[data-which-field="copy"]');

            // pass elements with children as base element for autofill replacing
            replaceTextCMS(recordEditWindow, regReplace);
        } else if (location.pathname.indexOf('editSite') >= 0 && !siteEditorIframe.find('div#hiddenContentPopUpOuter').hasClass('opened')) {

            // get contens of iframe
            viewerIframe = siteEditorIframe.find('iframe#viewer').contents();

            // return array of elements that have children
            myChild = viewerIframe.find('body').children().filter(function (index, value) {
                if (value.children.length !== 0) {
                    return this;
                }
            });

            // pass elements with children as base element for autofill replacing
            useAutofillTags(myChild, regReplace);

        } else if (location.pathname.indexOf('cms') >= 0) {
            // ---------------------------------------- CMS LOGIC

            // get contens of iframe
            recordEditWindow = contentFrame.find('div.main-wrap').find('.input-field').find('div[data-which-field="copy"]');

            // pass elements with children as base element for autofill replacing
            replaceTextCMS(recordEditWindow, regReplace);
        }
    }

    // --------------------------------------------------------------------------------
    // HIGHLIGHT AUTOFILL MODE
    // --------------------------------------------------------------------------------

    /**
     *   Replace markers with highlight span elemetns
     */
    function replaceMarkers(elm) {
        if (elm) {
            elm.innerHTML = elm.innerHTML.replace(/~~@(.*?)@~~/g, '<span class="highlightMe">$1</span>');
        }
    }

    /**
     * Replaced matching words/phrases with the corresponding autofill tags
     * @param {array} wordList - array containing all the visible text in the edit area
     * @param {string} regReplace - text string to search for
     */
    function highlightText(wordList, regReplace) {

        wordList.forEach(function (n) {

            let text = n.nodeValue;
            let elm = n.parentElement;

            // iterate through autofill array and replace matches in text
            // replace all instances of 'findMe' with 'autofillTag'
            for (let autofillTag in regReplace) {
                let findMe = regReplace[autofillTag];

                // if split phrases are needed
                if (findMe.indexOf('``') > -1) {
                    let findArray = findMe.split('``');
                    let arrayLength = findArray.length;
                    for (let a = 0; a < arrayLength; a += 1) {
                        let searchText = findArray[a].trim();
                        let findThis = phoneNumberText(searchText);
                        let myRegex = new RegExp(findThis, 'gi');

                        if (searchText === '') {
                            continue;
                        }

                        text = text.replace(myRegex, autofillTag);
                    }
                } else {
                    // create regex variable
                    let findThis = phoneNumberText(findMe);
                    let myRegex = new RegExp(findThis, 'gi');
                    text = text.replace(myRegex, `~~@${findMe}@~~`); // replace with highlight span
                }
            }

            n.nodeValue = text;

            // replace markers
            replaceMarkers(elm);
        });
    }

    /**
     * loop through word list array and replace text with autofill tags
     * @param {object} baseElem - base element to find and replace text with autofill tags
     * @param {array} regReplace - object array that contains the regExpressions and corresponding autofill tags
     */
    function highlightAutofillTags(baseElem, regReplace) {

        let wordList;
        let baseLength = baseElem.length;

        for (let z = 0; z < baseLength; z += 1) {
            // get all visible text on page
            wordList = treeWalk(baseElem[z]);
            highlightText(wordList, regReplace);
        }
    }

    /**
     * will walk through edittable portion of WSM window and perform text
     * replacing with data contained in the list area of tool
     * which will result in HIGHLIGHTING all the text that can be converted to AUTOFILL TAGS
     */
    function highlights() {
        // WSM MAIN WINDOW LOGIC

        const contentFrame = jQuery('iframe#cblt_content').contents();
        // this contains all the content seen when in the "Editor" tab
        let siteEditorIframe = contentFrame.find('iframe#siteEditorIframe').contents();
        // this will contain the actual page content
        let viewerIframe; // = siteEditorIframe.find('iframe#viewer');
        let viewerIframeContents; // = siteEditorIframe.find('iframe#viewer').contents();
        let cmsIframe;
        let myChild;
        let recordEditWindow;
        let regReplace = getFromLocalStorage(); // get stored autofill tags from local storage

        // minimize tool
        autofillTab.click();

        // run AUTOFILL REPLACER IF THE CMS Content Pop Up edit window IF WINDOW IS OPEN
        if (location.pathname.indexOf('editSite') >= 0 && siteEditorIframe.find('div#hiddenContentPopUpOuter').hasClass('opened')) {

            // save contents of cms content edit frame
            cmsIframe = siteEditorIframe.find('iframe#cmsContentEditorIframe').contents();

            // if quick CMS editor is open
            recordEditWindow = cmsIframe.find('div.main-wrap').find('.input-field').find('div[data-which-field="copy"]');

            // pass elements with children as base element for autofill replacing
            replaceTextCMS(recordEditWindow, regReplace);

            // run AUTOFILL REPLACER IF THE CMS Content Pop Up edit window IF WINDOW IS OPEN
        } else if (location.pathname.indexOf('editSite') >= 0 && !siteEditorIframe.find('div#hiddenContentPopUpOuter').hasClass('opened')) {

            // this will contain the actual page content
            viewerIframe = siteEditorIframe.find('iframe#viewer');

            // attach custom highlight styles inside iFrame page
            let highlightStyles = `
            .highlightMe {
                color: rgb(0, 0, 0);
                background: rgb(57, 255, 20);
            }`;
            const myHighlightStyles = document.createElement('style');
            myHighlightStyles.type = 'text/css';
            myHighlightStyles.id = 'highlightStyles';
            myHighlightStyles.innerHTML = highlightStyles;


            // Bind iFrame onload event
            viewerIframe[0].onload = function () {

                // store iframe page contents
                siteEditorIframe = contentFrame.find('iframe#siteEditorIframe').contents();
                viewerIframe = siteEditorIframe.find('iframe#viewer');
                viewerIframeContents = siteEditorIframe.find('iframe#viewer').contents();

                // attach styles to page
                viewerIframeContents.find('head').append(myHighlightStyles);

                // return array of elements that have children
                myChild = viewerIframeContents.find('body').children().filter(function (index, value) {
                    if (value.children.length !== 0) {
                        return this;
                    }
                });

                // pass elements with children as base element for autofill replacing
                highlightAutofillTags(myChild, regReplace);
            };

            viewerIframe[0].src = viewerIframe[0].src + '&disableAutofill=true';

        }
    }

    /**
     * apply 'hide' class to element
     * @param {object} event - element that will get the 'hide' class added to it class list
     */
    function hideMe(event) {

        if (!event.target.classList.contains('hide')) {
            event.target.classList.add('hide');
        }
        if (addButton.classList.contains('disabled')) {
            addButton.classList.remove('disabled');
        }
    }

    // ----------------------------------------
    // METHODS - END
    // ----------------------------------------

    /**
     * Converts the autofill tags in local memory to simple array
     * @return {object} autofill - contains a simple array with AUTOFILL tags ONLY
     */
    function localDataToString() {
        // console.log('localDataToString');
        var localData = getFromLocalStorage();
        var autofill = [];

        for (let localKey in localData) {
            autofill.push(localKey);
        }

        return autofill;
    }

    /**
     * Creates an active menu item that the tool will use to replace text with autofill tags
     * @param {object} elem - element that will get it's onclick event binded
     */
    function createAutofillDropdownMenu(elem) {

        elem.onclick = function () {
            elem.classList.add('disabled');

            let listElement = listItem(elem.textContent);
            autofillOptionsList.appendChild(listElement);
            let listLength = listElement.children.length;

            for (let y = 0; y < listLength; y += 1) {
                if (listElement.children[y].tagName === 'INPUT') {
                    listElement.children[y].focus();
                }
            }

            // hide drop down menu
            document.querySelector('ul.autofill-dropdown').classList.add('hide');

            // bind list item elements
            bindTextChangeListener(listElement);

            // save state of new list
            saveState();

        };
    }

    /**
     * SUCCESS BINDING EVENT
     * Build out drop down list with data gathered from JSON file
     * @param {OBJECT} listContainer - the UL element that will contain autofill options
     * @param {object} data - the autofill data that will be used to populate the options
     */
    function buildAutofillList(data) {
        // debugger;
        let localData = localDataToString();
        // build out drop down menu
        for (let myKey in data[0]) {
            // create 'li' for each autofill tag in the list
            let myListItem = document.createElement('li');
            myListItem.textContent = myKey;
            // if autofill tag is present in the active list, disable it
            if (localData.includes(myKey)) {
                myListItem.classList.add('disabled');
            }
            // add the list element to the 'drop down' list
            autofillDropdown.appendChild(myListItem);
            // bind listener to 'li' item
            createAutofillDropdownMenu(myListItem);
            // attach new 'li' to main list
            let tooltipText = data[0][myKey] ? data[0][myKey] : '**No tooltip infor available**';
            myListItem.title = tooltipText;
        }
    }

    /**
     * FAILURE BINDING EVENT
     * Will display a prompt message that the user can manually input the autofill tag
     * @return {function} Prompts user for input, upon successfull input, will bind event listeners and save
     */
    function bindAddAutofill() {
        // debugger;
        return function () {
            let autofillTag = window.prompt('Enter autofill tag for the new feild.', '%AUTOFILL_TAG_HERE%');

            if (autofillTag === null || autofillTag === '') {
                window.alert('please try again, please enter an autofill tag');
            } else if (localDataToString().includes(autofillTag)) {
                window.alert('please try again, autofill tag already present on list');
            } else {

                let listElement = listItem(autofillTag);
                autofillOptionsList.appendChild(listElement);

                // bind list item elements
                bindTextChangeListener(listElement);

                // save state of new list
                saveState();
            }
        };
    }

    /**
     * Bind onclick function dynamically depending on autofill JSON load
     * @param {bool} bool - boolean variable that will determine what method will be used
     */
    function addButtonEventListener(bool) {

        if (bool) {
            return function () {
                this.classList.add('disabled');
                autofillDropdown.classList.remove('hide');
                autofillDropdown.focus();
            };
        }
        return bindAddAutofill();
    }

    /**
     * read data from json file
     */
    function fetchJSON(url) {

        return new Promise(function (resolve, reject) {

            jQuery.getJSON(url)
                .done( /** resolve data */ function (json) {
                    resolve(json.autofill);
                })
                .fail( /** error */ function (xhr, status, err) {
                    reject(status + err.message);
                });
        });
    }

    /**
     * Start events to build the autofill 'drop down menu'
     */
    function getAutofillList() {

        fetchJSON(myURL).then((data) => {
            console.log('autofill : autofill list loaded.');
            addButton.onclick = addButtonEventListener(true);
            // build out drop down menu
            buildAutofillList(data);
        }).catch((error) => {
            console.log('autofill : autofill list failed to load, reverting to manual autofill entry method');
            console.log(error);
            addButton.onclick = addButtonEventListener(false);
        });
    }

    /**
     * Scan autofill drop down list and remove disable class
     * @param {object} elem - element that being removed from the configured list
     */
    function removeDisable(elem) {

        let autofillTag = elem.querySelector('.autofillTag').textContent;
        let dropDown = autofillDropdown.querySelectorAll('.disabled');
        let dropDownLength = dropDown.length;

        for (let z = 0; z < dropDownLength; z += 1) {
            if (autofillTag === dropDown[z].textContent) {
                dropDown[z].classList.remove('disabled');
            }
        }
    }

    /**
     * Escape characters to prevent malacious input from user
     */
    RegExp.escape = function (s) {

        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    };

    /**
     * css styles for tool
     */
    function styleTools() {

        let animate = document.createElement('link');
        animate.rel = 'stylesheet';
        animate.type = 'text/css';
        animate.href = 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.5.2/animate.min.css';

        let toolStyles = `
    #autofillTool {
        position: absolute;
        top: 0;
        left: 195px;
        width: auto;
        color: white;
        animation-duration: 1.5s;
        -webkit-animation-duration: 1.5s;
    }

    #toolMessageDisplay {
        display: inline-block;
        width: 80%;
        font-size: 13px;
        text-align: center;
        color: red;
    }

    #addAutofill {
        width: 90%;
        padding: 5px 30px;
    }

    .myButts {
        background: #824FD6;
        border-radius: 5px;
        color: #fff;
        border: 1px solid rgb(147, 143, 143);
    }

    .myButts:hover {
        background: #793CC4;
        cursor: pointer;
        cursor: hand;
    }

    #applyAutofills {
        display: inline-block;
        padding: 5px 30px;
        background: rgb(130, 198, 0);
    }

    #applyAutofills.disabled {
        background: #333;
    }

    #modeContainer {
        padding: 5px;
        color: black;
        background: rgb(234, 232, 232);
        border-bottom-right-radius: 5px;
    }

    #autofillToolContainer{
        background: rgb(234, 232, 232);
        padding: 10px;
        border-left: 1px solid rgb(130, 79, 214);
        border-right: 1px solid rgb(130, 79, 214);
        border-bottom: 1px solid rgb(130, 79, 214);
    }

    #autofillToolTab {
        padding: 5px 0 10px 0;
        text-align: center;
        width: 100px;
        font-size: 13px;
        background: rgb(130, 79, 214);
        border-radius: 0 0 50% 50%;
        cursor: pointer;
        cursor: hand;
        animation-duration: .75s;
        -webkit-animation-duration: .75s;
    }

    .vertical {
        position: absolute;
        right: -51px;
        width: 40px;
        top: 55px;
        border-top-right-radius: 5px;
        border-top: 1px solid rgb(130, 79, 214);
        border-bottom: 1px solid rgb(130, 79, 214);
        border-right: 1px solid rgb(130, 79, 214);
    }

    .horizontal {
        width: 115px;
        top: 30px;
        height: 50px;
        text-align: center;
    }

    .modes {
        margin: 5px 0;
        padding: 5px;
        width: 35px;
    }

    .horizontal .modes {
        margin: 5px 10px;
    }

    .minimizeList {

    }

    #defaultReset {
        position: relative;
        float: right;
        width: 10%;
        padding: 5px;
    }

    .secondary {
        background: rgb(234, 232, 232);
        color: rgb(130, 79, 214);
    }

    .secondary:hover {
        background: rgb(130, 79, 214);
        color: rgb(234, 232, 232);
    }

    .my-handle {
        border: 1px dotted #793CC4;
        padding: 2px 6px 2px 5px;
        cursor: move;
        cursor: -webkit-grabbing;
    }

    .autofillTag {
        width: 120px;
        display: inline-block;
        text-align: center;
        color: black;
        word-wrap: break-word;
    }

    .regEx {
        background: #793CC4;
        color: #fff;
        border: 1px solid rgb(255, 255, 255);
        line-height: 1.25rem;
        text-indent: 10px;
        margin: 0 0 0 15px;
        width: 200px !important;
    }

    .autofillEntry {
        width: auto;
        padding: 5px 10px;
        border: 1px solid #793CC4;
        margin: 3px 10px;
        color: #793CC4;
    }

    .js-remove {
        cursor: pointer;
        cursor: hand;
        padding: 0 0 0 10px;
        display: inline-block;
    }

    .leftMarg {
        margin: 0 0 0 15px;
    }

    .autofill-dropdown {
        height: 500px;
        width: 100%;
        overflow: auto;
        position: absolute;
        background: #0A0808;
    }

    .autofill-dropdown:focus {
        outline: 0;
    }

    .autofill-dropdown li {
        text-align: center;
        font-size: 12px;
        padding: 5px 0;
    }

    .autofill-dropdown li:hover {
        background: rgba(121, 60, 196, .5);
        cursor: pointer;
        cursor: hand;
    }

    .autofillOptionsContainer {
        width: 450px;
    }

    .hide {
        display: none;
    }

    .disabled {
        pointer-events: none;
        background: rgba(0,0,0,.75);
        cursor: no-drop;
    }

    .myError {
        border: 1px solid red;
    }

    .chosen {
      color: #fff;
      background-color: rgb(130, 198, 0);
    }

    .active,
    .active:hover {
        background: rgb(130, 198, 0);
    }

    .highlightMe {
        background: yellow;
    }
    `;
        const myStyles = document.createElement('style');
        myStyles.type = 'text/css';
        myStyles.id = 'toolStyles';
        myStyles.innerHTML = toolStyles;

        // attach styles to page
        document.head.append(myStyles);
        document.head.append(animate);
    }

    /**
     *   Check which mode is currently selected
     *   This will determine what action is run when the user clicks the MAGIC ICON button
     */
    function checkModes() {
        if (replaceAutofillsButt.classList.contains('active')) {
            applyAutofills.onclick = autofills;
        } else if (highlightAutofillsButt.classList.contains('active')) {
            applyAutofills.onclick = highlights;
        }
    }

    /**
     *   Actions to perform when the REPLACE MODE button is pressed
     */
    function replaceModeActions() {

        // save MODE in local storage
        shared.saveValue('mode', 'replacer');

        // if REPLACE MODE button element DOES NOT contain the active class add it
        if (!replaceAutofillsButt.classList.contains('active')) {
            replaceAutofillsButt.classList.add('active');
            replaceAutofillsButt.classList.remove('secondary');
            replaceAutofillsButt.title = 'replace *active*';
        }

        // if HIGHLIGHT MODE button element DOES NOT contain the active class add it
        if (highlightAutofillsButt.classList.contains('active')) {
            highlightAutofillsButt.classList.remove('active');
            highlightAutofillsButt.classList.add('secondary');
            highlightAutofillsButt.title = 'highlight';
        }

        // update Autofill button onclick event
        checkModes();
    }

    /**
     *   Actions to perform when the REPLACE MODE button is pressed
     */
    function highlightModeActions() {

        // save MODE in local storage
        shared.saveValue('mode', 'highlight');

        // if REPLACE MODE button element DOES NOT contain the active class add it
        if (!highlightAutofillsButt.classList.contains('active')) {
            highlightAutofillsButt.classList.add('active');
            highlightAutofillsButt.classList.remove('secondary');
            highlightAutofillsButt.title = 'highlight *active*';
        }

        // if HIGHLIGHT MODE button element DOES NOT contain the active class add it
        if (replaceAutofillsButt.classList.contains('active')) {
            replaceAutofillsButt.classList.remove('active');
            replaceAutofillsButt.classList.add('secondary');
            replaceAutofillsButt.title = 'replace';
        }

        // update Autofill button onclick event
        checkModes();
    }

    /**
     *   Bind the actions to perform when clicking the MODE buttons
     */
    function bindElementEvents() {
        replaceAutofillsButt.onclick = replaceModeActions;
        highlightAutofillsButt.onclick = highlightModeActions;
        defaultReset.onclick = resetValues;
        autofillDropdown.onblur = hideMe;
        autofillTab.onclick = toggleToolPanel;
    }

    /**
     *   Reveal tool tab
     */
    function revealToolTab() {
        // remove hide class
        autofillTab.classList.toggle('hide');
        // animate the "reveal" action
        jQuery('#autofillToolTab').animateCss('slideInDown');
    }

    // ----------------------------------------
    // ****************************************
    // RUN TOOL
    // ****************************************
    // ----------------------------------------
    styleTools();
    defaultValues();
    defaultPhoneNumber();
    buildAutofillOptions();
    getAutofillList();
    loadToolSettings();
    checkModes();
    bindElementEvents();

    console.log(autofillOptionsContainer.getAttribute('data-max-height'));

    // Load Tool once window finishes loading
    window.onload = revealToolTab;

    // ----------------------------------------
    // ****************************************
    // SORTABLE
    // ****************************************
    // ----------------------------------------

    //    let myList = document.getElementById('autofillOptions');
    //    console.log('myList');
    //    console.log(myList);
    //    var sortable = Sortable.create(myList);
    //    console.log(sortable);
    let sortable = Sortable.create(autofillOptionsList, {
        'group': 'autofillOptions',
        //        'delay': 0,
        'sort': true,
        //        'handle': '.my-handle',
        //        'chosenClass': 'chosen',
        //        'animation': 150,
        // Element dragging started
        //        'onStart': function () {
        //        'onStart': function (evt) {
        //            console.log('onstart');
        //            console.log(evt);
        //            console.log(evt.oldIndex); // element index within parent
        //        },
        // Changed sorting within list
        //        'onUpdate': function (evt) {
        //            console.log('onUpdate');
        //            console.log(evt);
        // same properties as onEnd
        //        },
        // Element dragging ended
        //        'onEnd': function (evt) {
        //            console.log('onEnd');
        //            let itemEl = evt.item; // dragged HTMLElement
        //            console.log(itemEl); // target list
        //            console.log(evt.to); // target list
        //            console.log(evt.from); // previous list
        //            console.log(evt.oldIndex); // element's old index within old parent
        //            console.log(evt.newIndex); // element's new index within new parent
        //        },
        'store': {
            /**
             * Get the order of elements. Called once during initialization.
             * @param   {Sortable}  sortable
             * @returns {Array}
             */
            'get': function (sortable) {
                //                console.log('get');
                //                        console.log(this);
                //            'get': function (sortable) {

                //                let order = localStorage.getItem(this.options.group.name);
                let order = localStorage.getItem(sortable.options.group.name);
                return order ? order.split('|') : [];
            },

            /**
             * Save the order of elements. Called onEnd (when the item is dropped).
             * @param {Sortable}  sortable
             */
            'set': function (sortable) {
                //            'set': function (sortable) {
                //                console.log('set');

                let order;
                if (typeof Storage !== 'undefined') {
                    //                    order = this.toArray();
                    order = sortable.toArray();
                    //                    localStorage.setItem(this.options.group.name, order.join('|'));
                    localStorage.setItem(sortable.options.group.name, order.join('|'));
                } else {
                    // Sorry! No Web Storage support..
                }
            },
        },
        'filter': '.js-remove',
        /**
         * event, if list item is removed
         */
        'onFilter': function (evt) {

            //            console.log('onfilter');
            let item = evt.item;
            let ctrl = evt.target;

            if (Sortable.utils.is(ctrl, '.js-remove')) { // Click on remove button
                item.parentNode.removeChild(item); // remove sortable item

                // run validate check
                validateList();

                // display red message at top of tool
                messageDisplay.textContent = 'Item Removed';
                jQuery(messageDisplay).animateCss('bounceIn');

                // Save state
                //                sortable.save();
                //                this.save();
                saveToLocalStorage(createArray());
                removeDisable(item);
            }
        },
        // Called by any change to the list (add / update / remove)
        //        'onSort': function (evt) {
        //
        //            //            console.log(evt);
        //            //            console.log('changing values');
        //
        //            // update display message
        //            messageDisplay.textContent = 'Values Saved';
        //            jQuery('#toolMessageDisplay').animateCss('bounceIn');
        //
        //            // Save state
        //            this.save();
        //            saveToLocalStorage(createArray());
        //        },
    });

})();
