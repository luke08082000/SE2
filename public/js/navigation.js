var dropdownBtns = document.getElementsByClassName("dropdown-btn");
  for (var i = 0; i < dropdownBtns.length; i++) {
    // Add a click event listener to each button
    dropdownBtns[i].addEventListener("click", function() {
      // Toggle the class "active" on the dropdown content
      this.classList.toggle("active");
      var dropdownContent = this.nextElementSibling;
      if (dropdownContent.style.display === "block") {
        dropdownContent.style.display = "none";
      } else {
        dropdownContent.style.display = "block";
      }
    });
  }
  