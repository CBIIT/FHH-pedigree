var data = {};

export function set_data (d) {
  data = d;
}

export function build_family_tree_with_ancestors() {
  const proband_id = data['proband'];

  var tree = [];
  // First go up the tree from the proband to find all ancestors.
  // Each generation is an array of members ordered as they will be on display

  const list = [proband_id];
  tree.push(list);

  var i = 0;
  while (tree[i] && tree[i].length > 0) {
    const new_list = find_all_parents_of_list(tree[i]);
    if (new_list && new_list.length > 0) tree.push(new_list);
    i++;
  }
  // We need to get the oldest generation to be the first (ie. [0]) and each generation to go up from there
  tree.reverse();
  return tree;
}

export function expand_one_generation_to_include_partners(generation) {
  $.each(generation, function(index, person_id) {
    var all_partners = find_all_partners(person_id);
    console.log(person_id + ": " + all_partners);
    $.each(all_partners, function (index2, new_partner) {
      generation.splice(index, new_partner)
    });
    console.log(generation);
  });
}


export function find_children(parent_id, exception_id) {
  var children = [];
  $.each(data['people'], function(person_id, details){
    if (details['father'] == parent_id || details['mother'] == parent_id) {
      if (person_id != exception_id) children.push(person_id);
    }
  });
  sort_people_by_age_name_id(children);

  return children;
}

export function find_all_partners(person_id) {
  var partners = [];

  var children = find_children(person_id);
  $.each(children, function(index, child_id) {
    var mother = data['people'][child_id]['mother'];
    var father = data['people'][child_id]['father'];
    if (mother != person_id && $.inArray(mother, partners) == -1) partners.push(mother);
    if (father != person_id && $.inArray(father, partners) == -1) partners.push(father);
  });

  return partners;
}

// Exception ID is if we wanted to find full siblings
export function find_children_from_both_parents(father_id, mother_id, exception_id) {
  var children = [];
  $.each(data['people'], function(person_id, details){
    if (details['father'] == father_id && details['mother'] == mother_id) {
      if (person_id != exception_id) children.push(person_id);
    }
  });
  sort_people_by_age_name_id(children);

  return children;
}

export function find_all_parents_of_list(list) {
  var parents_list = [];
  $.each(list, function(index, person_id){
    if (data['people'][person_id]["father"]) parents_list.push(data['people'][person_id]["father"]);
    if (data['people'][person_id]["mother"]) parents_list.push(data['people'][person_id]["mother"]);
  });

  // Remove duplicates and return
  console.log(parents_list);
  return Array.from(new Set(parents_list));
}



///// Helper functions that do not need to be tested

function sort_people_by_age_name_id (list) {
  list.sort(compare_by_age_name_id);
}

function compare_by_age_name_id(first_person_id, second_person_id) {
    if (first_person_id == second_person_id) return 0;


// First Check Age
    var age_1 = determine_age(data['people'][first_person_id]);
    var age_2 = determine_age(data['people'][second_person_id]);
    if (age_1 > age_2) return 1;
    if (age_1 < age_2) return -1;

// Then check Name alphabetically
    var name_1 = data['people'][first_person_id]['name'];
    var name_2 = data['people'][second_person_id]['name'];
    if (name_1 > name_2) return 1;
    if (name_1 < name_2) return -1;

    if (first_person_id > second_person_id) return 1;
    if (first_person_id < second_person_id) return -1;

    return 0;
}

export function determine_age(id) {
  if (!data['people'][id]) return 0;
  if (!data['people'][id]['demographics']) return 0;

  if (data['people'][id]['demographics']['age']) return data['people'][id]['demographics']['age'];

  if (data['people'][id]['demographics']['birthdate']) {
    var birthdate = new Date(data['people'][id]['demographics']['birthdate']);
    var age = calculate_age(birthdate);
    return age;
  }
}

// Short function from stackoverflow
function calculate_age(birthday) { // birthday is a date
  var ageDifMs = Date.now() - birthday;
  var ageDate = new Date(ageDifMs); // miliseconds from epoch
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}
