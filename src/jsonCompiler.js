const compilerSwitch = (node, initialTree) => {
  switch (node.type) {
    case "LeafPropertyDeclaration": {
      return compilerSwitch(node.value, initialTree);
    }
    case "PropertyDeclaration":
    case "Root": {
      let tokens = {};

      for (let childNode of node.children) {
        tokens[childNode.key] = compilerSwitch(childNode, initialTree);
      }
      return tokens;
    }
    case "SetDeclaration": {
      return node.items.map(i => compilerSwitch(i, initialTree));
    }
    case "Number": {
      return parseInt(node.value);
    }
    case "String": {
      return node.value;
    }
    default: {
      throw new Error(`Compiling unknown type to JSON: ${node.type}`);
    }
  }
};

const compiler = tree => {
  return compilerSwitch(tree, tree);
};

module.exports = compiler;
