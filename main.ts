import { parseArguments } from "./argsparser.ts";
import { buildTable, createInsert } from "./sqlcreator.ts";
import {allo, sqlite} from "./deps.ts";
import { splitData } from "./splitdata.ts";

try {
    const args = parseArguments() as {table: string, filename: string, json: string, path? : string};
    const jsonString = new TextDecoder("utf-8").decode(await Deno.readFile(args.json));
    const json = JSON.parse(jsonString);
    let data = json;
    if (args.path !== undefined){
        data = splitData(data, args.path);
    }
    // Create db and table
    // deno-lint-ignore prefer-const
    let {sql, stringFields, numberFields, booleanFields} = buildTable(args.table, data); 
    const db = new sqlite.DB(args.filename);
    await db.execute(sql as string);

    // Insert data
    for(let i=0; i<data.length; i++)
    {
        const sql = createInsert(args.table, data[i], stringFields, numberFields, booleanFields);
        await db.execute(sql);
    }
    db.close();
    
} catch (error) {
    allo.Arguments.rethrowUnprintableException(error);
}