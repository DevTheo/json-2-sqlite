import { assertEquals }  from "https://deno.land/std@0.165.0/testing/asserts.ts";

import { splitData } from "./splitdata.ts";
// deno-lint-ignore no-explicit-any
const data = {string: "test", num: 1, bool: true, layer2: { string: "test2", num: 2, bool: false, layer3: {layer4: {layer5: {string:"matryoshka"}}}}};

Deno.test("splitData", async (t) => {
    // deno-lint-ignore require-await
    await t.step("Single Layer String", async () => {
        const json = data;
        const path = "string";
        const split = splitData(json,path);
        assertEquals("test", split, `data does not match; was '${split}'`);
    });
    // deno-lint-ignore require-await
    await t.step("Single Layer Number", async () => {
        const json = data;
        const path = "num";
        const split = splitData(json,path);
        assertEquals(1, split, `data does not match; was '${split}'`);
    });
    // deno-lint-ignore require-await
    await t.step("Single Layer Boolean", async () => {
        const json = data;
        const path = "bool";
        const split = splitData(json,path);
        assertEquals(true, split, `data does not match; was '${split}'`);
    });
    // deno-lint-ignore require-await
    await t.step("Multi Layer String", async () => {
        const json = data;
        const path = "layer2.string";
        const split = splitData(json,path);
        assertEquals("test2", split, `data does not match; was '${split}'`);
    });
    // deno-lint-ignore require-await
    await t.step("Multi Layer Number", async () => {
        const json = data;
        const path = "layer2.num";
        const split = splitData(json,path);
        assertEquals(2, split, `data does not match; was '${split}'`);
    });
    // deno-lint-ignore require-await
    await t.step("Multi Layer Boolean", async () => {
        const json = data;
        const path = "layer2.bool";
        const split = splitData(json,path);
        assertEquals(false, split, `data does not match; was '${split}'`);
    });
    // deno-lint-ignore require-await
    await t.step("Long Layer String", async () => {
        const json = data;
        const path = "layer2.layer3.layer4.layer5.string";
        const split = splitData(json,path);
        assertEquals("matryoshka", split, `data does not match; was '${split}'`);
    });
});
