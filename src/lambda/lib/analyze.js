import _ from "lodash";

// polymorphic addition
function add(a, b) {
  if (typeof a === "number") {
    return a + b;
  } else if (a.splice) {
    return Array.from({ length: Math.max(a.length, b.length) }).map(
      (__, i) => (a[i] || 0) + (b[i] || 0)
    );
  } else {
    return _.union(Object.keys(a), Object.keys(b)).reduce((sum, key) => {
      sum[key] = (a[key] || 0) + (b[key] || 0);
      return sum;
    }, {});
  }
}

export function summarize(node) {
  if (!node) {
    return {};
  }

  const { arr, direct } = ESTreeStructure[node.type] || { arr: [], direct: [] };

  // recurse on children
  const sum = arr
    .map(key => node[key].map(summarize).reduce(add, {}))
    .concat(direct.map(key => summarize(node[key])))
    .reduce(add, {});

  // add current node
  (countAs.byType[node.type] || []).forEach(sumKey => {
    sum[sumKey] = (sum[sumKey] || 0) + 1;
    //console.log("counting", node.type, "as", sumKey)
  });

  countAs.byFn.forEach(({ fn, sumKey }) => {
    if (fn(node)) {
      sum[sumKey] = (sum[sumKey] || 0) + 1;
      //console.log("[test fn] counting node as", sumKey)
    }
  });

  return sum;
}

export const countTypes = {
  function: [
    "FunctionDeclaration",
    "FunctionExpression",
    "ArrowFunctionExpression"
  ],
  for: ["ForStatement"],
  reduce: [
    node =>
      node.type === "MemberExpression" &&
      node.property.type === "Identifier" &&
      node.property.name === "reduce"
  ]
};

const countAs = Object.entries(countTypes).reduce(
  (countAs, [sumKey, nodeTests]) => {
    nodeTests
      .filter(test => typeof test === "string")
      .forEach(type => {
        countAs.byType[type] = countAs.byType[type] || [];
        countAs.byType[type].push(sumKey);
      });
    countAs.byFn = countAs.byFn.concat(
      nodeTests
        .filter(test => typeof test === "function")
        .map(fn => ({ fn, sumKey }))
    );
    return countAs;
  },
  {
    byFn: [],
    byType: {}
  }
);

const ESTreeStructure = {
  Line: { arr: [], direct: [] },
  Block: { arr: [], direct: [] },
  Program: { arr: ["body"], direct: [] },
  EmptyStatement: { arr: [], direct: [] },
  BlockStatement: { arr: ["body"], direct: [] },
  ExpressionStatement: { arr: [], direct: ["expression"] },
  IfStatement: { arr: [], direct: ["test", "consequent", "alternate"] },
  LabeledStatement: { arr: [], direct: ["body"] },
  BreakStatement: { arr: [], direct: [] },
  ContinueStatement: { arr: [], direct: [] },
  WithStatement: { arr: [], direct: ["object", "body"] },
  SwitchStatement: { arr: ["cases"], direct: ["discriminant"] },
  ReturnStatement: { arr: [], direct: ["argument"] },
  ThrowStatement: { arr: [], direct: ["argument"] },
  TryStatement: { arr: [], direct: ["block", "handler", "finalizer"] },
  WhileStatement: { arr: [], direct: ["test", "body"] },
  DoWhileStatement: { arr: [], direct: ["body", "test"] },
  ForStatement: { arr: [], direct: ["init", "test", "update", "body"] },
  ForInStatement: { arr: [], direct: ["left", "right", "body"] },
  DebuggerStatement: { arr: [], direct: [] },
  FunctionDeclaration: { arr: ["params"], direct: ["body"] },
  VariableDeclaration: { arr: ["declarations"], direct: [] },
  VariableDeclarator: { arr: [], direct: ["id", "init"] },
  ThisExpression: { arr: [], direct: [] },
  ArrayExpression: { arr: ["elements"], direct: [] },
  ObjectExpression: { arr: ["properties"], direct: [] },
  Property: { arr: [], direct: ["key", "value"] },
  FunctionExpression: { arr: [], direct: ["body"] },
  SequenceExpression: { arr: ["expressions"], direct: [] },
  UnaryExpression: { arr: [], direct: ["argument"] },
  BinaryExpression: { arr: [], direct: ["left", "right"] },
  AssignmentExpression: { arr: [], direct: ["left", "right"] },
  UpdateExpression: { arr: [], direct: ["argument"] },
  LogicalExpression: { arr: [], direct: ["left", "right"] },
  ConditionalExpression: {
    arr: [],
    direct: ["test", "alternate", "consequent"]
  },
  CallExpression: { arr: ["arguments"], direct: ["callee"] },
  NewExpression: { arr: [], direct: [] }, // ??
  MemberExpression: { arr: [], direct: ["object", "property"] },
  SwitchCase: { arr: ["consequent"], direct: ["test"] },
  CatchClause: { arr: [], direct: ["param", "body"] },
  Identifier: { arr: [], direct: [] },
  Literal: { arr: [], direct: [] },
  ForOfStatement: { arr: [], direct: ["left", "right", "body"] },
  Super: { arr: [], direct: [] },
  SpreadElement: { arr: [], direct: ["argument"] },
  ArrowFunctionExpression: { arr: ["params"], direct: ["body"] },
  YieldExpression: { arr: [], direct: ["argument"] },
  TemplateLiteral: { arr: ["quasis", "expressions"], direct: [] },
  TaggedTemplateExpression: { arr: [], direct: ["tag", "quasi"] },
  TemplateElement: { arr: [], direct: [] },
  ObjectPattern: { arr: ["properties"], direct: [] },
  ArrayPattern: { arr: ["elements"], direct: [] },
  RestElement: { arr: [], direct: ["argument"] },
  AssignmentPattern: { arr: [], direct: ["left", "right"] },
  ClassBody: { arr: ["body"], direct: [] },
  MethodDefinition: { arr: [], direct: ["key", "value"] },
  ClassDeclaration: { arr: [], direct: ["superClass", "body"] },
  ClassExpression: { arr: [], direct: ["superClass", "body"] },
  MetaProperty: { arr: [], direct: [] },
  ImportDeclaration: { arr: [], direct: [] },
  ImportSpecifier: { arr: [], direct: [] },
  ImportDefaultSpecifier: { arr: [], direct: [] },
  ImportNamespaceSpecifier: { arr: [], direct: [] },
  ExportNamedDeclaration: { arr: [], direct: ["declaration"] },
  ExportSpecifier: { arr: [], direct: [] },
  ExportDefaultDeclaration: { arr: [], direct: ["declaration"] },
  ExportAllDeclaration: { arr: [], direct: [] },
  AwaitExpression: { arr: [], direct: ["argument"] }
};
