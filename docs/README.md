# Read Me

## Autofill Tool

![Autofill Tool](.gitbook/assets/whattoollookslike-1.jpg)

### Description

* This tool will crawl the editor window and replace all matching text with the designated autofill tag.
* **Primarily meant for use WITH the migration tool.**

#### Working Environment\(s\)

* Only works in **Next Gen Mode \(Next Gen toggle = ON\)**
* Only works in **WSM \(Editor\) and CMS \(Content Library\)**
  * **Changes made in Editor**, changes are not permanent and will revert to original text upon page reload. Main purpose of the tool would is to make migrating copy text from external sites easier.
  * **Changes made in CMS \(Content Library\)**, are not permanent UNTIL you save the changes via one of the save button located at the top right area of the page.

#### Additional Details

* Tool will auto save after every change to the input areas.
  * Adding text
  * Deleting autofill entries
  * Adding autofill entries
* Tool now resets to defaults if you switch from web-id to web-id.
  * **The tool does this upon loading.**
  * The message display you see when you show the autofill list is in place just to remind you that the tool was reset.

### Suggested Use of Tool

#### During the Migration Process

1. Begin the migration process of an internal or external page.
2. On a blank landing page, choose external page to migrate.
3. **Get** the URL of the external page
4. Choose the bucket the page will go into
5. **THE AUTOFILL TAG REPLACER TOOL**
6. Continue with the normal steps to migrate over the content

#### During Page Editing

1. Choose a card to edit
2. Choose to edit **Content**
3. A pop up will appear.
4. **RUN THE AUTOFILL TAG REPLACER TOOL**
5. Save changes via **save** button.

### Tool Buttons

#### Magic Wand Button

* This will trigger the tool "text replace" functionality.

![Magic Wand Button](.gitbook/assets/apply_autofills-1.jpg)

#### Magic Eye Button

* This will hide / show main panel for the tool.

![Show Tool](.gitbook/assets/unhide_panel-1.png)

![Hide Tool](.gitbook/assets/hide_panel.png)

#### Autofill Entry

* Where you will enter the custom text to be replaced on the web page.

![Autofill Entry](.gitbook/assets/autofillentry-2.jpg)

#### Add Autofill

* Will add a new autofill entry to the tool.

![Add Autofill Button](.gitbook/assets/add_autofill%20%281%29.jpg)

#### Reset Button

* Will reset all of the current autofill entries to the default list.

![Reset Button](.gitbook/assets/reset-2.jpg)

#### Report Bug Button

* Links directly to the GitHub repo where you can submit a bug report.

![Bug Report Button](.gitbook/assets/bug%20%281%29.jpg)

#### Latest Changes Button

* View the latest changes to the tool.

![Latest Changes Button](.gitbook/assets/latestchanges-1.jpg)

#### Request Enhancement Button

* Links directly to the GitHub repo where you can submit an enhancement request.

![Enhancement Request Button](.gitbook/assets/enhancement%20%281%29.jpg)



