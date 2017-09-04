// -----------------------------------------------------------------------------------
// Utility Functions
// -----------------------------------------------------------------------------------
function $(id: string): HTMLElement {
  return <HTMLElement>(document.querySelector(id));
}

function scrollToView(id: string): void {
  let e = document.getElementsByName(id);
  if (e.length > 0) {
    e[0].scrollIntoView({ behavior: 'smooth' });
  }
}

// -----------------------------------------------------------------------------------
// loadBook (for local content and no server doesn't work in Chrome) 
// -----------------------------------------------------------------------------------
function loadBook(url: string, elem: string): void {
  let con = $(elem);
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function (e) {
    if (xhr.readyState == 4 && xhr.status == 200) {
      con.innerHTML += xhr.responseText;
    }
  }
  xhr.open("GET", url, true);
  xhr.setRequestHeader('Content-type', 'text/html');
  xhr.send();
}


// -----------------------------------------------------------------------------------
// HigherPlane class
// -----------------------------------------------------------------------------------
class HigherPlane {
  private host: HTMLElement;
  private hpDiv: HTMLElement;
  private readonly display: string = 'block';   // the default display style of the higher plane
  private readonly borderWidth: number = 3;    // border width - just so we can see it

  constructor(name: string) {

    this.host = $(name);
    // trying to make the host focusable // $$$ does not work as expected 
    if(this.host.tabIndex == 0) {
      this.host.tabIndex = -1;
    }
  
    this.hpDiv = document.createElement("div");
    this.hpDiv.id = 'higherPlane';
    this.hpDiv.tabIndex = -1; // make it focusable

    this.hpDiv.style.border = this.borderWidth + "px dotted orangered";
    this.hpDiv.style.position = 'fixed';
    this.hpDiv.style.display = this.display;

    this.resize();

    // mouse events
    this.hpDiv.addEventListener("wheel", (e) => { this.handleScrollWheel(e); });
    this.hpDiv.addEventListener("click", (e) => { this.handleMouseEvent(e); });
    this.hpDiv.addEventListener("mousemove", (e) => { this.handleMouseEvent(e); });
    this.hpDiv.addEventListener("mousedown", (e) => { this.handleMouseEvent(e); });
    this.hpDiv.addEventListener("mouseup", (e) => { this.handleMouseEvent(e); });

    // key events 
    this.hpDiv.addEventListener("keydown", (e) => { this.handleKeys(e); });
    this.hpDiv.addEventListener("keyup", (e) => { this.handleKeys(e); });

    // add the div into the DOM
    document.getElementsByTagName('body')[0].appendChild(this.hpDiv);
  }

  visible(state: boolean) {
    if (state) {
      this.hpDiv.style.display = this.display;
      this.resize();
    }
    else {
      this.hpDiv.style.display = 'none';
    }
  }

  resize() {
    if (this.hpDiv.style.display == 'none')
      return;
    this.hpDiv.style.left = this.host.offsetLeft - this.borderWidth + 'px';
    this.hpDiv.style.top = this.host.offsetTop + 'px';
    this.hpDiv.style.width = this.host.offsetWidth + 'px';
    this.hpDiv.style.height = this.host.offsetHeight - this.borderWidth + 'px';
  }

  handleScrollWheel(e) {
    this.host.scrollTop += e.deltaY;
    return true;
  }

  handleKeys(e) {

    let result: boolean = false;

    if (e.type === 'keydown') {
      if (e.keyCode === 33)              // page up
        this.host.scrollTop -= this.host.offsetHeight * 0.9;
      else if (e.keyCode === 34)         // page down
        this.host.scrollTop += this.host.offsetHeight * 0.9;
      else if (e.keyCode === 35)         // end
        this.host.scrollTop = this.host.scrollHeight;  // we need the right number
      else if (e.keyCode === 36)         // home
        this.host.scrollTop = 0;
      else if (e.keyCode === 38)         // up arrow
        this.host.scrollTop -= 86;      // we need the right number
      else if (e.keyCode === 40)         // down arrow
        this.host.scrollTop += 86;      // we need the right number
      result = true;
    }
    else 
      result = this.forwardEvent(e);
    
    console.log('handleKeys: ' + e.type + ' return: ' + result);
    return result;
  }


  // handler of MouseEvents
  handleMouseEvent(e : MouseEvent) {
    this.hpDiv.style.setProperty('pointer-events', 'none');
    let underElem = <HTMLElement>document.elementFromPoint(e.clientX, e.clientY);
    let event = new MouseEvent(e.type, e); 
    let result = underElem.dispatchEvent(event);
    this.hpDiv.style.setProperty('pointer-events', 'auto');
    this.hpDiv.focus();
    if (e.type !== 'mousemove')
      console.log('handleMouseEvent: ' + e.type + ' return: ' + result);
  }

  // generic event forwarder
  forwardEvent(e : Event, evtContuctor? : any) {
    this.visible(false);
    let underElem = null;
    if((<MouseEvent>e).clientX === undefined) {
      underElem = this.host;
      underElem.focus();
    }
    else {
      underElem = <HTMLElement>document.elementFromPoint((<MouseEvent>e).clientX, (<MouseEvent>e).clientY);
    }
    
    if(evtContuctor === undefined) evtContuctor = UIEvent;

    let event = new evtContuctor(e.type, e); 
    let result = underElem.dispatchEvent(event);
    this.visible(true);
    this.hpDiv.focus();
    if (e.type !== 'mousemove')
      console.log('forwardEvent: ' + e.type + ' return: ' + result);
    return result;
  }
}

// -----------------------------------------------------------------------------------
// Page Global Stuff executed on Page Loaded
// -----------------------------------------------------------------------------------
var higherPlane;
document.addEventListener("DOMContentLoaded", function () {

  // make a higher plane
  higherPlane = new HigherPlane("#content");

  $("#hpToggle").addEventListener("click", (e) => {
    higherPlane.visible((<HTMLInputElement>e.target).checked);
  });
  // higher plane is visible
  (<HTMLInputElement>$("#hpToggle")).checked = true;

  // make sure that the windows resizes
  window.addEventListener("resize", (e) => {
    higherPlane.resize();
  });

  // load the text
  loadBook('./SherlockShort.html', '#content');
});

