
//Capstone-projects page
let iframeShown = false;

function toggleIframe(index) {
    var viewer = document.getElementById("viewer-" + index);
    var iframe = viewer.getElementsByTagName("iframe")[0];
    if (iframeShown) {
        iframe.style.display = "none";
        iframeShown = false;
      } else {
        iframe.style.display = "block";
        iframeShown = true;
      }
}