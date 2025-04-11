
// The below makes the jest console.log output cleaner and on one line
global.console.log = (msg) => {
  const stack = new Error().stack;
  const callerLine = stack.split("\n")[2]; // Get the relevant line from the stack
  const match = callerLine.match(/\((.*):(\d+):\d+\)/); // Extract file path and line number
  let prefix = '';

  if (match) {
    const filePath = match[1].split("/").slice(-1); // Get the file name
    const lineNumber = match[2];
    prefix = filePath + ":" + lineNumber;
  }

  process.stdout.write(`${prefix} ${JSON.stringify(msg)} \n`);
}
