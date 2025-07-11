
import {   build_entire_family_tree, set_data, get_furthest_left, get_furthest_right, check_for_overlaps
        } from './fhh_build_pedigree.js';

import { check_for_files, load_files_into_select, load_config_and_data } from "./fhh_load.js";

import { addSvgListeners, start_free_move, start_slide_move } from "./fhh_move.js";

const svgns = "http://www.w3.org/2000/svg";
var config;
var data;
let family_tree = [];
let people_drawn = [];

let increment = 0;

const debug_offset = {"x": 5000, "y":400};
var center_offset = {};

let select = document.getElementById('file_select');
select.addEventListener('change', function(event) {
  // Code to be executed when the value changes
  console.log('The value has been changed to: ' + event.target.value);
  const promise = load_config_and_data("/examples/" + event.target.value);
  promise.then(([d, c]) => {
    data = d;
    config = c;
    display_pedigree();
  });
});

document.addEventListener('DOMContentLoaded', function() {
  try {

    const urlParams = new URLSearchParams(window.location.search);
    const family = urlParams.get('family');

    check_for_files();

    let filename = null;
    if (family) {
      filename = "../examples/" + family + ".json";
    }
    const promise = load_config_and_data(filename);
    promise.then(([d, c]) => {
      data = d;
      config = c;
      display_pedigree();
    });

  } catch (error) {
    console.error('Error fetching data:', error);
  }
});

function add_placeholder_children() {
  console.log("Checking for childless people");
  for (const person_id in data["people"]) {
    if (is_childless(person_id)) {
      // console.log (person_id + " is childless");
    }
  }
}

export function display_pedigree() {
  console.log(data);
  set_data(data);

  const proband_id = data.proband;
  family_tree = build_entire_family_tree(proband_id);


  draw_frame();
  draw_family_tree(family_tree);

  console.log(family_tree);

  const overlaps = check_for_overlaps(family_tree);
  console.log(overlaps);
}

function draw_frame() {
  const furthest_right = get_furthest_right();
  const furthest_left = get_furthest_left();
  const total_width = furthest_right - furthest_left;

  console.log("SIZE (" + total_width + "): " + furthest_left + " <-> " + furthest_right);

  center_offset.x = ((config.margin) + (-furthest_left * (config.h_padding + 2 * config.size)) );
  center_offset.y = 500;
  console.log ("CENTER: " + center_offset.x + "," + center_offset.y);


  const width_of_svg = 2 * ((2 * config.margin) + (total_width * (config.h_padding + 2 * config.size)) );
//  const width_of_svg = find_width_of_svg(config.size);
//  const width_of_svg = 10000;
  console.log(width_of_svg);
//  const height_of_svg = (2 * config.margin) + find_total_generations() * (2 * config.v_padding + config.size + config.v_spacing);
  const height_of_svg = 1000;
  console.log(height_of_svg);

  const svgElem = create_svg(width_of_svg, height_of_svg);
  const r2 = draw_rectangle(width_of_svg-2,height_of_svg-2, 1, 1);
  r2.setAttributeNS(null, "stroke", "black");
  r2.setAttributeNS(null, "fill", "white");
  r2.setAttributeNS(null, "stroke-width", "1");


  const center = draw_circle(30, center_offset.x, center_offset.y);
  center.setAttributeNS(null, "fill", "blue");

}

function find_max_people_in_any_generation() {
  let max_people_in_any_generation = 0;
  for (const i in family_tree) {
    const num_people_in_generation = family_tree[i].length;
    if (max_people_in_any_generation < num_people_in_generation) max_people_in_any_generation = num_people_in_generation;
  }
  return max_people_in_any_generation;
}

function find_total_generations() {
  return family_tree.length;
}

export function create_svg(width, height) {
    let svgElem =  document.createElementNS(svgns, "svg");
    svgElem.setAttributeNS(null, "viewBox", "0 0 " + width + " " + height);
    svgElem.setAttributeNS(null, "width", width);
    svgElem.setAttributeNS(null, "height", height);
    svgElem.setAttributeNS(null, "fill", "lightblue");
    svgElem.setAttributeNS(null, "stroke", "black");
    svgElem.setAttributeNS(null, "stroke-width", "5");

    svgElem.style.display = "block";
    svgElem.id = "svg";

    var svgContainer = document.getElementById("main");
    svgContainer.innerHTML = '';
    svgContainer.appendChild(svgElem);

    addSvgListeners(svgElem);
    return svgElem;
}
///////////////////////////////////////////////


function draw_family_tree(family_tree) {
  console.log("draw_family_tree");

``
  for (const person_id in data["people"]) {
    const person = data["people"][person_id];
    if (person.gen != null && person.loc != null) {
      draw_person_connectors(person_id);
    }
  }

  for (const person_id in data["people"]) {
    const person = data["people"][person_id];
    if (person.gen != null && person.loc != null) {
      draw_person(person_id);
    }
  }

}

function draw_person(person_id) {
//  console.log(person_id);
  const person = data["people"][person_id];

  if (person && person["demographics"]["gender"] == "Male") draw_male(person_id);
  else draw_female(person_id);

}

function draw_person_connectors(person_id) {
//  console.log(person_id);
  const person = data["people"][person_id];


  if (person.mother == null && person.father != null) console.log ("Missing Mother for " + person_id);
  if (person.father == null && person.mother != null) console.log ("Missing Father for " + person_id);


  if (person) draw_connector(person_id, person.mother, person.father);
}

function get_center(person) {
  let center = {};
  center.x = center_offset.x + config.margin + ((person.loc) * (config.h_spacing));
  center.y = center_offset.y + config.margin + ((person.gen) * (config.v_padding + config.size / 2));
  return center;
}

function add_clicking_to_element(el, person_id) {
  el.addEventListener('mousedown', (e) => {
    const selectedValue = document.querySelector('input[name="action_choice"]:checked').value;
    console.log(selectedValue);

    if (selectedValue == "details") {
      console.log("Clicked on: " + person_id);
      console.log (data["people"][person_id]);
    } else if (selectedValue == "free") {
      console.log("Free Movement:" + person_id);
      start_free_move(e);
    } else if (selectedValue == "slide") {
      console.log("Slide Movement:" + person_id);
      start_slide_move(e);
    }

  });
}

function draw_male(person_id) {
  if (!data["people"][person_id]) return;
  let person = data["people"][person_id];

  let center = get_center(person);

  const el = draw_square(config.size, center.x - config.size/2, center.y - config.size/2);
  el.setAttributeNS(null, "id", person_id);
  el.setAttributeNS(null, "name", person_id);
  el.setAttributeNS(null, "sex", "Male");

  if (person.placeholder) el.setAttributeNS(null, "fill", "White");

//  const el2 = draw_circle(config.size/4, center.x, center.y);
//  el2.setAttributeNS(null, "id", person_id);
//  el2.setAttributeNS(null, "name", person_id);
//  el2.setAttributeNS(null, "sex", "Female");

  people_drawn.push(person_id);

  add_clicking_to_element(el, person_id);

  if (!data["people"][person_id].placeholder) {
    const label = draw_name(center.x, center.y+config.v_spacing, person_id);
    label.setAttribute("id", person_id);
  }

}

function draw_female(person_id) {
  if (!data["people"][person_id]) return;
  let person = data["people"][person_id];

  let center = get_center(person);

  const el = draw_circle(config.size, center.x, center.y);
  el.setAttributeNS(null, "id", person_id);
  el.setAttributeNS(null, "name", person_id);
  el.setAttributeNS(null, "sex", "Female");

  if (person.placeholder) el.setAttributeNS(null, "fill", "White");

//  const el2 = draw_circle(config.size/4, center.x, center.y);
//  el2.setAttributeNS(null, "id", person_id);
//  el2.setAttributeNS(null, "name", person_id);
//  el2.setAttributeNS(null, "sex", "Female");

  people_drawn.push(person_id);
  add_clicking_to_element(el, person_id);

  if (!data["people"][person_id].placeholder) {
    const label = draw_name(center.x, center.y+config.v_spacing, person_id);
    label.setAttribute("id", person_id);
  }

}

function draw_connector(person_id, mother_id, father_id) {

  const person = data["people"][person_id];
  const mother = data["people"][mother_id];
  const father = data["people"][father_id];

  if (mother && father) {
    let child_loc = get_center(person);

    let mother_loc = get_center(mother);
    let father_loc = get_center(father);

    draw_line_top_of_child(child_loc, person_id);
    draw_line_between_parents(mother_loc, father_loc, mother_id, father_id);
    draw_line_connecting_parents_down(mother_loc, father_loc, mother_id, father_id);
    draw_line_child_to_parents(child_loc, mother_loc, father_loc, person_id, mother_id, father_id);
//    console.log(person_id + ":" + mother_id + "," +    father_id);
  }
}

function draw_line_child_to_parents(child_loc, mother_loc, father_loc, person_id, mother_id, father_id) {
//  const x1 = mother_loc.x + config.h_spacing;
  const x1 = (mother_loc.x + father_loc.x) / 2;
  const y1 = mother_loc.y + config.size/2 + config.v_spacing/2;

  const x2 = child_loc.x;
  const y2 = child_loc.y - config.size - config.v_spacing/2;

  let elem = draw_line(x1,y1, x2,y2);
  elem.setAttributeNS(null, "stroke-width", "2");
  elem.setAttributeNS(null, "child_id", person_id);
  elem.setAttributeNS(null, "c_mother_id", mother_id);
  elem.setAttributeNS(null, "c_father_id", father_id);

}

function draw_line_top_of_child(child_loc, person_id) {
  const x = child_loc.x;
  let top_of_child = {};


  top_of_child.x = child_loc.x;
  top_of_child.y = child_loc.y + config.size/2;
  let elem = draw_line(child_loc.x, child_loc.y - config.size/2, child_loc.x, child_loc.y - config.size - config.v_spacing/2);
  elem.setAttributeNS(null, "id", person_id);
  elem.setAttributeNS(null, "stroke-width", "2");

}

function draw_line_between_parents(mother_loc, father_loc, mother_id, father_id) {
  let elem = draw_line(mother_loc.x, mother_loc.y, father_loc.x, father_loc.y);
  elem.setAttributeNS(null, "stroke-width", "2");
  elem.setAttributeNS(null, "mother_id", mother_id);
  elem.setAttributeNS(null, "father_id", father_id);
}

function draw_line_connecting_parents_down(mother_loc, father_loc, mother_id, father_id) {
  const x = (mother_loc.x + father_loc.x)/2;
//  const x = mother_loc.x + config.h_spacing;
  const y1 = mother_loc.y;
  const y2 = mother_loc.y + config.size/2 + config.v_spacing/2;
  let elem = draw_line(x, y1, x, y2);
  elem.setAttributeNS(null, "stroke-width", "2");
  elem.setAttributeNS(null, "p_mother_id", mother_id);
  elem.setAttributeNS(null, "p_father_id", father_id);
}

function draw_name(loc_x, loc_y, person_id) {
  let text = person_id;
//  if (data["people"][person_id] && data["people"][person_id].name) {
//    text = data["people"][person_id].name;
//  }
  return(draw_label(text, loc_x, loc_y));

}

function draw_label(text, x, y) {
  var textElem = document.createElementNS(svgns, 'text');
  textElem.setAttribute('x', x);
  textElem.setAttribute('y', y);
  textElem.setAttribute('font-size', 12);
  textElem.setAttribute("font-family", "Arial, Helvetica, sans-serif");
  textElem.setAttribute("text-anchor", "middle");
  textElem.setAttribute("fill", "black");
  textElem.setAttribute("stroke-width", "1");
  increment++;
  textElem.textContent = text;

  var svg = document.getElementById("svg");
  svg.appendChild(textElem);
  return textElem;
}


/////////////////////////


function draw_rectangle(width, height, x, y) {
  let rectElem = document.createElementNS(svgns, "rect");
  rectElem.setAttribute("width", width);
  rectElem.setAttribute("height", height);
  rectElem.setAttribute("x", x);
  rectElem.setAttribute("y", y);
  rectElem.setAttribute("stroke-width", "1");



  var svg = document.getElementById("svg");
  svg.appendChild(rectElem);

  return rectElem;
}

function draw_square(size, x, y) {
  let rectElem = document.createElementNS(svgns, "rect");
  rectElem.setAttribute("width", size);
  rectElem.setAttribute("height", size);
  rectElem.setAttribute("x", x);
  rectElem.setAttribute("y", y);
  rectElem.setAttribute("stroke-width", "1");

  var svg = document.getElementById("svg");
  svg.appendChild(rectElem);

  return rectElem;
}

function draw_circle(radius, x, y) {
  let circleElem = document.createElementNS(svgns, "circle");
  circleElem.setAttribute("r", radius/2);
  circleElem.setAttribute("cx", x);
  circleElem.setAttribute("cy", y);
  circleElem.setAttribute("stroke-width", "1");

  var svg = document.getElementById("svg");
  svg.appendChild(circleElem);

  return circleElem;
}

function draw_line(x1, y1, x2, y2) {
  let lineElem = document.createElementNS(svgns, "line");
  lineElem.setAttribute("x1", x1);
  lineElem.setAttribute("y1", y1);
  lineElem.setAttribute("x2", x2);
  lineElem.setAttribute("y2", y2);
  lineElem.setAttribute("stroke-width", "1");

  var svg = document.getElementById("svg");
  svg.appendChild(lineElem);

  return lineElem;
}
