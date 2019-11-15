const tokenizer = require("./tokenizer");
const parser = require("./parser");
const jsonCompiler = require("./jsonCompiler");

let expecationsSpec = {
  name: "test name",
  fileBody: ``,
  tokenSet: [],
  AST: {
    type: "TokenDefinition",
    keys: [],
  },
  JSONoutput: {},
  skipTokenizing: false,
  skipParsing: false,
  skipOutput: false,
  skip: false,
};

let tokenOnlyTests = [
  // These tests are for singular tokens, they aren't valid syntax
  {
    name: "null case",
    fileBody: "",
    tokenSet: [],
  },
  { fileBody: `  `, tokenSet: [{ type: "Indent" }] },
  { fileBody: `\t`, tokenSet: [{ type: "Indent" }] },
  { fileBody: `\n`, tokenSet: [{ type: "LineBreak" }] },
  {
    fileBody: `- `,
    tokenSet: [{ type: "SetItemDeclarator" }],
  },
  {
    fileBody: `someKey: `,
    tokenSet: [
      { type: "Variable", value: "someKey" },
      { type: "KeySeparator" },
    ],
  },
  {
    fileBody: `"Look string"`,
    tokenSet: [{ type: "String", value: "Look string" }],
  },
].map(a => ({ ...a, skipParsing: true, skipOutput: true }));

let parserTests = [
  {
    fileBody: `someKey
  "someValue"`,
    tokenSet: [
      { type: "Variable", value: "someKey" },
      { type: "LineBreak" },
      { type: "Indent" },
      { type: "String", value: "someValue" },
    ],
    AST: {
      type: "Root",
      children: [
        {
          type: "LeafPropertyDeclaration",
          key: "someKey",
          value: { type: "String", value: "someValue" },
        },
      ],
    },
    only: true,
    JSONoutput: {
      someKey: "someValue",
    },
  },
  {
    fileBody: `someKey: something.somethingElse`,
    tokenSet: [
      { type: "Variable", value: "someKey" },
      { type: "KeySeparator" },
      { type: "Variable", value: "something" },
      { type: "ObjectReferenceSeparator" },
      { type: "Variable", value: "somethingElse" },
    ],
    AST: {
      type: "Root",
      children: [
        {
          type: "LeafPropertyDeclaration",
          key: "someKey",
          value: {
            type: "VariableUsage",
            value: {
              type: "ChainedvariableUsage",
              left: "something",
              right: {
                type: "VariableUsage",
                value: "somethingElse",
              },
            },
          },
        },
      ],
    },
  },
  {
    fileBody: `scale
  - 0
  - 52
  - "5rem"`,
    tokenSet: [
      { type: "Variable", value: "scale" },
      { type: "LineBreak" },
      { type: "Indent" },
      { type: "SetItemDeclarator" },
      { type: "Number", value: "0" },
      { type: "LineBreak" },
      { type: "Indent" },
      { type: "SetItemDeclarator" },
      { type: "Number", value: "52" },
      { type: "LineBreak" },
      { type: "Indent" },
      { type: "SetItemDeclarator" },
      { type: "String", value: "5rem" },
    ],
    AST: {
      type: "Root",
      children: [
        {
          type: "SetDeclaration",
          key: "scale",
          items: [
            { type: "Number", value: "0" },
            { type: "Number", value: "52" },
            { type: "String", value: "5rem" },
          ],
        },
      ],
    },
  },
  {
    fileBody: `scale:
  - 0
  - 52
  - "5rem"`,
    tokenSet: [
      { type: "Variable", value: "scale" },
      { type: "KeySeparator" },
      { type: "LineBreak" },
      { type: "Indent" },
      { type: "SetItemDeclarator" },
      { type: "Number", value: "0" },
      { type: "LineBreak" },
      { type: "Indent" },
      { type: "SetItemDeclarator" },
      { type: "Number", value: "52" },
      { type: "LineBreak" },
      { type: "Indent" },
      { type: "SetItemDeclarator" },
      { type: "String", value: "5rem" },
    ],
    AST: {
      type: "Root",
      children: [
        {
          type: "SetDeclaration",
          key: "scale",
          items: [
            { type: "Number", value: "0" },
            { type: "Number", value: "52" },
            { type: "String", value: "5rem" },
          ],
        },
      ],
    },
  },
  {
    fileBody: `someKey:
  "someValue"`,
    tokenSet: [
      { type: "Variable", value: "someKey" },
      { type: "KeySeparator" },
      { type: "LineBreak" },
      { type: "Indent" },
      { type: "String", value: "someValue" },
    ],
    AST: {
      type: "Root",
      children: [
        {
          type: "LeafPropertyDeclaration",
          key: "someKey",
          value: { type: "String", value: "someValue" },
        },
      ],
    },
  },
  {
    fileBody: `someKey:
  someValue`,
    tokenSet: [
      { type: "Variable", value: "someKey" },
      { type: "KeySeparator" },
      { type: "LineBreak" },
      { type: "Indent" },
      { type: "Variable", value: "someValue" },
    ],
    AST: {
      type: "Root",
      children: [
        {
          type: "LeafPropertyDeclaration",
          key: "someKey",
          value: { type: "VariableUsage", value: "someValue" },
        },
      ],
    },
  },
  {
    fileBody: `someKey: "something here"`,
    tokenSet: [
      { type: "Variable", value: "someKey" },
      { type: "KeySeparator" },
      { type: "String", value: "something here" },
    ],
    AST: {
      type: "Root",
      children: [
        {
          type: "LeafPropertyDeclaration",
          key: "someKey",
          value: { type: "String", value: "something here" },
        },
      ],
    },
  },
  {
    fileBody: `someKey
  secondKey
    "Hark! A string!"`,
    tokenSet: [
      { type: "Variable", value: "someKey" },
      { type: "LineBreak" },
      { type: "Indent" },
      { type: "Variable", value: "secondKey" },
      { type: "LineBreak" },
      { type: "Indent" },
      { type: "Indent" },
      { type: "String", value: "Hark! A string!" },
    ],
    AST: {
      type: "Root",
      children: [
        {
          type: "PropertyDeclaration",
          key: "someKey",
          children: [
            {
              type: "LeafPropertyDeclaration",
              key: "secondKey",
              value: { type: "String", value: "Hark! A string!" },
            },
          ],
        },
      ],
    },
  },
];

let expectations = [...tokenOnlyTests, ...parserTests];

let getTestBlock = (
  {
    name,
    fileBody,
    tokenSet,
    AST,
    JSONoutput,
    skipTokenizing,
    skipParsing,
    skipOutput,
    skip,
  },
  i,
) => {
  if (skip) return;
  describe(`Running set test ${name || i}`, () => {
    if (typeof fileBody === "string" && !skipTokenizing) {
      it("tokenizer", () => {
        expect(tokenizer(fileBody)).toEqual(tokenSet);
      });
    }
    if (tokenSet && !skipParsing) {
      it("parser", () => {
        expect(parser(tokenSet)).toEqual(AST);
      });
    }
    if (AST && !skipOutput) {
      it("compiler", () => {
        expect(jsonCompiler(AST)).toEqual(JSONoutput);
      });
    }
  });
};

let testConstructor = exp => {
  let only = exp.filter(a => a.only);

  if (only.length) {
    return only.map(getTestBlock);
  }
  exp.map(getTestBlock);
};

testConstructor(expectations);
