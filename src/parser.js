const checkIsSet = lines => {
  let checkSet = new Set();

  lines.forEach(l => checkSet.add(l.tokens[0].type));
  if (checkSet.size > 1) {
    throw new Error("Parsing error: Set and non-set items were intermixed");
  }

  return checkSet.has("SetItemDeclarator");
};

const parseSetItems = lines =>
  lines.map(({ tokens }) => {
    let expectedItemDeclarator = tokens.shift();

    if (expectedItemDeclarator.type === "SetItemDeclarator") {
      return parseLines({ tokens });
    }

    throw new Error("Parsing a set of items where one was not a setItem");
  });

const parseVariableDeclarationHelper = (key, children) => {
  if (checkIsSet(children)) {
    return {
      type: "SetDeclaration",
      key: key.value,
      items: parseSetItems(children),
    };
  } else if (children.length === 1) {
    return {
      type: "VariableDeclaration",
      key: key.value,
      value: parseLines(children[0]),
    };
  }
};

const parseLines = ({ children, tokens }) => {
  switch (tokens[0].type) {
    case "Root": {
      return {
        type: "Root",
        children: children.map(parseLines),
      };
    }
    case "Variable": {
      let key = tokens.shift();
      let secondToken = tokens.shift();

      if (children) {
        if (
          !secondToken ||
          (secondToken.type === "KeySeparator" && tokens.length === 0)
        ) {
          return parseVariableDeclarationHelper(key, children);
        }
        throw new Error(
          `Variable "${key.value}" had children but this should be impossible here`,
        );
      }

      if (!secondToken) {
        return {
          type: "VariableUsage",
          value: key.value,
        };
      }

      if (secondToken.type === "KeySeparator" && tokens.length !== 0) {
        // TODO: Make this line less actual trash
        return parseVariableDeclarationHelper(key, [{ tokens }]);
      }

      throw new Error(
        `Something has gone wrong in variable parsing: "${key.value}"`,
      );
    }
    case "String":
    case "Number": {
      if (tokens.length > 1) {
        throw new Error(`A ${token[0].type} token must be on its own line`);
      }
      return tokens[0];
    }
    default: {
      throw new Error(
        `LineNode began with invalid token for single line: ${tokens[0].type}`,
      );
    }
  }
};

const TreeMaker = items => {
  let tree = {
    tokens: [{ type: "Root" }],
    indent: 0,
  };
  let stack = [tree];

  while (items.length) {
    let item = items.shift();
    let added = false;

    while (added === false) {
      let peek = stack[stack.length - 1];

      if (peek.indent < item.indent) {
        if (peek.children) {
          peek.children.push(item);
        } else {
          peek.children = [item];
        }

        stack.push(item);
        added = true;
      } else {
        stack.pop();
      }
    }
  }

  return tree;
};

const parseToLines = tokens => {
  let lines = [];
  let line = [];
  let indent = 1;

  while (tokens.length) {
    let currentToken = tokens.shift();

    switch (currentToken.type) {
      case "Indent": {
        if (line.length) {
          throw new Error("An indent may only occur at the start of a line");
        }
        indent++;
        break;
      }
      case "LineBreak": {
        if (line.length) {
          lines.push({ tokens: line, indent });
        }
        line = [];
        indent = 1;
        break;
      }
      default: {
        line.push(currentToken);
      }
    }
  }

  if (line.length) {
    lines.push({ tokens: line, indent });
  }

  return TreeMaker(lines);
};

const parser = tokens => {
  let newTokens = [...tokens];

  let lineTree = parseToLines(newTokens);

  return parseLines(lineTree);
};

module.exports = parser;
