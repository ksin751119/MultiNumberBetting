// Set Data to innerHTML
function setData(docElementId, html) {
    console.log(html);
    console.log(docElementId);
    document.getElementById(docElementId).innerHTML = html;
}  

/**
 * Adds a list element in the 0th position
 * Removes the last element if the length exceeds provided ln
 */
