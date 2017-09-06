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
// Interface IPoint2d
// -----------------------------------------------------------------------------------
interface IPoint2d {
  x: number;
  y: number;
}

interface IStrokePoint extends IPoint2d {
  type: number;  // 0 == moveTo; 1 == lineTo; 2 == last one 
}

// -----------------------------------------------------------------------------------
// HigherPlane class
// -----------------------------------------------------------------------------------
class HigherPlane {
  private readonly display: string = 'block';   // the default display style of the higher plane
  private readonly borderWidth: number = 3;    // border width - just so we can see it

  private doc: HTMLElement;
  private hpDiv: HTMLElement;
  private hpCanvas: HTMLCanvasElement;
  private hpCtx: CanvasRenderingContext2D;

  public drawWithMouse : boolean = false;

  private stroke: IStrokePoint[] = [];

  constructor(docCanvas: HTMLElement) {

    this.doc = docCanvas;

    this.hpDiv = document.createElement("div");
    this.hpDiv.id = 'higherPlane';
    this.hpDiv.tabIndex = -1; // make it focusable

    this.hpDiv.style.position = 'absolute';
    this.hpDiv.style.display = this.display;

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

    // now create the HTML canvas
    this.hpCanvas = document.createElement('canvas');
    this.hpCanvas.id = 'hpCanvas';
    this.hpCanvas.width = 100;
    this.hpCanvas.height = 100;
    this.hpCanvas.style.position = "absolute";
    // this.hpCanvas.style.border = "1px solid #19cdfa";
    this.hpCtx = this.hpCanvas.getContext("2d");
    this.hpDiv.appendChild(this.hpCanvas);

    // resize everything to match the content
    this.resize();
  }

  visible(state: boolean) {
    this.hpDiv.style.display = state ? this.display : 'none';
  }

  isVisible(): boolean {
    return this.hpDiv.style.display === this.display;
  }

  active(state: boolean) {
    if (state) {
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
    // console.log("HP Event: " + e.type + " PtrID: " + e.pointerId);
    if (e.pointerType === 'pen' || (e.pointerType === 'mouse' && this.drawWithMouse)) {
      if (e.type === 'pointerup') {
        this.addStrokePoint(e, 2);
        this.active(false);
        this.forwardPointerEvent(e, this.doc);
        e.preventDefault();
      }
      if (e.type === 'pointerdown') {
        this.addStrokePoint(e, 0);
      }
      if (e.type === 'pointermove') {
        this.addStrokePoint(e, 1);
      }
    }
  }

  // document canvas handle pointer events
  docPtrHandler(e: PointerEvent) {
    // console.log("Text Event: " + e.type + " PtrID: " + e.pointerId);
    if (e.pointerType === 'pen' || (e.pointerType === 'mouse' && this.drawWithMouse)) {
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
    if(e.type == 'scroll')
      this.canvasRedraw();
  }

  resize() {
    if (this.hpDiv.style.display !== 'none') {
      this.hpDiv.style.left = this.doc.offsetLeft - this.borderWidth + 'px';
      this.hpDiv.style.top = this.doc.offsetTop + 'px';
      this.hpDiv.style.width = this.doc.offsetWidth + 'px';
      this.hpDiv.style.height = this.doc.offsetHeight - this.borderWidth + 'px';

      // resize the HTML canvas as well
      // we should probably cache the scrollbar width;
      let w1 = parseInt(window.getComputedStyle(this.doc, null).borderLeftWidth);
      let w2 = parseInt(window.getComputedStyle(this.doc, null).borderRightWidth);
      let scrollbarWidth = this.doc.offsetWidth - this.doc.clientWidth - w1 - w2;
      this.hpCanvas.width = this.hpDiv.clientWidth - scrollbarWidth;
      this.hpCanvas.height = this.hpDiv.clientHeight;
      this.canvasRedraw();
    }
  }

  addStrokePoint(e: PointerEvent, ptType: number) {
    let ptX = e.clientX - this.hpDiv.offsetLeft;
    let ptY = e.clientY - this.hpDiv.offsetTop;
    this.stroke.push({ x: ptX, y: ptY+this.doc.scrollTop, type: ptType });
    if (ptType === 0) {
      this.hpCtx.strokeStyle = '#9131cc';
      this.hpCtx.lineJoin = "round";
      this.hpCtx.lineWidth = 3;
  
      this.hpCtx.beginPath();
      let ptY = e.clientY - this.hpDiv.offsetTop;
      this.hpCtx.moveTo(ptX, ptY);
    }

    if (ptType === 1) {
      this.hpCtx.lineTo(ptX, ptY);
      // to avoid jagies, i need to redraw the entire canvas
      this.hpCtx.stroke(); 
    // this.canvasRedraw();
    }

    if (ptType === 2) {
      this.hpCtx.lineTo(ptX, ptY);
      this.hpCtx.stroke();
      // $$$ This does not belong here
      this.canvasRedraw();
    }
  }

  canvasRedraw() {
    this.hpCtx.clearRect(0, 0, this.hpCtx.canvas.width, this.hpCtx.canvas.height); // Clears the canvas
    let last = this.stroke.length;

    for (let i = 0; i < last; i++) {
      if (this.stroke[i].type === 0) {
        this.hpCtx.strokeStyle = '#9131cc';
        this.hpCtx.lineJoin = "round";
        this.hpCtx.lineWidth = 3;

        this.hpCtx.beginPath();
        this.hpCtx.moveTo(this.stroke[i].x, this.stroke[i].y-this.doc.scrollTop);
      }

      if (this.stroke[i].type === 1) {
        this.hpCtx.lineTo(this.stroke[i].x, this.stroke[i].y-this.doc.scrollTop);
      }

      if (this.stroke[i].type === 2 || (this.stroke[i].type === 1 && i == last-1)) {
        this.hpCtx.lineTo(this.stroke[i].x, this.stroke[i].y-this.doc.scrollTop);
        this.hpCtx.stroke();
      }
    }
  }

  clear() {
    this.stroke = [];
    this.canvasRedraw();
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
  $("#mouseDraw").addEventListener("click", (e) => {
    higherPlane.drawWithMouse =  (<HTMLInputElement>e.target).checked;
  });

  $("#clear").addEventListener("click", (e) => {
    higherPlane.clear();
  });

  // make sure that the windows resizes
  window.addEventListener("resize", (e) => {
    higherPlane.resize();
  });

  // load the text
  loadBook('./SherlockShort.html', '#content');
});

