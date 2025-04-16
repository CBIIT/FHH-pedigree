var data = {};

export function set_data (d) {
  data = d;
}

export function build_family_tree_with_ancestors() {
  const proband_id = data['proband'];

  let tree = [];
  // First go up the tree from the proband to find all ancestors.
  // Each generation is an array of members ordered as they will be on display

  let list;
  if (data["people"][proband_id]["demographics"]["gender"] == "Male") {
    list = [{"father":proband_id}];
  } else {
    list = [{"mother":proband_id}];
  }

  tree.push(list);

  let i = 0;
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
  let updated_generation = [];

  for (const index in generation) {

    const couple = generation[index];
    console.log(couple);

    // First push all the couples with a non-blood mother to the list so the extra female partners will be to the left
    let all_partners = find_all_partners(couple.father);
    console.log(all_partners);
    for (const index2 in all_partners) {
      const new_mother = all_partners[index2];
      if (new_mother != couple.mother) {
        const new_couple = {"mother": new_mother, "father":couple.father} ;
        console.log(new_couple);
        updated_generation.push(new_couple);
      }
    }

    // This adds the main couple to to list
    updated_generation.push({"mother": couple.mother, "father":couple.father});

    // Then push all the couples with a non-blood father to the list so the extra male partners will be to the right
    all_partners = find_all_partners(couple.mother);
    console.log(all_partners);
    for (const index2 in all_partners) {
      const new_father = all_partners[index2];
      if (new_father != couple.father) {
        const new_couple = {"mother": couple.mother, "father":new_father} ;
        updated_generation.push(new_couple);
      }
    }
  }
  return updated_generation;
}

export function expand_next_generation_to_include_all_children(generation){
  let new_generation = [];
  for (const i in generation) {
    let children = find_children_from_couple(generation[i]);
    for (const i2 in children) {
      const child = children[i2];
      const sex = determine_sex(child);
      if (sex == "Male") {
        const couple = {"father": child }; // Always work with couples, even when we don't know if they have children
        new_generation.push(couple);
      } else {
        const couple = {"mother": child }; // Always work with couples, even when we don't know if they have children
        new_generation.push(couple);
      }
    }
  }
  return new_generation;
}

export function create_couple_list_from_single_parent_list(single_parent_list){
  for (const i in single_parent_list) {
    const parent_id = single_parent_list[i];
    const partner_list = find_all_partners(parent_id);
    for (const i2 in partner_list) {
      const couple = {"father": parent_id, "mother": partner_list[i2]};
    }
  }

}

export function find_children(parent_id, exception_id) {
  let children = [];
  const people = data['people'];

  for (const person_id in people) {
    let details = people[person_id];
    if (person_id == "10001-06-012") {
      console.log ("(" + person_id + ")" + details['father'] + ":" +  details['mother']);
    }
    if (details['father'] == parent_id || details['mother'] == parent_id) {
      if (person_id != exception_id) children.push(person_id);
    }
  }
  sort_people_by_age_name_id(children);

  return children;
}

export function find_all_partners(person_id) {
  let partners = [];

  let children = find_children(person_id);

  for (const index in children) {
    const child_id = children[index];
    const mother_id = data['people'][child_id]['mother'];
    const father_id = data['people'][child_id]['father'];
    if (mother_id != person_id && !partners.includes(mother_id)) {
      partners.push(mother_id);
    }
    if (father_id != person_id && !partners.includes(father_id)) {
      partners.push(father_id);
    }
//    if (!mother_id) {
//      console.log ("Missing Mother of Father: " + father_id);
//      partners.push("PLACEHOLDER");
//    }
//    if (!father_id) {
//      console.log ("Missing Father of Mother: " + mother_id);
//      partners.push("PLACEHOLDER");
//    }
  }
  console.log(partners);
  return partners;
}


export function find_children_from_couple(couple) {
  let children = [];
  const people = data['people'];
  for (const person_id in people) {
    let details = people[person_id];
    if (details.father == couple.father && details.mother == couple.mother) {
      children.push(person_id);
    }
  }
  sort_people_by_age_name_id(children);

  return children;
}

// Exception ID is if we wanted to find full siblings
export function find_children_from_both_parents(father_id, mother_id, exception_id) {
  let children = [];
  const people = data['people'];
  for (const [person_id, details] of Object.entries(people)) {
    if (details['father'] == father_id && details['mother'] == mother_id) {
      if (person_id != exception_id) children.push(person_id);
    }
  }
  sort_people_by_age_name_id(children);

  return children;
}



// Couple based functions

export function find_all_parents_of_list(list) {
  let parents_list = [];

  for (let index in list) {
    const male_id = list[index].father;
    const female_id = list[index].mother;

//    const person_id = list[index];
    // If both parents are mentioned, then put both on the list, mom always first

    if (female_id) {
      let couple = {};
      couple.mother = data['people'][female_id]["mother"];
      couple.father = data['people'][female_id]["father"];
      if (couple.mother || couple.father) add_new_couple_to_list_unique(couple, parents_list);
    }
    if (male_id) {
      let couple = {};
      couple.mother = data['people'][male_id]["mother"];
      couple.father = data['people'][male_id]["father"];
      if (couple.mother || couple.father) add_new_couple_to_list_unique(couple, parents_list);
    }
  }

  // Remove duplicates and return
//  console.log(parents_list);
  return parents_list;
//  return Array.from(new Set(parents_list));
}

function add_new_couple_to_list_unique(couple, list) {
  let couple_already_in_list = false;
  for (let i=0; i<list.length;i++){
    const candidate_couple = list[i];
    if (candidate_couple.father == couple.father && candidate_couple.mother == couple.mother) {
      couple_already_in_list = true;
    }
  }
  if (!couple_already_in_list) {
    list.push(couple);
  }
}


///// Helper functions that do not need to be tested

function sort_people_by_age_name_id (list) {
  list.sort(compare_by_age_name_id);
}

function compare_by_age_name_id(first_person_id, second_person_id) {
    if (first_person_id == second_person_id) return 0;


// First Check Age
    let age_1 = determine_age(data['people'][first_person_id]);
    let age_2 = determine_age(data['people'][second_person_id]);
    if (age_1 > age_2) return 1;
    if (age_1 < age_2) return -1;

// Then check Name alphabetically
    const name_1 = data['people'][first_person_id]['name'];
    const name_2 = data['people'][second_person_id]['name'];
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
    const birthdate = new Date(data['people'][id]['demographics']['birthdate']);
    const age = calculate_age(birthdate);
    return age;
  }
}

// Short function from stackoverflow
function calculate_age(birthday) { // birthday is a date
  const ageDifMs = Date.now() - birthday;
  const ageDate = new Date(ageDifMs); // miliseconds from epoch
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}



export function determine_sex (person_id) {
  const children = find_children(person_id);
  if (children.length > 0) {
    const first_child_id = children[0];
    const first_child_details = data["people"][first_child_id];

    if (first_child_details["father"] == person_id) return "Male";
    else if (first_child_details["mother"] == person_id) return "Female";
  } else {
    // Okay they have no children, so can't tell that way, next check for Demographics
    const sex = data["people"][person_id]["demographics"]["gender"];
    if (sex == "Male" || sex == "male" || sex == "M") return "Male";
    else if (sex == "Female" || sex == "female" || sex == "F") return "Female";
    else return "Unknown";
  }

  return "Unknown"; // Should never happen
}
