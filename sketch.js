let img;

//States
let polygons;
let currentPoly;
let isMovingVertex;

let colors = [
  "#804674",
  "#FF5F00",
  "#5755FE",
  "#FF3EA5",
  "#45CFDD",
  "#3CCF4E"
]

let state;

//Buttons
let pen_btn;
let select_btn;
let clear_btn;
let save_btn;
let color_picker;

function preload() {
  img = loadImage(IMG_PATH);
  init();
}

function init() {
  polygons = [];
  state = "select";

  currentPoly = null;
  isMovingVertex = false;

  pen_btn = createButton("Pencil");
  select_btn = createButton("Select");
  clear_btn = createButton("clear");
  save_btn = createButton("save");
  color_picker = createColorPicker('deeppink');

  select_btn.position(0, 10);
  pen_btn.position(0, 35);
  clear_btn.position(0, 60);
  save_btn.position(0, 85);
  color_picker.position(0, 200);

  select_btn.mousePressed(() => state = "select");
  pen_btn.mousePressed(createPoly);
  clear_btn.mousePressed(() => {
    init();
  });
  save_btn.mousePressed(() => {
    savePolygons();
  });
}

function setup() {
  createCanvas(img.width * SCALE + SPACING_X, img.height * SCALE);
  img.resize(img.width * SCALE, img.height * SCALE);
  image(img, 0, 0);

  console.log(PREV_POLYGONS);
}

function draw() {
  background(BACKGROUND_COLOR);
  translate(SPACING_X, 0);
  image(img, 0, 0);

  if(PREV_POLYGONS != undefined) {
    for(let i = 0; i < PREV_POLYGONS["polygons"].length; i++) {
      let coords = PREV_POLYGONS["polygons"][i];
      polygons.push(new Polygon(colors[int(random(colors.length))], SPACING_X));

      currentPoly = polygons[polygons.length - 1];
      for(let j = 0; j < coords.length - 1; j+=2) {
        let x = coords[j] * (img.width * SCALE);
        let y = coords[j + 1] * (img.height * SCALE);
        
        currentPoly.addVertex(x, y); 
      }
      currentPoly.isClosed = true;
    }

    PREV_POLYGONS = undefined;
  }

  if (state == "drawing")
    cursor(CROSS);
  else
    cursor(ARROW);

  if (polygons.length > 0) {
    for (let i = 0; i < polygons.length; i++) {
      let poly = polygons[i];
      poly.display(state);
    }
  }
}

function createPoly() {
  polygons.push(new Polygon(color_picker.value(), SPACING_X, img.width, img.height));
  currentPoly = polygons[polygons.length - 1];
  state = "drawing";
}

function mousePressed() {
  if (state == "drawing" && mouseX - SPACING_X > 0) {
    let x = constrain(mouseX - SPACING_X, 0, img.width);
    let y = constrain(mouseY, 0, img.height);

    currentPoly.addVertex(x, y);

    if (currentPoly.isClosed) { 
      state = "select";
    }
  } else {
    if (currentPoly != null && !isMovingVertex) {
      currentPoly.handleVertexSelection();
    }
  }

  if (currentPoly != null) {
    for (let i = polygons.length - 1; i >= 0; i--) {
      let poly = polygons[i];

      if (poly.handleSelection()) {
        currentPoly = polygons[i];
        break;
      }
    }
  }
}

function mouseDragged() {
  isMovingVertex = true;
  if (state == "select" && currentPoly != null && currentPoly.vertexSelected != null) {
    let x = constrain(mouseX - SPACING_X, 0, img.width);
    let y = constrain(mouseY, 0, height);

    currentPoly.moveVertex(x, y);
  }
}

function mouseReleased() {
  isMovingVertex = false;

  if (state == "select" && currentPoly != null && currentPoly.vertexSelected != null) {
    currentPoly.vertexSelected = null;
  }
}

function keyPressed() {
  if (keyCode == BACKSPACE) {
    if (currentPoly != null) {
      polygons = polygons.filter(poly => poly != currentPoly);
    }
  }
}


function normalized_points(vertices=[]) {
  let norm_points = [];

  for(let i = 0; i < vertices.length; i++) {
    let x = round(map(vertices[i].x, 0, img.width, 0, 1), 2);
    let y = round(map(vertices[i].y, 0, img.height, 0, 1), 2);

    norm_points.push(x);
    norm_points.push(y);
  }

  return norm_points;
}

function savePolygons() {
  let coords = [];

  if(polygons.length > 0) {
    for (let i = 0; i < polygons.length; i++) {
      let poly = polygons[i];
      coords.push(normalized_points(poly.vertices));
    }
  }

  saveJSON({ polygons: coords }, 'polygons.json');
}

class Polygon {
  constructor(c, spacingX) {
    this.vertices = [];
    this.spacingX = spacingX;
    this.c = c;
    this.s = 5;
    this.isClosed = false;
    this.isSelected = false;
    this.vertexSelected = null;
  }

  display(state) {
    if (this.vertices.length > 0) {
      stroke(this.c);
      strokeWeight(2);

      if (state == 'drawing' && !this.isClosed) {
        let lastVertex = this.vertices[this.vertices.length - 1];
        noFill();
      
        line(mouseX - this.spacingX, mouseY, lastVertex.x, lastVertex.y);
      } else {
        fill(red(this.c), green(this.c), blue(this.c), 100);
      }

      beginShape();
      for (let i = 0; i < this.vertices.length; i++) {
        let v = this.vertices[i];
        vertex(v.x, v.y);
      }
      if(this.isClosed)
        endShape(CLOSE);
      else
        endShape();

      if ((!this.isClosed || this.isSelected)) {
        this.displayVertices();
      }
    }
  }

  displayVertices() {
    noFill();

    for (let i = 0; i < this.vertices.length; i++)
      ellipse(this.vertices[i].x, this.vertices[i].y, this.s * 2, this.s * 2);
  }

  addVertex(x, y) {
    if (this.vertices.length > 1) {
      let v = this.vertices[0];
      let d = dist(x, y, v.x, v.y);

      if (d < this.s) {
        this.isClosed = true;
        return;
      }
    }

    this.vertices.push(createVector(x, y));
  }

  moveVertex(x, y) {
    if (this.vertexSelected != null) {
      this.vertices[this.vertexSelected].x = x;
      this.vertices[this.vertexSelected].y = y;
    }
  }

  handleVertexSelection(state) {
    for (let i = 0; i < this.vertices.length; i++) {
      let v = this.vertices[i];
      let m = createVector(mouseX - this.spacingX, mouseY);

      let d = dist(v.x, v.y, m.x, m.y);

      if (d <= this.s)
        this.vertexSelected = i;
    }
  }

  handleSelection() {
    let total_angle = 0;

    for (let i = 0; i < this.vertices.length; i++) {
      let p1 = this.vertices[i];
      let p2 = this.vertices[(i + 1) % this.vertices.length];
      let mouse = createVector(mouseX - this.spacingX, mouseY);

      let a1 = this.angle_between(mouse.x, mouse.y, p1.x, p1.y);
      let a2 = this.angle_between(mouse.x, mouse.y, p2.x, p2.y);

      let angle_diff = a2 - a1;

      if (angle_diff >= PI)
        angle_diff -= TWO_PI;
      else if (angle_diff <= -PI)
        angle_diff += TWO_PI;

      total_angle += angle_diff;
    }

    if (abs(total_angle) > PI)
      this.isSelected = true;
    else
      this.isSelected = false;

    return this.isSelected;
  }

  angle_between(x1, y1, x2, y2) {
    return atan2(y2 - y1, x2 - x1);
  }
}