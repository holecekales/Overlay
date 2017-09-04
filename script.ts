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
  readonly display : string = 'block';

  constructor(name: string) {

    this.host = $(name);

    this.hpDiv = document.createElement("div");
    this.hpDiv.id = 'higherPlane';

    let borderWidht = 3;
    this.hpDiv.style.border = borderWidht + "px dotted orangered";
    this.hpDiv.style.position = 'fixed';
    this.hpDiv.style.display = 'block';
    this.hpDiv.style.left = this.host.offsetLeft - borderWidht + 'px';
    this.hpDiv.style.top = this.host.offsetTop + 'px';
    this.hpDiv.style.width = this.host.offsetWidth + 'px';
    this.hpDiv.style.height = this.host.offsetHeight - borderWidht + 'px';

    this.hpDiv.addEventListener("wheel", (e) => { this.passEvent(e); });
    this.hpDiv.addEventListener("click", (e) => { this.passEvent(e); });
    this.hpDiv.addEventListener("keydown", (e) => { this.passEvent(e); });
    this.hpDiv.addEventListener("keyup", (e) => { this.passEvent(e); });
    this.hpDiv.addEventListener("beforeinput", (e) => { this.passEvent(e); });
    this.hpDiv.addEventListener("input", (e) => { this.passEvent(e); });

    document.getElementsByTagName('body')[0].appendChild(this.hpDiv);
  }

  visible(state : boolean) {
    if(state == false) {
      this.hpDiv.style.display = 'none';
    }
    else 
      this.hpDiv.style.display = this.display;
  }

  handleScroll(e) {
    this.host.scrollTop += e.deltaY;
  }

  passEvent(e) {
    let s = this.hpDiv.style.display;
    this.hpDiv.style.display = 'none';
    let underElem = <HTMLElement>document.elementFromPoint(e.clientX, e.clientY);
    // let underElem = this.host;
    
    // let event = new MouseEvent("click", {
    //   bubbles: true,
    //   cancelable: true,
    //   clientX: e.clientX,
    //   clientY: e.clientY,
    // });

    if(event.type == 'wheel') {
      console.log(e.deltaY);
        event = new WheelEvent(e.type, e);
    }
    else {
      event = new UIEvent(e.type, e);
    }

    // e.target = underElem;
    underElem.dispatchEvent(event);

    if(s)
      this.hpDiv.style.display = s; 
    else 
      this.hpDiv.style.display = ''; 
    return false;
  }
}

// -----------------------------------------------------------------------------------
// Page Global Stuff 
// -----------------------------------------------------------------------------------
var higherPlane;
document.addEventListener("DOMContentLoaded", function () {
  higherPlane = new HigherPlane("#content");
  $("#hpToggle").addEventListener("click", (e)=>{
    higherPlane.visible((<HTMLInputElement>e.target).checked);
  });
  loadBook('./SherlockShort.html', '#content');
});

