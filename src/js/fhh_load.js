
export async function check_for_files() {
  await getFileList("/examples/");
}

export function load_files_into_select(file_list) {
  const select = document.getElementById("file_select");

  for(let i = select.options.length - 1; i >= 0; i--) {
     select.remove(i);
  }
  const blank_option = document.createElement('option');
  blank_option.text = ""
  select.add(blank_option);

  for (const i2 in file_list) {

      const option = document.createElement('option');
      option.value = file_list[i2];
      option.text = file_list[i2];
      select.add(option);
  }
}

export function load_file() {
  alert("Boo");
}

async function getFileList(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const fileLinks = doc.querySelectorAll("a[href]"); // Adjust selector if needed
    const files = Array.from(fileLinks)
      .map((link) => link.getAttribute("href"))
      .filter((href) => href.indexOf('.') > -1); // Filters out directories

    load_files_into_select(files);
    return files;
  } catch (error) {
    console.error("Error fetching file list:", error);
    return [];
  }
}


export async function load_config_and_data(pedigree_file, config_file) {
  if (!pedigree_file) pedigree_file = '../js/fhh_pedigree.test.json';
  if (!config_file) config_file = '../config/basic.json'
  try {
    const [pedigree_response, config_response] = await Promise.all([
      fetch(pedigree_file),
      fetch(config_file)
    ]);

    if (!pedigree_response.ok || !config_response.ok) {
      throw new Error('One or more requests failed');
    }

    let data = await pedigree_response.json();
    let config = await config_response.json();

    return [data, config];

    // Process data1 and data2 here

  }  catch (error) {
    console.error('Error fetching data:', error);
//    throw new Error('One or more requests failed');
  }
}
