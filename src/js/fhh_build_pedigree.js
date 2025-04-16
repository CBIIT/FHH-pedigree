var data = {};

export function set_data (d) {
  data = d;
}

export function build_entire_family_tree() {
  let family_tree = build_family_tree_with_ancestors();

  let tree_is_complete = false;
  let generation = 0;
  while (!tree_is_complete) {
    family_tree[generation] = expand_one_generation_to_include_partners(family_tree[generation]);
    console.log(family_tree[generation]);
    family_tree[generation + 1] = expand_next_generation_to_include_all_children(family_tree[generation + 1], family_tree[generation]);
    if (!family_tree[generation + 1] || family_tree[generation + 1].length == 0) {
      tree_is_complete = true;
    } else {
      generation = generation + 1;
    }

  }
  return family_tree;
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
// Need to do a deep copy of generation
//  for (const i in generation) updated_generation.push(generation[i]);

  for (const i in generation) {

    const couple = generation[i];
    // First push all the couples with a non-blood mother to the list so the extra female partners will be to the left
    let all_partners = find_all_partners(couple.father);
//    console.log(couple.father + ":" + all_partners);
    if (all_partners && all_partners.length == 0) {
      console.log("This man has no children: " + couple.father);
      updated_generation.push(couple);
    }

    for (const i2 in all_partners) {
      const new_mother = all_partners[i2];
      if (new_mother != couple.mother) {
        const new_couple = {"mother": new_mother, "father":couple.father} ;
        if (!couple_already_in_array(updated_generation, new_couple)) updated_generation.push(new_couple);
      }
    }


    // This adds the main couple to to list
    if (couple.mother && couple.father) {
      // Have to iterate over every element to ensure it is not already there,
      if (!couple_already_in_array(updated_generation, couple) ) updated_generation.push(couple);
    }



    // Then push all the couples with a non-blood father to the list so the extra male partners will be to the right
    all_partners = find_all_partners(couple.mother);
    if (all_partners && all_partners.length == 0) {
      console.log("This woman has no children: " + couple.mother);
      updated_generation.push(couple);
    }
    for (const i2 in all_partners) {
      const new_father = all_partners[i2];
      if (new_father != couple.father) {
        const new_couple = {"mother": couple.mother, "father":new_father} ;
        if (!couple_already_in_array(updated_generation, new_couple)) updated_generation.push(new_couple);
      }
    }
  }

  return updated_generation;
}

function couple_already_in_array(array, couple) {
  let already_in_array = false;
  for (const i in array) {
    const test_couple = array[i];
    if (couple.mother == test_couple.mother && couple.father == test_couple.father) {
      already_in_array = true;
    }
  }
  return already_in_array;
}



export function expand_next_generation_to_include_all_children(next_generation, current_generation){
  if (!next_generation) next_generation = [];  // When there are no people in a generation, we still needed to expand if there are are children
  let new_generation = next_generation;
  for (const i in current_generation) {
    let children = find_children_from_couple(current_generation[i]);
//    console.log(current_generation[i].mother + "," + current_generation[i].father + ":" + children);
    for (const i2 in children) {
      const child = children[i2];

      const location_in_generation = find_in_generation(child, next_generation);
//      console.log(next_generation);
      let loc = 0;
      let sibling;
      if (!location_in_generation) {
        // This person is not a direct ancestor (uncle, aunt, etc.) so we need to find the direct ancestor and put them nearby
        console.log(child + ":" + location_in_generation);

        const all_siblings = find_any_siblings(child);
        console.log(all_siblings);
        if (all_siblings && all_siblings.length > 0) {
          for (const i in all_siblings) {
            sibling = all_siblings[i];
            if (find_in_generation(sibling, next_generation) > 0) loc = find_in_generation(sibling, next_generation);
          }
        }
        console.log ("Place the person (" + child + ") near (" + sibling + "): " + loc);
        if (determine_sex(sibling) == "Male") loc = loc + 1;  // If sibling is male, than put it after him
        const sex = determine_sex(child);
        console.log (new_generation);
        if (sex == "Male") {
          const child_as_couple = {"father": child }; // Always work with couples, even when we don't know if they have children
          new_generation.splice(loc, 0, child_as_couple);
        } else {
          const child_as_couple = {"mother": child }; // Always work with couples, even when we don't know if they have children
          new_generation.splice(loc, 0, child_as_couple);
        }
        console.log (new_generation);
      }
    }
//      console.log(next_generation);
  }
  return new_generation;
//  return new_generation.concat(next_generation);
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

function find_in_generation(child, generation) {
  for (const i in generation) {
    const couple = generation[i];
    if (couple.mother == child || couple.father == child) {
      return i;
    }
  }
}

export function find_children(parent_id, exception_id) {
  let children = [];
  const people = data['people'];

  for (const person_id in people) {
    let details = people[person_id];
    if (person_id == "10001-06-012") {
    }
    if (details['father'] == parent_id || details['mother'] == parent_id) {
      if (person_id != exception_id) children.push(person_id);
    }
  }
  sort_people_by_age_name_id(children);

  return children;
}

export function find_all_partners(person_id) {
  if (!person_id) return null; // If no id, no partners

  let partners = [];

  let children = find_children(person_id);

  for (const index in children) {
    const child_id = children[index];
    const mother_id = data['people'][child_id]['mother'];
    const father_id = data['people'][child_id]['father'];
    if (mother_id && mother_id != person_id && !partners.includes(mother_id)) {
      partners.push(mother_id);
    }
    if (father_id && father_id != person_id && !partners.includes(father_id)) {
      partners.push(father_id);
    }
    if (!mother_id) {
      partners.push("UNKNOWN");
    }
    if (!father_id) {
      partners.push("UNKNOWN");
    }
  }
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

    if ( (details.father == couple.father)  && (couple.mother == "UNKNOWN" && !details.mother) ){
      children.push(person_id);
    }
    if ( (couple.father == "UNKNOWN" && !details.father) && (details.mother == couple.mother) ) {
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
function find_full_siblings(person_id) {
  const siblings = find_children_from_both_parents(person_id.father, person_id.mother);
  return siblings;
}

function find_any_siblings(person_id) {
  let siblings_from_father = [];
  let siblings_from_mother = [];
  if (data["people"][person_id].father) siblings_from_father = find_children(data["people"][person_id].father, person_id);
  if (data["people"][person_id].mother) siblings_from_mother = find_children(data["people"][person_id].mother, person_id);
  console.log("F:" + siblings_from_father);
  console.log("M:" + siblings_from_mother);

  return siblings_from_father.concat(siblings_from_mother);
}

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
