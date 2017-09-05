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
  private doc: HTMLElement;
  private hpDiv: HTMLElement;
  private readonly display: string = 'block';   // the default display style of the higher plane
  private readonly borderWidth: number = 3;    // border width - just so we can see it


  constructor(docCanvas: HTMLElement) {

    this.doc = docCanvas;
  
    this.hpDiv = document.createElement("div");
    this.hpDiv.id = 'higherPlane';
    this.hpDiv.tabIndex = -1; // make it focusable

    this.hpDiv.style.position = 'fixed';
    this.hpDiv.style.display = this.display;

    this.resize();
    this.active(false);

    // register all the events. At least for now :)
    this.doc.addEventListener('wheel', (e) => { this.handleInputEvent(e) });
    this.doc.addEventListener("click", (e) => { this.handleInputEvent(e); });

    this.doc.addEventListener("keydown", (e) => { this.handleInputEvent(e); });
    this.doc.addEventListener("keyup", (e) => { this.handleInputEvent(e); });
    this.doc.addEventListener("scroll", (e) => { this.handleInputEvent(e); });
    
    this.doc.addEventListener("pointerdown", (e) => { this.docPtrHandler(e); });
    this.doc.addEventListener("pointerup", (e) => { this.docPtrHandler(e); });
    this.doc.addEventListener("pointermove", (e) => { this.docPtrHandler(e); });
    this.doc.addEventListener("pointerover", (e) => { this.docPtrHandler(e); });
    this.doc.addEventListener("gotpointercapture", (e) => { this.docPtrHandler(e); });
    this.doc.addEventListener("lostpointercapture", (e) => { this.docPtrHandler(e); });

    this.hpDiv.addEventListener("pointerdown", (e) => { this.hpPtrHandler(e); });
    this.hpDiv.addEventListener("pointerup", (e) => { this.hpPtrHandler(e); });
    this.hpDiv.addEventListener("pointermove", (e) => { this.hpPtrHandler(e); });
    this.hpDiv.addEventListener("pointerover", (e) => { this.hpPtrHandler(e); });
    this.hpDiv.addEventListener("gotpointercapture", (e) => { this.hpPtrHandler(e); });
    this.hpDiv.addEventListener("lostpointercapture", (e) => { this.hpPtrHandler(e); });
    
    // add the div into the DOM
    document.getElementsByTagName('body')[0].appendChild(this.hpDiv);
  }

  visible(state: boolean) {
    this.hpDiv.style.display = state ? this.display : 'none';
  }

  isVisible() : boolean {
    return this.hpDiv.style.display === this.display;
  }

  active(state : boolean) {
    if(state) {
      this.hpDiv.style.setProperty('pointer-events', 'auto');
      this.hpDiv.style.border = this.borderWidth + "px dotted orangered";
    }
    else {
      this.hpDiv.style.setProperty('pointer-events', 'none');
      this.hpDiv.style.border = this.borderWidth + "px dotted gray";
    }
  }

  // PointerEvent forwarder between two elements
  forwardPointerEvent(e: PointerEvent, elem: HTMLElement) {
    let event = new PointerEvent(e.type, {
      bubbles: true,
      cancelable: true,
      pointerId: e.pointerId,
      pointerType: e.pointerType,
      clientX: e.clientX,
      clientY: e.clientY
    });
    elem.dispatchEvent(event);
  }

  // HigherPlane - handle pointer events
  hpPtrHandler(e: PointerEvent) {
    console.log("HP Event: " + e.type + " PtrID: " + e.pointerId);
    if (e.pointerType === 'pen') {
      if (e.type === 'pointerup') {
        this.active(false);
        this.forwardPointerEvent(e, this.doc);
        e.preventDefault();
      }
      if (e.type === 'pointerdown') {

      }
      if(e.type === 'pointermove') {
        console.log('HP Pen Moved CX='+ e.clientX+ ', CY='+e.clientY);
      }
    }
  }

  // document canvas handle pointer events
  docPtrHandler(e: PointerEvent) {
    console.log("Text Event: " + e.type + " PtrID: " + e.pointerId);
    if (e.pointerType === 'pen') {
      if (e.type === 'pointerdown' && this.isVisible()) {
        this.forwardPointerEvent(e, this.hpDiv);
        this.active(true);
        e.preventDefault();
      }
      if (e.type === 'pointerup') {
      }
    }
  }

  // this is to handle various events on the document
  // when more done - we will also have to do stuff on 
  // the HigherPlane
  handleInputEvent(e: UIEvent) {
    console.log("Object Event: " + e.type);
  }

  resize() {
    if (this.hpDiv.style.display !== 'none') {
      this.hpDiv.style.left = this.doc.offsetLeft - this.borderWidth + 'px';
      this.hpDiv.style.top = this.doc.offsetTop + 'px';
      this.hpDiv.style.width = this.doc.offsetWidth + 'px';
      this.hpDiv.style.height = this.doc.offsetHeight - this.borderWidth + 'px';
    }
  }
}

// -----------------------------------------------------------------------------------
// Page Global Stuff executed on Page Loaded
// -----------------------------------------------------------------------------------
var higherPlane;
document.addEventListener("DOMContentLoaded", function () {

  // make a higher plane
  higherPlane = new HigherPlane($("#content"));

  // higher plane is visible
  (<HTMLInputElement>$("#hpToggle")).checked = true;
  $("#hpToggle").addEventListener("click", (e) => {
    higherPlane.visible((<HTMLInputElement>e.target).checked);
    higherPlane.resize();
  });
  
  // make sure that the windows resizes
  window.addEventListener("resize", (e) => {
    higherPlane.resize();
  });

  // load the text
  loadBook('./SherlockShort.html', '#content');
});

