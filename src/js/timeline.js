(function () {
    "use strict";
  
    // define variables
    var items = document.querySelectorAll("li");
  
    // check if an element is in viewport
    // http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport
    function isElementInViewport(el) {
      var rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <=
          (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    }
  
    function callbackFunc() {
      for (var i = 0; i < items.length; i++) {
        if (isElementInViewport(items[i])) {
          items[i].classList.add("in-view");
        }
      }
    }
  
    // listen for events
    window.addEventListener("load", callbackFunc);
    window.addEventListener("resize", callbackFunc);
    window.addEventListener("scroll", callbackFunc);
  })();

  function scrollFunction() {
    var mouse = document.querySelector(".scroll-downs");
    mouse.classList.add('scrolled')
 }




function atEnd() {
    var c = [document.scrollingElement.scrollHeight, document.body.scrollHeight, document.body.offsetHeight].sort(function(a,b){return b-a}) // select longest candidate for scrollable length
    return (window.innerHeight + window.scrollY + 200 >= c[0]) // compare with scroll position + some give
}
function scrolling() {
    if (atEnd()) 
    var shadow = document.querySelector(".shadow");
    shadow.classList.add('reachedButtom')
}
window.addEventListener('scroll', scrolling, {passive: true});



window.onscroll = scrollFunction;