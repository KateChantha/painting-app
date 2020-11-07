const activeToolEl = document.getElementById('active-tool');
const brushColorTool = document.getElementById('brush-color');
const brushIcon = document.getElementById('brush');
const brushSize = document.getElementById('brush-size');
const brushSlider = document.getElementById('brush-slider');
const bucketColorTool = document.getElementById('bucket-color');
const eraser = document.getElementById('eraser');
const clearCanvasBtn = document.getElementById('clear-canvas');
const saveStorageBtn = document.getElementById('save-storage');
const loadStorageBtn = document.getElementById('load-storage');
const clearStorageBtn = document.getElementById('clear-storage');
const downloadBtn = document.getElementById('download');
const { body } = document;

/* =================
 * set up a canvas
 * =================
 * https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Basic_usage
 */
const canvas = document.createElement('canvas');
canvas.id = 'canvas';
// call getContext and specify "2d" to get a CanvasRenderingContext2D interface
const context = canvas.getContext('2d');

// =================
// Global Variables
// =================
/** this value is matching initial value in html **/
let currentSize = 10;
let bucketColor = '#FFFFFF';
let currentColor = '#A51DAB';
// keeping track whether using Brush or Eraser
let isEraser = false;
let isMouseDown = false;
let drawnArray = [];

// ==========================
// Function & Event Listener
// ==========================
// Formatting Brush Size
function displayBrushSize() {
  brushSize.textContent = currentSize < 10 ? `0${currentSize}` : currentSize;
}

// Setting Brush Size
brushSlider.addEventListener('change', () => {
  currentSize = brushSlider.value;
  displayBrushSize();
});

// Setting Brush Color
brushColorTool.addEventListener('change', () => {
  isEraser = false;
  currentColor =`#${brushColorTool.value}`;
});

// Setting Background Color
// event listener is going to trigger a fucntion
bucketColorTool.addEventListener('change', () => {
  bucketColor = `#${bucketColorTool.value}`;
  // fill canvas with current bucket color
  // create canvas will wipe out everything
  createCanvas();
  // restore existing drawing after setting a canvas background
  restoreCanvas();
});

// Eraser
// Eraser is going paint with bucketColor(background color)
eraser.addEventListener('click', () => {
  isEraser = true;
  brushIcon.style.color = 'white';
  // active tool is shown in black
  eraser.style.color = 'black';
  activeToolEl.textContent = 'Eraser';
  // set current color and current brush size
  currentColor = bucketColor;
  currentSize = 50;
  brushSlider.value = 50;
  displayBrushSize();
});

// Switch back to Brush
function switchToBrush() {
  isEraser = false;
  activeToolEl.textContent = 'Brush';
  // switch backroud active icon
  brushIcon.style.color = 'black';
  eraser.style.color = 'white';
  // switch back to brush color and brush size
  currentColor = `#${brushColorTool.value}`;
  currentSize = 10;
  brushSlider.value = 10;
  // update the brush size display
  displayBrushSize();
}

// Event Listener: switchToBrush
brushIcon.addEventListener('click', switchToBrush);

// Create Canvas
function createCanvas() {
  // dynamicly set canvas dimension base on user current window W & H.
  // get current width and heigth value
  canvas.width = window.innerWidth;
  // subtract tool bar H at the top(50px)
  canvas.height = window.innerHeight - 50;
  // background color of the canvas set to bucket color 
  context.fillStyle = bucketColor;
  // fill space with dynamic value of canvas w and H
  context.fillRect(0,0, canvas.width, canvas.height);
  body.appendChild(canvas);
  // when page first loaded, set active tool to brush by default
  switchToBrush();
}

// Clear Canvas will get rid of all line drawing but not restting background color
clearCanvasBtn.addEventListener('click', () => {
  createCanvas();
  // reset drawnArray
  drawnArray = [];
  // Active Tool
  activeToolEl.textContent = 'Canvas Cleared';
  setTimeout(switchToBrush, 1500);
});

// Draw what is stored in DrawnArray
function restoreCanvas() {
  for (let i = 1; i < drawnArray.length; i++) {
    context.beginPath();
    context.moveTo(drawnArray[i - 1].x, drawnArray[i - 1].y);
    context.lineWidth = drawnArray[i].size;
    // 'round' setting per mouse down event
    context.lineCap = 'round';
    if (drawnArray[i].eraser) {
      // if the value is eraser, then use bucketColor(bg color) as a storke
      context.strokeStyle = bucketColor;
    } else {
      // therwise use the color value that store in drawnArray
      context.strokeStyle = drawnArray[i].color;
    }
    // use lineto() and stroke() to redraw the line
    context.lineTo(drawnArray[i].x, drawnArray[i].y);
    context.stroke();
  }
}

// Store Drawn Lines in DrawnArray
function storeDrawn(x, y, size, color, erase) {
  const line = {
    x,
    y,
    size,
    color,
    erase,
  };
  console.log(line);
  drawnArray.push(line);
}

// ==========================
// MOUSE EVENT
// ==========================

// Get Mouse Position
function getMousePosition(event) {
  // return x and y value where cursor is 
  const boundaries = canvas.getBoundingClientRect();
  return {
    x: event.clientX - boundaries.left,
    y: event.clientY - boundaries.top,
  };
}

// Mouse Down 
canvas.addEventListener('mousedown', (event) => {
  isMouseDown = true;
  const currentPosition = getMousePosition(event);
  // console.log('mouse is clicked', currentPosition);
  context.moveTo(currentPosition.x, currentPosition.y);
  context.beginPath();
  context.lineWidth = currentSize;
  context.lineCap = 'round';
  context.strokeStyle = currentColor;
});

// Mouse Move
canvas.addEventListener('mousemove', (event) => {
  if (isMouseDown) {
    const currentPosition = getMousePosition(event);
    // console.log('mouse is moving', currentPosition);
    context.lineTo(currentPosition.x, currentPosition.y);
    context.stroke();
    // store value on mouse move(draw line)
    storeDrawn(
      currentPosition.x,
      currentPosition.y,
      currentSize,
      currentColor,
      isEraser,
    );
  } else {
    // store undefined whenever mouse is moving between drawing or earsing somethig
    storeDrawn(undefined);
  }
});

// Mouse Up
canvas.addEventListener('mouseup', () => {
  isMouseDown = false;
  // console.log('mouse is unclicked');
});

// Save to Local Storage
saveStorageBtn.addEventListener('click', () => {
  localStorage.setItem('savedCanvas', JSON.stringify(drawnArray));
  // Active Tool
  activeToolEl.textContent = 'Canvas Saved';
  setTimeout(switchToBrush, 1500);
});

// Load from Local Storage
loadStorageBtn.addEventListener('click', () => {
  // check if there is savedCanvas in localStorage
  if (localStorage.getItem('savedCanvas')) {
    // then load and restore canvas
    drawnArray = JSON.parse(localStorage.savedCanvas);
    restoreCanvas();
  // display messgge on Active Tool
    activeToolEl.textContent = 'Canvas Loaded';
    setTimeout(switchToBrush, 1500);
  } else {
    activeToolEl.textContent = 'No Canvas Found';
    setTimeout(switchToBrush, 1500);
  }

});

// Clear Local Storage
clearStorageBtn.addEventListener('click', () => {
  localStorage.removeItem('savedCanvas');
  // display messgge on Active Tool
  activeToolEl.textContent = 'Local Storage Cleared';
  setTimeout(switchToBrush, 1500);
});

// Download Image
downloadBtn.addEventListener('click', () => {
  // target is an <a> tag
  // set quality to max value (1)
  downloadBtn.href = canvas.toDataURL('image/jpeg', 1);
  downloadBtn.download = 'paint-image.jpeg'
  // display messgge on Active Tool
  activeToolEl.textContent = 'Image File Saved';
  setTimeout(switchToBrush, 1500);
});

// ===========
// On Load
// ===========
createCanvas();
