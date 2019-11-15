const TreeMaker = items => {
  let tree = {
    node: "root",
    depth: 0,
  };
  let stack = [tree];

  while (items.length) {
    let item = items.shift();
    let added = false;

    while (added === false) {
      let peek = stack[stack.length - 1];

      if (peek.depth < item.depth) {
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

let ourItems = [
  { node: "a", depth: 1 },
  { node: "b", depth: 2 },
  { node: "c", depth: 3 },
  { node: "d", depth: 2 },
  { node: "e", depth: 1 },
  { node: "f", depth: 2 },
  { node: "g", depth: 1 },
  { node: "h", depth: 2 },
];

let desiredOutput = {
  node: "root",
  children: [
    {
      node: "a",
      children: [{ node: "b", children: [{ node: "c" }] }, { node: "d" }],
    },
    { node: "e", children: [{ node: "f" }] },
    { node: "g", children: [{ node: "h" }] },
  ],
};

console.log(JSON.stringify(TreeMaker(ourItems), undefined, 2));
