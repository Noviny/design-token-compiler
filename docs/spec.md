// schema

Implemented Schema:

```
String:: '"' : any characters other than '"' : '"'
Indent:: '\t' | '  '
LineBreak:: '\n'
SetItemDeclarator:: '- '
```

```
color:: [color-like-string : reference]

String:: '"' : any characters other than '"' : '"'
object:: name : "\n" | name : ": "
key:: name : "\n" | name : ": "
value:: any
keyValue:: Key : Value
Object:: [KeyValue]
Array::
Reference::
Number:: [0-9]

ArrayItem

// Any string could also be a reference

pass 1: build AST with possibleReferences
pass 2: resolve possibleReferences
pass 3: validate against schema


color
    [object]
        name [string]
        color [color]!
        foreground [color]
        background [color]
scale
    [array]
        [string]
        [number]
        [object]
            name [string]
            value [number]
```

// input

```yaml
color
    [
        name Action
        color #ff8800
        foreground color.Text
        background color.Background
    ]
    [
        name Text
        color #011010
    ]
    [
        name Background
        color #ccc
    ]
    [
        name Brand
        color "blue"
        foreground color.Action
        background color.Background
    ]
scale
    [ 0 ]
    [ 2rem ]
    [ 3.752rem ]




    "

    Some body
    once told
    the world was gonna roll me
    I ain't the sharpest tool in the shed
    "

scale
    - color
    - "color"
    - "color.Action"

```

// output: target = JSON

```
{
    "color":
        [
            {
                "name": "Action",
                "color": "#ff8800",
                "foreground": "#011010",
                "background": "#ccc"
            },
            {
                "name": "Text",
                "color": "#011010",
            },
            {
                "name": "Background",
                "color": "#ccc",
            },
            {
                "name": "Brand",
                "color": "blue",
                "foreground": "#ff8800"
                "background": "#ccc"
            }
        ],
    "scale": [ 0, "2rem", "3.752rem" ]
}
```

## Formal grammar

// Things we are using:

\n === return character

```
TopLevelKey:: Newline : Key


Indent:: tab character OR two space characters
NewLine:: [Return : FileStart]

TopKeyLine:: Key : Return
KeyValueLine:: Indent* : Key : Value : Return
InlineArray:: Indent* ArrayStart : Key : Value : ArrayEnd : Return

Key:: string
Value:: Complex!
ArrayStart:: "["
ArrayEnd:: "]"
Return:: "\n"
Indent:: tab character OR two space characters

```

```
FunctionDeclaration:: FunctionDeclarator : OpenParens : Arguments : CloseParens : OpenSquigglyParens : FunctionBody : CloseSquigglyParens
Arguments:: [[IdentifierWithComma*] : Identifier]
FunctionBody:: [Statement*] : [ReturnStatement]
IdentifierWithComma:: Identifier : Comma
ReturnStatement:: Return : OperationalExpression
FunctionExpression:: Identifier : OpenParens : CallArguments : CloseParens
CallArguments:: [[OperationalExpressionWithComma*] : OperationalExpression]
OperationalExpressionWithComma:: OperationalExpression : Comma

# tokens
FunctionDeclarator:: "function"
OpenParens:: "("
CloseParens:: ")"
OpenSquigglyParens:: "{"
CloseSquigglyParens:: "}"
Comma:: ","
Return:: "return"
String:: Any set of characters bound by "'" and "'". Internal uses of "'" must be preceded by "\", where the "\" is ignored
```

There are also some changes to the previous grammar to handle new Values. Here is the complete grammar with new or changed elements indicated:

```js
const tokenShapes = [

Key:: string
Value:: Complex!
ArrayStart:: "["
ArrayEnd:: "]"
Return:: "\n"
Indent:: tab character OR two space characters
]

let counter = 0;

const tokenizer = yaml => {
	let tokens = [];

	while (yaml.length && counter < 1000) {
		counter++;
		let tokenShape = tokenShapes.find(({ type, matchPattern }) => {
			const check = new RegExp(`^${matchPattern}`);
			return check.test(yaml);
		});
		if (!tokenShape) {
			const check = new RegExp(space);
			if (check.test(yaml)) {
				yaml = yaml.replace(/^(\s|\n)+/, "");
				continue;
			}
			console.error("could not get token from", yaml, yaml.length);
			throw new Error("could not parse a token here");
		}
		const { type, matchPattern, getValue } = tokenShape;
		const check = new RegExp(matchPattern);
		const tokenYaml = check.exec(yaml)[0];
		yaml = yaml.replace(tokenYaml, "");
		if (type === "blankSpace") continue;

		const token = { type };

		if (getValue) {
			token.value = getValue(tokenYaml);
		}
		tokens.push(token);
	}

	return tokens; // an array of tokens in processed order
};
```
