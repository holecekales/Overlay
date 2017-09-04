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
      con.innerHTML = xhr.responseText;
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
  readonly display: string = 'block';   // the default display style of the higher plane
  readonly borderWidth : number = 3;    // border width - just so we can see it

  constructor(name: string) {

    this.host = $(name);

    this.hpDiv = document.createElement("div");
    this.hpDiv.id = 'higherPlane';

    this.hpDiv.style.border = this.borderWidth + "px dotted orangered";
    this.hpDiv.style.position = 'fixed';
    this.hpDiv.style.display = this.display;
    
    this.resize(null);

    this.hpDiv.addEventListener("wheel", (e) => { this.handleScroll(e); });
    this.hpDiv.addEventListener("click", (e) => { this.passEvent(e); });
    this.hpDiv.addEventListener("keydown", (e) => { this.passEvent(e); });
    this.hpDiv.addEventListener("keyup", (e) => { this.passEvent(e); });
    this.hpDiv.addEventListener("beforeinput", (e) => { this.passEvent(e); });
    this.hpDiv.addEventListener("input", (e) => { this.passEvent(e); });
    this.hpDiv.addEventListener("mousemove", (e) => { this.passEvent(e); });
    this.hpDiv.addEventListener("mousedown", (e) => { this.passEvent(e); });
    this.hpDiv.addEventListener("mouseup", (e) => { this.passEvent(e); });

    document.getElementsByTagName('body')[0].appendChild(this.hpDiv);
  }

  visible(state: boolean) {
    this.hpDiv.style.display = state == false ? 'none' : this.display;
  }

  resize(e : Event) {
    this.hpDiv.style.left = this.host.offsetLeft - this.borderWidth + 'px';
    this.hpDiv.style.top = this.host.offsetTop + 'px';
    this.hpDiv.style.width = this.host.offsetWidth + 'px';
    this.hpDiv.style.height = this.host.offsetHeight - this.borderWidth + 'px';
  } 

  handleScroll(e) {
    this.host.scrollTop += e.deltaY;
  }

  passEvent(e) {
    this.visible(false);
    let underElem = <HTMLElement>document.elementFromPoint(e.clientX, e.clientY);
    let event = new UIEvent(e.type, e);
    let result = underElem.dispatchEvent(event);
    this.visible(true);
    return result;
  }
}

// -----------------------------------------------------------------------------------
// Page Global Stuff 
// -----------------------------------------------------------------------------------
var higherPlane;
document.addEventListener("DOMContentLoaded", function () {
  
  // make a higher plane
  higherPlane = new HigherPlane("#content");
  
  $("#hpToggle").addEventListener("click", (e) => {
    higherPlane.visible((<HTMLInputElement>e.target).checked);
  });

  window.addEventListener("resize", (e)=>{
    higherPlane.resize(e);
  });

  // load the text
  loadBook('./SherlockShort.html', '#content');
});

