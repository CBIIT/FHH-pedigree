var data = {};

export function set_data (d) {
  data = d;
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
    console.log(birthdate);
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
