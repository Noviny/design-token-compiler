/*
We need a TODO list:

- I'm not 100% happy with the tokens code...
*/

const tokenShapes = [
  // Because I am a "person", the order these tokens is written in has impact
  // on how the code runs. We should be aware of this ++ fix this in the future
  {
    type: "Indent",
    // Two spaces OR a tab
    matchPattern: `(  |\t)`
  },
  {
    type: "LineBreak",
    matchPattern: `\n`
  },
  {
    type: "CommentLine",
    matchPattern: `// [^\n]*`,
    getValue: code => code.match(/\/\/ ([^\n]*)/)[1]
  },
  {
    type: "SetItemDeclarator",
    matchPattern: `- `
  },
  {
    type: "Variable",
    matchPattern: `[a-zA-Z]+`,
    getValue: code => code
  },
  {
    type: "KeySeparator",
    matchPattern: `:`
  },
  {
    type: "ObjectReferenceSeparator",
    matchPattern: `\\.`
  },
  {
    type: "String",
    matchPattern: `"[^"]*"`,
    getValue: code => code.match(/"([^"]*)"/)[1]
  },
  {
    type: "Number",
    matchPattern: `[0-9]+`,
    getValue: code => code
  }
];

let counter = 0;

const space = `^\\s+`;

const tokenizer = file => {
  let tokens = [];

  while (file.length && counter < 1000) {
    counter++;
    let tokenShape = tokenShapes.find(({ type, matchPattern }) => {
      const check = new RegExp(`^${matchPattern}`);
      return check.test(file);
    });
    if (!tokenShape) {
      const check = new RegExp(space);
      if (check.test(file)) {
        file = file.replace(/^(\s|\n)+/, "");
        continue;
      }
      console.error("could not get token from", file, file.length);
      throw new Error("could not parse a token here");
    }
    const { type, matchPattern, getValue } = tokenShape;
    const check = new RegExp(matchPattern);
    const tokenfile = check.exec(file)[0];
    file = file.replace(tokenfile, "");
    if (type === "blankSpace") continue;

    const token = { type };

    if (getValue) {
      token.value = getValue(tokenfile);
    }
    tokens.push(token);
  }

  return tokens; // an array of tokens in processed order
};

module.exports = tokenizer;
