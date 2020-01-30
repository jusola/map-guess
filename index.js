var svg = SVG().addTo('#body').size('100%', '100%').panZoom({zoomMin: 0.5, zoomMax: 20});
var viewbox = svg.viewbox(0, 0, document.getElementById('body').clientWidth, document.getElementById('body').clientHeight);
var input = document.getElementById('filein');
var image = null;

var mode0 = document.getElementById('mode0');
var mode1 = document.getElementById('mode1');
mode0.style.display = 'none';
mode1.style.display = 'none';
var report = document.getElementById('report');
report.style.display = 'none';
var needed = document.getElementById('needed');
var dotName = document.getElementById('nameOfDot');

var zoomPoint = {x: 0, y: 0};
var zoomLevel = 1;

var mode = 0; //0=guess loc, 1=guess name

var currentDot = {};

var guesses = 0;
var wrongs = 0;

var currentWrongs = 0;

var editMode = false;

var dots = [];
var currentDots = [];

window.onload = function(){
    loadJSON((res)=>{
      let newDots = JSON.parse(res);
      newDots.forEach(element => {
        console.log("Adding dot", element);
        addDot(element.x, element.y, element.name);
      });
    });
};

window.onkeyup = ev=>{
  console.log(ev);
  if(ev.key == 'Enter' && mode == 1){
    guess(dotName.value);
  }
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
  let newCircle = svg.circle(5).fill({color: '#ff0066', opacity: 0.5});
  newCircle.attr({ cx: x, cy: y });
  if(name == undefined){
    name = dotName.value;
  }
  if(name == ''){
    return;
  }
  dots.push({x: x, y:y, name: name, circle: newCircle});
  dotName.value = '';
  newCircle.click(()=>{
    if(mode == 0){
      guess(name);
    }
  });
}

function guess(name){
  guesses++;
  if(match(name, currentDot.name)){
    nextDot();
    currentWrongs = 0;
    report.innerHTML = "oikein";
    report.style.display = 'block';
    setTimeout(()=>{
      report.style.display = 'none';
    }, 3000);
    
  }else{
    if(mode == 1){
      wrongs++;
      currentWrongs++;
      dotName.value = '';
      if(currentWrongs >= 3){
        dotName.placeholder=currentDot.name;
      }
    }

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
  location.reload();
}

function clear(){
  localStorage.removeItem('dots');
  dots = [];
  location.reload();
}

function nextDot(){
  if(mode == 1){
    if(currentDot.circle){
      currentDot.circle.fill({color: '#ff0066', opacity: 0.5});
    }
  }
  currentDots = currentDots.filter(elem=>{
    return elem.name !== currentDot.name;
  });
  if(currentDots.length == 0){
    document.getElementById('score').innerHTML = "Pisteet: "+(guesses-wrongs)+"/"+dots.length;
    needed.innerHTML = "";
  }else{
    currentDot = currentDots[Math.floor(Math.random() * currentDots.length)];
    needed.innerHTML = currentDot.name;
  }
  if(mode == 1){
    dotName.value = '';
    dotName.placeholder = 'Kirjoita tähän paikan nimi';
    dotName.focus();
    console.log(currentDot);
    let box = viewbox.viewbox();
    svg.animate().zoom(1);
    svg.animate().zoom(4, {x: currentDot.x, y: currentDot.y});
    currentDot.circle.fill({color: '#66ff00', opacity: 0.5});
  }
  
}

function start(newMode){
  document.getElementById('score').innerHTML = "";
  if(mode == 1){
    if(currentDot.circle){
      currentDot.circle.fill({color: '#ff0066', opacity: 0.5});
    }
  }
  if(newMode === 0 || newMode === 1){
    mode=newMode;
  }
  currentDots = Array.from(dots);
  if(mode == 0){
    mode0.style.display = 'block';
    mode1.style.display = 'none';
  }else if(mode == 1){
    mode1.style.display = 'block';
    mode0.style.display = 'none';
  }
  guesses = 0;
  wrongs = 0;
  console.log(currentDots);
  nextDot();
}


function toggleEdit(){
  editMode = !editMode;
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
  xobj.open('GET', 'dots.json?'+ (new Date()).getTime(), true);
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
      callback(xobj.responseText);
    }
  };
  xobj.send(null);  
}

svg.on('zoom', (ev)=>{
  zoomLevel = ev.detail.level;
  zoomPoint = ev.detail.focus;
});

function match(a, b){
  a=a.replace(/ /g,'');
  b=b.replace(/ /g,'');
  console.log(a);
  console.log(b);
  a=a.replace(/ø/g, 'o');
  b=b.replace(/ø/g, 'o');
  console.log(a);
  console.log(b);
  a=a.toLowerCase();
  b=b.toLowerCase();
  console.log(a);
  console.log(b);
  a=a.split(',');
  b=b.split(',');
  console.log(a);
  console.log(b);
  return a.some(item => b.includes(item));
}

renderImage();