
/**
 * Builds a modal and attaches it to the webpage.
 * @param {string} name - the name of the modal
 * @param {string} html - the content of the modal
 * @return {object} Promise.resolve or reject
 */
export default function attachModal(name, html) {
  return new Promise((resolve, reject) => {
    // build latest changes modal
    const myModal = document.createElement("div");
    const modalCode =
      `<div class="modal fade" id="${name}Modal" tabindex="-1" role="dialog" aria-labelledby="${name}Title" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
              <div class="modal-body">
                ${html}
              </div>
            </div>
          </div>
        </div>`;

    // add the modal content + the Latest Changes Markdown Doc Content
    myModal.innerHTML = modalCode;

    // attach modal to page
    document.body.appendChild(myModal);

    if (document.getElementById(`${name}Modal`)) {
      resolve(`${name} Modal Attached`);
    } else {
      reject(`${name} Modal Not Attached`);
    }
  });
}
