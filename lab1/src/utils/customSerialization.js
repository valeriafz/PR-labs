const serialize = (data) => {
  if (data === null) return "N";
  if (data === undefined) return "U";
  if (typeof data === "boolean") return `b:${data ? 1 : 0}`;

  if (typeof data === "object") {
    if (Array.isArray(data)) {
      const arrayItems = data.map((item) => serialize(item)).join(",");
      return `a:${data.length}:{${arrayItems}}`;
    } else {
      const entries = Object.entries(data).map(([key, value]) => {
        const serializedKey = serialize(String(key));
        const serializedValue = serialize(value);
        return `${serializedKey},${serializedValue}`;
      });
      return `o:${entries.length}:{${entries.join(",")}}`;
    }
  } else if (typeof data === "string") {
    return `s:${data.length}:"${data}"`;
  } else if (typeof data === "number") {
    if (Number.isInteger(data)) {
      return `i:${data}`;
    }
    return `f:${data}`;
  }

  throw new Error(`Unsupported data type for serialization: ${typeof data}`);
};

const deserialize = (str) => {
  let position = 0;

  function parseValue() {
    if (position >= str.length) {
      throw new Error("Unexpected end of input");
    }

    const type = str[position++];

    switch (type) {
      case "N":
        return null;
      case "U":
        return undefined;
      case "b": {
        expectChar(":");
        return str[position++] === "1";
      }
      case "s": {
        expectChar(":");
        const length = parseLength();
        expectChar('"');
        const value = str.slice(position, position + length);
        position += length;
        expectChar('"');
        return value;
      }
      case "i":
      case "f": {
        expectChar(":");
        const numEnd = findNext([",", "}"], true);
        const num = str.slice(position, numEnd);
        position = numEnd;
        return type === "i" ? parseInt(num, 10) : parseFloat(num);
      }
      case "a":
      case "o": {
        expectChar(":");
        const length = parseLength();
        expectChar("{");
        if (type === "a") {
          const array = [];
          for (let i = 0; i < length; i++) {
            array.push(parseValue());
            if (i < length - 1) expectChar(",");
          }
          expectChar("}");
          return array;
        } else {
          const obj = {};
          for (let i = 0; i < length; i++) {
            const key = parseValue();
            expectChar(",");
            const value = parseValue();
            obj[key] = value;
            if (i < length - 1) expectChar(",");
          }
          expectChar("}");
          return obj;
        }
      }
      default:
        throw new Error(`Unknown type: ${type} at position ${position - 1}`);
    }
  }

  function expectChar(expected) {
    if (position >= str.length) {
      if (expected === "," || expected === "}") {
        return;
      }
      throw new Error(`Expected '${expected}' but reached end of input`);
    }
    if (str[position] !== expected) {
      throw new Error(
        `Expected '${expected}' but found '${str[position]}' at position ${position}`
      );
    }
    position++;
  }

  function parseLength() {
    const endPos = findNext(["{", '"']);
    const length = parseInt(str.slice(position, endPos), 10);
    if (isNaN(length)) {
      throw new Error(`Invalid length at position ${position}`);
    }
    position = endPos;
    return length;
  }

  function findNext(chars, allowEndOfInput = false) {
    for (let i = position; i < str.length; i++) {
      if (chars.includes(str[i])) {
        return i;
      }
    }
    if (allowEndOfInput) {
      return str.length;
    }
    throw new Error(
      `Expected one of ${chars.join(", ")} but reached end of input`
    );
  }

  const result = parseValue();
  if (position < str.length) {
    throw new Error(
      `Unexpected characters after end of input at position ${position}`
    );
  }
  return result;
};

function runTest(testCase) {
  console.log("Original:", testCase);
  try {
    const serialized = serialize(testCase);
    console.log("Serialized:", serialized);

    const deserialized = deserialize(serialized);
    console.log("Deserialized:", deserialized);
  } catch (error) {
    console.error("Error:", error.message);
  }
  console.log("---");
}

const testCases = [
  {
    name: "John Doe",
    age: 30,
    isStudent: false,
    gpa: 3.8,
    hobbies: ["reading", "gaming", null],
    address: {
      street: "123 Main St",
      city: "New York",
      zipcode: 10001,
    },
    spouse: null,
    certification: undefined,
  },
  [1, "test", { x: 5 }, null, true],
  42,
  "Hello, World!",
  true,
  null,
  undefined,
];

console.log("Running tests:");
testCases.forEach((testCase, index) => {
  console.log(`\nTest Case ${index + 1}:`);
  runTest(testCase);
});
