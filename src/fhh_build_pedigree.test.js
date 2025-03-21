import { set_data, determine_age, find_children, find_all_partners } from './fhh_build_pedigree';

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

  var age = determine_age("10001-01-001");
  console.log(age);
  expect(age).toBe(56);
});


// Testing the find_children function
test('Test that the FindChildren function works for the example proband', () => {
  console.log("Proband is: " + d["proband"]);
  const proband = d["proband"];

  var children = find_children(d["proband"]);
  expect(children).toContain("10001-03-001"); // First Daughter is proband child
  expect(children).toContain("10001-03-002"); // Second Daughter is proband child
  expect(children).toContain("10001-03-003"); // First Son is not proband child
});

test("Test that the children of the proband's parents includes the proband as a child", () => {
  const proband = d["proband"];
  const father = d["people"][proband]["father"];
  const mother = d["people"][proband]["mother"];


  var fathers_children = find_children(father);
  expect(fathers_children).toContain(proband);

  var mothers_children = find_children(mother);
  expect(mothers_children).toContain(proband);
});

test("Test that we can find all partners of the proband", () => {
  const proband = d["proband"];

  var partners = find_all_partners(proband);
  console.log(partners);
  expect(partners).toContain("10001-01-002"); // First partner of Proband
  expect(partners).toContain("10001-01-003"); // Second partner of Proband

});
