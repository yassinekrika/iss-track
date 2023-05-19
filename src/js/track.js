const solarPanelOrientation = document.querySelector('#switch');
s.addEventListener('change', function() {
    if (solarPanelOrientation.checked) {
      console.log("Solar panel orientation is checked..");
    } else {
      console.log("Solar panel orientation is not checked..");
    }
  });