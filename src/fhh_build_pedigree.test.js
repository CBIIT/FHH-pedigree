import {  set_data, determine_age, find_children, find_all_partners, find_children_from_both_parents,
          find_all_parents_of_list, build_family_tree_with_ancestors, expand_one_generation_to_include_partners
       } from './fhh_build_pedigree';

import d from './fhh_pedigree.test.json';

// This loads the sample data we will use for the tests
beforeAll(() => {
  set_data(d);
});

// Testing the determine_age function
// Do we need to test these types of functions?
// If so, how do we handle the age changing over time
test('Test determine age by birthdate', () => {
  const proband = d["proband"];

  const age = determine_age("10001-01-001");
  expect(age).toBe(56);
});


// Testing the find_children function
test('Test that the FindChildren function works for the example proband', () => {
  const proband = d["proband"];

  const children = find_children(d["proband"]);
  expect(children).toContain("10001-03-001"); // First Daughter is proband child
  expect(children).toContain("10001-03-002"); // Second Daughter is proband child
  expect(children).toContain("10001-03-003"); // First Son is not proband child
});

test("Test that the children of the proband's parents includes the proband as a child", () => {
  const proband = d["proband"];
  const father = d["people"][proband]["father"];
  const mother = d["people"][proband]["mother"];


  const fathers_children = find_children(father);
  expect(fathers_children).toContain(proband);

  const mothers_children = find_children(mother);
  expect(mothers_children).toContain(proband);
});

test("Test that we can find all partners of the proband", () => {
  const proband = d["proband"];
  const partners = find_all_partners(proband);
//  expect(partners).toContain("10001-01-002"); // First partner of Proband
//  expect(partners).toContain("10001-01-003"); // Second partner of Proband

});

test("Test that we can find children of both parents without using the exception", () => {
  var children = find_children_from_both_parents("10001-01-001", "10001-01-002");

  expect(children).toContain("10001-03-001"); // Daughter with first partner
  expect(children).toContain("10001-03-002"); // Daughter with first partner
  expect(children).not.toContain("10001-03-003"); // Son with other partner should not be there

  // Now try the other partner
  var children = find_children_from_both_parents("10001-01-001", "10001-01-003");
  expect(children).not.toContain("10001-03-001"); // Daughter with first partner
  expect(children).not.toContain("10001-03-002"); // Daughter with first partner
  expect(children).toContain("10001-03-003"); // Son with other partner should not be there


});

test("Test that we can find children of both parents with the exception (Full Siblings)", () => {
  var children = find_children_from_both_parents("10001-01-001", "10001-01-002", "10001-03-001");

  expect(children).not.toContain("10001-03-001"); // Daughter with first partner
  expect(children).toContain("10001-03-002"); // Daughter with first partner
  expect(children).not.toContain("10001-03-003"); // Son with other partner should not be there
});

test("Test that we can find all the parents of a list of people (proband only)", () => {
  var list = ["10001-01-001"];

  var parents_list = find_all_parents_of_list(list);
  console.log(parents_list);

  expect(parents_list).toContain("10001-02-001"); // Father
  expect(parents_list).toContain("10001-02-002"); // Mother
});

test("Test that we can find all the parents of a list of people (all parents of all of probands children)", () => {
  var list = ["10001-03-001", "10001-03-002", "10001-03-003"];

  var parents_list = find_all_parents_of_list(list);
  console.log(parents_list);

  expect(parents_list).toContain("10001-01-001"); // Father
  expect(parents_list).toContain("10001-01-002"); // Mother of daughters
  expect(parents_list).toContain("10001-01-003"); // Mother of son
});

test("Test see if we can find all grandparents", () => {
  var list = ["10001-01-001"];

  var parents_list = find_all_parents_of_list(list);
  var grandparents_list = find_all_parents_of_list(parents_list);
  console.log(grandparents_list);

  expect(grandparents_list).toContain("10001-04-001"); // PGF
  expect(grandparents_list).toContain("10001-04-002"); // PGM
  expect(grandparents_list).toContain("10001-04-003"); // MGF
  expect(grandparents_list).toContain("10001-04-004"); // MGM
});

test("Test see if we can find all great-grandparents", () => {
  var list = ["10001-01-001"];

  var parents_list = find_all_parents_of_list(list);
  var grandparents_list = find_all_parents_of_list(parents_list);
  var great_grandparents_list = find_all_parents_of_list(grandparents_list);

  console.log(great_grandparents_list);

  expect(great_grandparents_list).toContain("10001-06-001");
  expect(great_grandparents_list).toContain("10001-06-002");
  expect(great_grandparents_list).toContain("10001-06-003");
  expect(great_grandparents_list).toContain("10001-06-004");
  expect(great_grandparents_list).toContain("10001-06-005");
  expect(great_grandparents_list).toContain("10001-06-006");
  expect(great_grandparents_list).toContain("10001-06-007");
  expect(great_grandparents_list).toContain("10001-06-008");
});

test("Test see if we can find all great-great-grandparents", () => {
  var list = ["10001-01-001"];

  var parents_list = find_all_parents_of_list(list);
  var grandparents_list = find_all_parents_of_list(parents_list);
  var great_grandparents_list = find_all_parents_of_list(grandparents_list);
  var great_great_grandparents_list = find_all_parents_of_list(great_grandparents_list);

  console.log(great_grandparents_list);

  expect(great_great_grandparents_list).toContain("10001-08-001");
  expect(great_great_grandparents_list).toContain("10001-08-002");
  expect(great_great_grandparents_list).toContain("10001-08-003");
  expect(great_great_grandparents_list).toContain("10001-08-004");
  expect(great_great_grandparents_list).not.toContain("10001-08-005"); // We only put in 4 of the great-great generation
});

test("Test see if we build a family tree of ancestors", () => {
  const family_tree = build_family_tree_with_ancestors();
  console.log(family_tree);

  expect(family_tree[0]).toContain("10001-08-001");
  expect(family_tree[1]).toContain("10001-06-001");
  expect(family_tree[2]).toContain("10001-04-001");
  expect(family_tree[3]).toContain("10001-02-001");
  expect(family_tree[4]).toContain("10001-01-001");

});

test("Test expand_one_generation_to_include_partners", () => {
  const family_tree = build_family_tree_with_ancestors();

  var generation = expand_one_generation_to_include_partners(family_tree[0]);
  console.log(generation);
});
