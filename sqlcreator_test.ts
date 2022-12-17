import { assertEquals }  from "https://deno.land/std@0.165.0/testing/asserts.ts";

import {buildTable, createInsert} from "./sqlcreator.ts";
    // deno-lint-ignore no-explicit-any
    const getResult = (json: any) => {
        return buildTable("data", json);
    }
    const singleStringField = getResult([{ "test": "test"}]);
    const singleNumberField = getResult([{ "test": 1}]);
    const singleBooleanNumberField = getResult([{ "test": true}]);
    const singleObjectNumberField = getResult([{ "test": {"a":"b", "c": 1} }]);
    const singleIdField = getResult(justAnID());
    const complexObject = getResult(complexJson());
Deno.test("buildTable Tests", async (t) => {

    
    // deno-lint-ignore require-await
    await t.step("single String Field", async () => {
        const {sql, stringFields, numberFields, booleanFields} = singleStringField;
        assertEquals(1, stringFields.length, `stringFields should contains a single field name; it contains ${(stringFields || []).length}`);
        assertEquals("test", stringFields[0], "stringFields[0] should be 'test'");
        assertEquals(0, numberFields.length, "numberFields should be empty");
        assertEquals(0, booleanFields.length, "numberFields should be empty");
        assertEquals("CREATE TABLE IF NOT EXISTS 'data' (id INTEGER PRIMARY KEY AUTOINCREMENT, test TEXT)", sql, `sql does not match; was '${sql}'`); 
    });

    // deno-lint-ignore require-await
    await t.step("single Number Field", async () => {
        const {sql, stringFields, numberFields, booleanFields} = singleNumberField;
        assertEquals(0, stringFields.length, `stringFields should contains a single field name; it contains ${(stringFields || []).length}`);
        assertEquals(1, numberFields.length, "numberFields should be empty");
        assertEquals("test", numberFields[0], "numberFields[0] should be 'test'");
        assertEquals(0, booleanFields.length, "numberFields should be empty");
        assertEquals("CREATE TABLE IF NOT EXISTS 'data' (id INTEGER PRIMARY KEY AUTOINCREMENT, test NUMBER)", sql, `sql does not match; was '${sql}'`); 
    });
    
    // deno-lint-ignore require-await
    await t.step("single Boolean Field", async () => {
        const {sql, stringFields, numberFields, booleanFields} = singleBooleanNumberField;
        assertEquals(0, stringFields.length, `stringFields should contains a single field name; it contains ${(stringFields || []).length}`);
        assertEquals(0, numberFields.length, "numberFields should be empty");
        assertEquals(1, booleanFields.length, "numberFields should be empty");
        assertEquals("test", booleanFields[0], "booleanFields[0] should be 'test'");
        assertEquals("CREATE TABLE IF NOT EXISTS 'data' (id INTEGER PRIMARY KEY AUTOINCREMENT, test BOOL)", sql, `sql does not match; was '${sql}'`); 
    });
    
    // deno-lint-ignore require-await
    await t.step("single Object Field", async () => {
        const {sql, stringFields, numberFields, booleanFields} = singleObjectNumberField;
        assertEquals(0, stringFields.length, `stringFields should contains a single field name; it contains ${(stringFields || []).length}`);
        assertEquals(0, numberFields.length, "numberFields should be empty");
        assertEquals(0, booleanFields.length, "numberFields should be empty");
        assertEquals("CREATE TABLE IF NOT EXISTS 'data' (id INTEGER PRIMARY KEY AUTOINCREMENT, test BLOB)", sql, `sql does not match; was '${sql}'`); 
    });
    
    // deno-lint-ignore require-await
    await t.step("single Id Field", async () => {
        const {sql, stringFields, numberFields, booleanFields} = singleIdField;
        assertEquals(0, stringFields.length, `stringFields should contains a single field name; it contains ${(stringFields || []).length}`);
        assertEquals(1, numberFields.length, "numberFields should be empty");
        assertEquals("id", numberFields[0], "numberFields[0] should be 'id'");
        assertEquals(0, booleanFields.length, "numberFields should be empty");
        assertEquals("CREATE TABLE IF NOT EXISTS 'data' (id TEXT PRIMARY KEY)", sql, `sql does not match; was '${sql}'`); 
    });
    
    // deno-lint-ignore require-await
    await t.step("Complex Object", async () => {
        const {sql, stringFields, numberFields, booleanFields} = complexObject;
        assertEquals(1, stringFields.length, `stringFields should contains a single field name; it contains ${(stringFields || []).length}`);
        assertEquals(2, numberFields.length, "numberFields should be empty");
        assertEquals("id", numberFields[0], "numberFields[0] should be 'id'");
        assertEquals(1, booleanFields.length, "numberFields should be empty");
        assertEquals("CREATE TABLE IF NOT EXISTS 'data' (id TEXT PRIMARY KEY, str TEXT, num NUMBER, tf BOOL, obj BLOB)", sql, `sql does not match; was '${sql}'`); 
    });

});

//WIP create insert tests
Deno.test("createInsert Tests", async(t) =>{
    //initialize test
    // deno-lint-ignore no-explicit-any
    const getResult = (rows: any, strings:Array<string>, numbers:Array<string>, booleans:Array<string>) => {
        return createInsert("data",rows,strings,numbers,booleans);
    }
    // deno-lint-ignore require-await
    await t.step("Single String Field", async () => {
        const {stringFields, numberFields, booleanFields} = singleStringField;
        const json = ["test"];
        const insertSQL = createInsert("data",json,stringFields,numberFields,booleanFields);
        assertEquals("INSERT INTO data (0) VALUES (\'\"\"test\"\"\')", insertSQL, `sql does not match; was '${insertSQL}'`);
    });
    // deno-lint-ignore require-await
    await t.step("Multi String Field", async () => {
        const {stringFields, numberFields, booleanFields} = singleStringField;
        const json = ["test","test2"];
        const insertSQL = createInsert("data",json,stringFields,numberFields,booleanFields);
        assertEquals("INSERT INTO data (0, 1) VALUES (\'\"\"test\"\"\', \'\"\"test2\"\"\')", insertSQL, `sql does not match; was '${insertSQL}'`);
    });
    // deno-lint-ignore require-await
    await t.step("Single Number Field", async () => {
        const {stringFields, numberFields, booleanFields} = singleNumberField;
        const json = [1];
        const insertSQL = createInsert("data",json,stringFields,numberFields,booleanFields);
        assertEquals("INSERT INTO data (0) VALUES (\'1\')", insertSQL, `sql does not match; was '${insertSQL}'`); 
    });
    // deno-lint-ignore require-await
    await t.step("Multi Number Field", async () => {
        const {stringFields, numberFields, booleanFields} = singleNumberField;
        const json = [1,2,3,4,5];
        const insertSQL = createInsert("data",json,stringFields,numberFields,booleanFields);
        assertEquals("INSERT INTO data (0, 1, 2, 3, 4) VALUES (\'1\', \'2\', \'3\', \'4\', \'5\')", insertSQL, `sql does not match; was '${insertSQL}'`); 
    });
    // deno-lint-ignore require-await
    await t.step("Single Boolean Field", async () => {
        const {stringFields, numberFields, booleanFields} = singleNumberField;
        const json = [true];
        const insertSQL = createInsert("data",json,stringFields,numberFields,booleanFields);
        assertEquals("INSERT INTO data (0) VALUES (\'true\')", insertSQL, `sql does not match; was '${insertSQL}'`); 
    });
    // deno-lint-ignore require-await
    await t.step("Multi Boolean Field", async () => {
        const {stringFields, numberFields, booleanFields} = singleNumberField;
        const json = [true,false,false,true,false];
        const insertSQL = createInsert("data",json,stringFields,numberFields,booleanFields);
        assertEquals("INSERT INTO data (0, 1, 2, 3, 4) VALUES (\'true\', \'false\', \'false\', \'true\', \'false\')", insertSQL, `sql does not match; was '${insertSQL}'`); 
    });
    // deno-lint-ignore require-await
    await t.step("Single Object Field", async () => {
        const {stringFields, numberFields, booleanFields} = singleNumberField;
        const json = [{"a":"b", "c": 1}];
        const insertSQL = createInsert("data",json,stringFields,numberFields,booleanFields);
        assertEquals("INSERT INTO data (0) VALUES (\'{\"\"a\"\":\"\"b\"\",\"\"c\"\":1}\')", insertSQL, `sql does not match; was '${insertSQL}'`); 
    });
    // deno-lint-ignore require-await
    await t.step("Multi Object Field", async () => {
        const {stringFields, numberFields, booleanFields} = singleNumberField;
        const json = [{"a":"b", "c": 1},{"d":"e", "f": 2}];
        const insertSQL = createInsert("data",json,stringFields,numberFields,booleanFields);
        assertEquals("INSERT INTO data (0, 1) VALUES (\'{\"\"a\"\":\"\"b\"\",\"\"c\"\":1}\', \'{\"\"d\"\":\"\"e\"\",\"\"f\"\":2}\')", insertSQL, `sql does not match; was '${insertSQL}'`); 
    });
    // deno-lint-ignore require-await
    await t.step("single Id Field", async () => {
        const {stringFields, numberFields, booleanFields} = singleIdField;
        const json = justAnID();
        const insertSQL = createInsert("data",json,stringFields,numberFields,booleanFields);
        assertEquals("INSERT INTO data (0) VALUES (\'{\"\"id\"\":1}\')", insertSQL, `sql does not match; was '${insertSQL}'`); 
    });
    // deno-lint-ignore require-await
    await t.step("Complex Object", async () => {
        const {stringFields, numberFields, booleanFields} = singleIdField;
        const json = complexJson();
        const insertSQL = createInsert("data",json,stringFields,numberFields,booleanFields);
        assertEquals("INSERT INTO data (0, 1) VALUES (\'{\"\"id\"\":1,\"\"str\"\":\"\"test\"\",\"\"num\"\":1}\', \'{\"\"id\"\":2,\"\"num\"\":1,\"\"tf\"\":false,\"\"obj\"\":{\"\"a\"\":\"\"b\"\",\"\"c\"\":1}}\')", insertSQL, `sql does not match; was '${insertSQL}'`); 
    });
});

function justAnID(): any {
  return [{ "id": 1 }];
}

function complexJson(): any {
  return [
    { "id": 1, "str": "test", "num": 1 },
    { "id": 2, "num": 1, "tf": false, "obj": { "a": "b", "c": 1 } }
  ];
}
