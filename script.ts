
function $(id : string) : HTMLElement {
  return <HTMLElement>(document.querySelector(id));
}

class MyCanvas {
  private host : HTMLElement;
  private ctx : CanvasRenderingContext2D;
  constructor(name : string) 
  {
    let canvas = document.createElement("canvas");
    this.host = $(name);
    this.host.appendChild(canvas);
    this.ctx = canvas.getContext("2d");
  }
}

var canvas;
document.addEventListener("DOMContentLoaded", function () {
  canvas = new MyCanvas("body"); 
});

