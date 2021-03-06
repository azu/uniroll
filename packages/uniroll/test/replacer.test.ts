import "isomorphic-unfetch";
import assert from "assert";
import { compile } from "../src/prod";

test("replace", async () => {
  const files = {
    "/foo.tsx": "export default 'foo'",
    "/bar.tsx": "export default 'bar'",
    "/index.tsx": `
import Foo from "./foo";
import Bar from "./bar";

declare const $props: {
  useFoo: boolean;
};

let x;
if ($props.useFoo) {
  x = Foo;
} else {
  x = Bar;
}

console.log(x);
  `,
  };
  try {
    const bundle = await compile({
      useInMemory: true,
      replaceMap: {
        "$props.useFoo": JSON.stringify(false),
      },
      files,
      input: "/index.tsx",
      onWarn: (message) => {
        console.log("onwarn", message);
      },
      cssPostprocess: (t) => t,
    });
    const out = await bundle.generate({ format: "es" });
    const code = out.output[0].code;
    // dose not include foo by DCE
    assert.ok(!code.includes("foo"));
    assert.ok(!code.includes("Foo"));

    // include only bar
    assert.ok(code.includes("bar"));
    assert.ok(code.includes("Bar"));

    expect(code).toMatchSnapshot();
  } catch (err) {
    console.log(err);
    throw err;
  }
});

test("replace object", async () => {
  const files = {
    "/index.tsx": `
declare const $props: {
  obj: {
    foo: 1,
    bar: 2
  };
};

console.log($props.obj.foo);
  `,
  };
  try {
    const bundle = await compile({
      useInMemory: true,
      replaceMap: {
        "$props.obj": JSON.stringify({ foo: 1, bar: 2 }),
      },
      files,
      input: "/index.tsx",
      onWarn: (message) => {
        console.log("onwarn", message);
      },
      cssPostprocess: (t) => t,
    });
    const out = await bundle.generate({ format: "es" });
    const code = out.output[0].code;
    // console.log(code);
    assert.ok(!code.includes("obj.foo"));
    // expect {...}.foo
    assert.ok(code.includes("}.foo"));

    expect(code).toMatchSnapshot();
  } catch (err) {
    console.log(err);
    throw err;
  }
});
