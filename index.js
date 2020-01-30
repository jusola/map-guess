var svg = SVG().addTo('#body').size('100%', '100%').panZoom({zoomMin: 0.5, zoomMax: 20});
var viewbox = svg.viewbox(0, 0, document.getElementById('body').clientWidth, document.getElementById('body').clientHeight);
var input = document.getElementById('filein');
var image = null;
var report = document.getElementById('report');
report.style.display = 'none';
var needed = document.getElementById('needed');
var zoomPoint = {x: 0, y: 0};
var zoomLevel = 1;

var currentDot = {};

var dotName = document.getElementById('nameOfDot');
var editMode = false;

var dots = [];

window.onload = function(){
  var dotsIn = null;//localStorage.getItem('dots');
  if(!dotsIn){
    loadJSON((res)=>{
      let newDots = JSON.parse(res);
      newDots.forEach(element => {
        console.log("Adding dot", element);
        addDot(element.x, element.y, element.name);
      });
    });
  }else{
    let newDots = JSON.parse(dotsIn);
    newDots.forEach(element => {
      console.log("Adding dot", element);
      addDot(element.x, element.y, element.name);
    });
  }
};

window.onkeyup = ev=>{

};


input.onchange = function(val){ 
    // getting a hold of the file reference
    var file = val.target.files[0]; 
    
    // setting up the reader
    var reader = new FileReader();
    reader.readAsDataURL(file); // this is reading as data url
    // here we tell the reader what to do when it's done reading...
    reader.onload = function(readerEvent){
      var dataURL = readerEvent.target.result; // this is the content!
      localStorage.setItem('image', dataURL);
      renderImage();
    };
};

document.getElementById('selectFileButton').onclick = function(){
    input.click();
};

function renderImage(){
  var imageData = localStorage.getItem('image');
  if(imageData){
    image = svg.image(imageData);
  }else{
    image = svg.image('image.svg');
  }
}

svg.click(function(event) {
  if(editMode){
    let box = viewbox.viewbox();
    var x = event.clientX/zoomLevel + box.x;
    var y = event.clientY/zoomLevel + box.y;
    addDot(x,y);
  }
});

function addDot(x, y, name){
  let newCircle = svg.circle(5).fill({color: '#ff0066', opacity: 0.25});
  newCircle.attr({ cx: x, cy: y });
  if(name == undefined){
    name = dotName.value;
  }
  if(name == ''){
    return;
  }
  dots.push({x: x, y:y, name: name});
  dotName.value = '';
  newCircle.click(()=>{
    guess(name);
  });
  localStorage.setItem('dots', JSON.stringify(dots));
}

function guess(name){
  if(name == currentDot.name){
    nextDot();
    report.innerHTML = "oikein";
    report.style.display = 'block';
    setTimeout(()=>{
      report.style.display = 'none';
    }, 3000);
    
  }else{
    console.log("Wrong");
    report.innerHTML = "väärin";
    report.style.display = 'block';
    setTimeout(()=>{
      report.style.display = 'none';
    }, 3000);
  }
}

function remove(name){
  dots = dots.filter((elem)=>{
    return elem.name != name;
  });
  localStorage.setItem('dots', JSON.stringify(dots));
  location.reload();
}

function clear(){
  localStorage.removeItem('dots');
  dots = [];
  location.reload();
}

function nextDot(){
  currentDot = dots[Math.floor(Math.random() * dots.length)];
  needed.innerHTML = currentDot.name;
}

function toggleEdit(){
  editMode = !editMode;
}

function loadFromFile(){

}

function downloadOBJ(){
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dots));
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href",     dataStr);
  downloadAnchorNode.setAttribute("download", "dots.json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}


function loadJSON(callback) {   
  var xobj = new XMLHttpRequest();
      xobj.overrideMimeType("application/json");
      xobj.open('GET', 'dots.json', true); // Replace 'my_data' with the path to your file
     xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
          // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
          callback(xobj.responseText);
        }
  };
  xobj.send(null);  
}

svg.on('zoom', (ev)=>{
  zoomLevel = ev.detail.level;
  zoomPoint = ev.detail.focus;
});

renderImage();