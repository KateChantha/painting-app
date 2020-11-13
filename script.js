const DISPLAY_TIME = 1500;
const { body } = document;
const activeToolEl = document.getElementById('active-tool');
const brushColorTool = document.getElementById('brush-color');
const brushIcon = document.getElementById('brush');
const brushSize = document.getElementById('brush-size');
const brushSlider = document.getElementById('brush-slider');
const bucketColorTool = document.getElementById('bucket-color');
const bucketIcon = document.getElementById('bucket-icon');
const eraser = document.getElementById('eraser');
const clearCanvasBtn = document.getElementById('clear-canvas');
const saveStorageBtn = document.getElementById('save-storage');
const loadStorageBtn = document.getElementById('load-storage');
const clearStorageBtn = document.getElementById('clear-storage');
const downloadBtn = document.getElementById('download');
const undoBtn = document.getElementById('undo'); 
const redoBtn = document.getElementById('redo'); 


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
let partialDrawnArray = [];  
let steps = 10; 
let stepsIdentifier = []; 
// redoBtn.disabled = true; 
// undoBtn.disabled = true; 

// ==========================
// Function 
// ==========================
// Create Canvas
function createCanvas() {
  // dynamicly set canvas dimension base on user current window W & H.
  // get current width and heigth value
  canvas.width = window.innerWidth;
  // subtract tool bar H at the top(50px)
  canvas.height = window.innerHeight - 70;
  // background color of the canvas set to bucket color 
  context.fillStyle = bucketColor;
  // fill space with dynamic value of canvas w and H
  context.fillRect(0,0, canvas.width, canvas.height);
  body.appendChild(canvas);
  // when page first loaded, set active tool to brush by default
  // switchToBrush(); // - - - 
}

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

// Setting Buckbet/ Background Color
// event listener is going to trigger a fucntion
bucketColorTool.addEventListener('change', () => {
  activeToolEl.textContent = 'Background Color';
  bucketIcon.style.backgroundColor = 'darkturquoise';
  brushIcon.style.backgroundColor = 'gainsboro';
  eraser.style.backgroundColor = 'gainsboro'; 
  bucketColor = `#${bucketColorTool.value}`;
  // fill canvas with current bucket color
  // create canvas will wipe out everything
  createCanvas();
  // restore existing drawing after setting a canvas background
  restoreCanvas(drawnArray);
});

// Eraser
// Eraser is going paint with bucketColor(background color)
eraser.addEventListener('click', () => {
  isEraser = true;
  brushIcon.style.backgroundColor = 'gainsboro'; //+++++
  bucketIcon.style.backgroundColor = 'gainsboro';
  eraser.style.backgroundColor = 'darkturquoise'; // +++++++++
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
  // brushIcon.style.color = 'black'; 
  brushIcon.style.backgroundColor = 'darkturquoise'; // +++++++++++
  eraser.style.backgroundColor = 'gainsboro';  // +++++++++++
  bucketIcon.style.backgroundColor = 'gainsboro';
  // switch back to brush color and brush size
  currentColor = `#${brushColorTool.value}`;
  currentSize = 10;
  brushSlider.value = 10;
  // update the brush size display
  displayBrushSize();
}

// Dispaly time for a message 
function brushTimeSetTimeOut(ms) {
  setTimeout(switchToBrush, ms);
}

// UNDO functionality 
undoBtn.addEventListener('click', () =>{  
  
  createCanvas();
  undoBtn.disabled = false;
  redo.disabled = false;

  //creat partial drawn array based on how many steps to back(skipping the undefined values)
  stepsIdentifier = [];
  if (partialDrawnArray.length === 0) {    
    for (let i = drawnArray.length -1; i < drawnArray.length; i--) {
      if(drawnArray[i].color !== undefined ){
        stepsIdentifier.push(drawnArray[i]);
      }
      if(stepsIdentifier.length === steps){
        break;
      }      
    }
  } else {
    for (let i = partialDrawnArray.length -1; i >= 0 ; i--) {
      if(partialDrawnArray[i].color !== undefined ){
        stepsIdentifier.push(partialDrawnArray[i]);
      }
      if(stepsIdentifier.length === steps){
        break;
      }
    }  
  };  

  if(stepsIdentifier.length < steps){
    partialDrawnArray = [];
  } else {
    let tillToUndo = drawnArray.indexOf(stepsIdentifier[stepsIdentifier.length - 1]);
    partialDrawnArray = drawnArray.slice(0, tillToUndo);
  }  

  // restore canvas with partial drawnArray 
  restoreCanvas(partialDrawnArray);   
});

// Redo functionality
redoBtn.addEventListener('click', () =>{
  
  //creat partial drawn array based on how many steps to forward(skipping the undefined values)
  stepsIdentifier = [];
  if (partialDrawnArray.length === 0) {    
    for (let i = 0; i < drawnArray.length; i++) {
      if(drawnArray[i].color !== undefined ){
        stepsIdentifier.push(drawnArray[i]);
      }
      if(stepsIdentifier.length === steps){
        break;
      }      
    }
  } else {
    for (let i = partialDrawnArray.length -1; i < drawnArray.length ; i++) {
      if(drawnArray[i].color !== undefined ){
        stepsIdentifier.push(drawnArray[i]);
      }
      if(stepsIdentifier.length === steps){
        break;
      }
    }  
  };  

  if(stepsIdentifier.length < steps){
    partialDrawnArray = [...drawnArray];
  } else {
    let tillToUndo = drawnArray.indexOf(stepsIdentifier[stepsIdentifier.length - 1]);
    partialDrawnArray = drawnArray.slice(0, tillToUndo);
  }
  
  // Re-store canvas fro partial drawnArray
  restoreCanvas(partialDrawnArray); 
       
});


// ==========================
// Event Listener
// ==========================

// Event Listener: switchToBrush
brushIcon.addEventListener('click', switchToBrush);


// Clear Canvas will get rid of all line drawing but not restting background color
clearCanvasBtn.addEventListener('click', () => {
  createCanvas();
  // reset drawnArray
  drawnArray = [];
  // Active Tool
  activeToolEl.textContent = 'Canvas Cleared';
  brushTimeSetTimeOut(DISPLAY_TIME);
});

// Draw what is stored in DrawnArray 
function restoreCanvas(arr) {
  for (let i = 1; i < arr.length; i++) {
    context.beginPath();
    context.moveTo(arr[i - 1].x, drawnArray[i - 1].y);
    context.lineWidth = arr[i].size;
    // 'round' setting per mouse down event
    context.lineCap = 'round';
    if (arr[i].eraser) {
      // if the value is eraser, then use bucketColor(bg color) as a storke
      context.strokeStyle = bucketColor;
    } else {
      // therwise use the color value that store in drawnArray
      context.strokeStyle = drawnArray[i].color;
    }
    // use lineto() and stroke() to redraw the line
    context.lineTo(arr[i].x, drawnArray[i].y);
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

  if(partialDrawnArray.length > 0 ){
    console.log(line);
    drawnArray.push(line);
    partialDrawnArray.push(line);
  } else {
    console.log(line);
    drawnArray.push(line);
  }
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

    if(partialDrawnArray.length > 0){
      drawnArray = [...partialDrawnArray];       
      partialDrawnArray = [];  
      storeDrawn(
        currentPosition.x,
        currentPosition.y,
        currentSize,
        currentColor,
        isEraser,
      );
    } else if(partialDrawnArray.length === 0 && redoBtn.disabled === false){
      drawnArray = [];       
      partialDrawnArray = [];            
      storeDrawn(
        currentPosition.x,
        currentPosition.y,
        currentSize,
        currentColor,
        isEraser,
      );
    } else{
      
      storeDrawn(
        currentPosition.x,
        currentPosition.y,
        currentSize,
        currentColor,
        isEraser,
      );
    }
    undoBtn.disabled = false;
    redoBtn.disabled = true; 
    eraser.disabled = false; 
  

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
  brushTimeSetTimeOut(DISPLAY_TIME);
});

// Load from Local Storage
loadStorageBtn.addEventListener('click', () => {
  // check if there is savedCanvas in localStorage
  if (localStorage.getItem('savedCanvas')) {
    // then load and restore canvas
    drawnArray = JSON.parse(localStorage.savedCanvas);
    restoreCanvas(drawnArray);
  // display messgge on Active Tool
    activeToolEl.textContent = 'Canvas Loaded';
    brushTimeSetTimeOut(DISPLAY_TIME);
  } else {
    activeToolEl.textContent = 'No Canvas Found';
    brushTimeSetTimeOut(DISPLAY_TIME);
  }

});

// Clear Local Storage
clearStorageBtn.addEventListener('click', () => {
  localStorage.removeItem('savedCanvas');
  // display messgge on Active Tool
  activeToolEl.textContent = 'Local Storage Cleared';
  brushTimeSetTimeOut(DISPLAY_TIME);
});

// Download Image
downloadBtn.addEventListener('click', () => {
  // target is an <a> tag
  // set quality to max value (1)
  downloadBtn.href = canvas.toDataURL('image/jpeg', 1);
  downloadBtn.download = 'paint-image.jpeg'
  // display messgge on Active Tool
  activeToolEl.textContent = 'Image File Saved';
  brushTimeSetTimeOut(DISPLAY_TIME);
});

// ===========
// On Load
// ===========
createCanvas();