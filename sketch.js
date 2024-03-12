let img;
//let scale;
let points;
let vertices;
let vertex_selected_index;
let vertex_size;
let isDrawing;
let conecting_state;

let select_button;
let pen_button;
let clear_button;
let save_button;
let color_picker;

function preload() {
  img = loadImage(IMG_PATH); // Asegúrate de reemplazar con la ruta de tu imagen
  init();
}

function init() {
    //scale = 0.5;
    points = [];
    vertices = [];
    vertex_selected_index = null;
    vertex_size = 5; 
    //SPACING_X = 60;

    isDrawing = false;
    conecting_state = false;

    select_button = createButton('Select');
    pen_button = createButton('Pen');
    clear_button = createButton('Clear');
    save_button = createButton('Save');
    color_picker = createColorPicker('deeppink');

    select_button.position(10, 20);
    pen_button.position(10, 50);
    clear_button.position(10, 80);
    save_button.position(10, 110);
    color_picker.position(10, 200);

    select_button.mousePressed(() => {
        cursor(ARROW);
        isDrawing = false;
        conecting_state = false;
    });

    pen_button.mousePressed(() => {
        cursor(CROSS);
        isDrawing = true;
        conecting_state = false;
    });

    clear_button.mousePressed(() => {
        init();
    });

    save_button.mousePressed(() => {
        savePolygons();
    });
}

function setup() {
  createCanvas(img.width * SCALE + SPACING_X, img.height * SCALE);
  img.resize(img.width * SCALE, img.height * SCALE);
  image(img, 0, 0); // Dibuja la imagen de fondo
}

function draw() {
  background(BACKGROUND_COLOR);
  translate(SPACING_X, 0);
  image(img, 0, 0);

  noFill();
  strokeWeight(2);
  stroke(color_picker.value());
  
  // Se dibujan los vertices de poligono
  for (let i = 0; i < vertices.length; i++) {
    let v = vertices[i].position;
    ellipse(v.x, v.y, vertex_size * 2); // Dibuja el punto de control
  }
  
  // Se dibujan las aristas del poligono
  for (let i = 0; i < points.length - 1; i++) {
    let p1 = points[i];
    let p2 = points[i + 1];
   
    line(p1.x, p1.y, p2.x, p2.y);
  }

  if(conecting_state && isDrawing) line(points[points.length - 1].x, points[points.length -1].y, mouseX - SPACING_X, mouseY);
}

function mousePressed() {
  // Comprobar si se hace clic cerca de un punto existente para seleccionarlo
  for (let i = 0; i < vertices.length; i++) {
    let vertex = vertices[i];
    let vertex_position = vertex.position;
    
    if (dist(mouseX - SPACING_X, mouseY, vertex_position.x, vertex_position.y) < vertex_size) {

      if(isDrawing) {
        points.push(createVector(vertex_position.x, vertex_position.y));
        vertex.indices.push(points.length - 1);

        conecting_state = true;
      } else {
        vertex_selected_index = i;
        isOverVertex = true;
      }
      
      return;
    }
  }

  let x = constrain(mouseX - SPACING_X, 0, img.width);
  let y = constrain(mouseY, 0, img.height);

  // Si no se seleccionó ningún punto, crea uno nuevo
  if(mouseX - SPACING_X > 0 && isDrawing) {
    points.push(createVector(x, y));
    vertices.push({ 
      position: createVector(x, y), 
      indices: [points.length - 1]
    });

    conecting_state = true;
  }
  
}

function mouseDragged() {
  // Si hay un punto seleccionado, actualiza su posición
  if(vertex_selected_index != null) {
    print('moviendo vertice {'+ vertex_selected_index + '}');
    let vertex_selected = vertices[vertex_selected_index];
    print(vertex_selected);
    
    for(let i = 0; i < vertex_selected.indices.length; i++) {
      let index = vertex_selected.indices[i];

      let x = constrain(mouseX - SPACING_X, 0, img.width);
      let y = constrain(mouseY, 0, img.height);

      points[index].x = x;
      points[index].y = y;
      vertex_selected.position.x = x;
      vertex_selected.position.y = y;
      
      print(index);
    }
  }
}

function mouseReleased() {
  // Al soltar el botón del mouse, deselecciona cualquier punto
  vertex_selected_index = null;
}

function savePolygons() {  
    let normalized_points = [];
    
    for(let i = 0; i < points.length - 2; i++) {
      let p = points[i];

      let new_x = round(map(p.x, 0, img.width, 0, 1), 2);
      let new_y = round(map(p.y, 0, img.height, 0, 1), 2);

      normalized_points.push(new_x);
      normalized_points.push(new_y);
    }
    
    saveJSON({ points: normalized_points }, 'polygons.json');
}
