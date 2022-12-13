import {allo, sqlite} from "./deps.ts";

const Arguments = allo.Arguments;
const ExpectedException = allo.ExpectedException;

function getArguments() {
    const args = new Arguments({
        ...Arguments.createHelpOptions(),
        'table': {
            shortName: 't',
            description: 'Table Name.',
            convertor: Arguments.stringConvertor,
            default: () => "data"
        },
        'filename': {
            shortName: 'fn',
            description: 'Database file Name.',
            convertor: Arguments.stringConvertor
        },
        'json': {
            shortName: 'j',
            description: 'Json file.',
            convertor: Arguments.stringConvertor
        }
    }).setDescription("Json 2 Sqlite.")


    // Important for `--help` flag works.
    if (args.isHelpRequested()) args.triggerHelp();

    return args.getFlags();
}

/*
    const args = getArguments();
    console.log(args);
returns:
{
  help: undefined,
  table: "data",
  filename: "MarvelCdb.db",
  json: ".\\Samples\\MarvelCdb.v1.json"
}
 */
try {
    const args = getArguments() as {table: string, filename: string, json: string};
    const jsonString = new TextDecoder().decode(await Deno.readFile(args.json, {encoding: 'utf8'}));
    const json = JSON.parse(jsonString);
    const stringFields = [] as Array<string>;
    const numberFields = [] as Array<string>;
    const booleanFields = [] as Array<string>;
    const objectFields = [] as Array<string>;

    const pushTo = (arr: Array<string>, type: string, fieldName: string) => {
      const isStringField = stringFields.indexOf(fieldName) !== -1;
      const isNumberField = numberFields.indexOf(fieldName) !== -1;
      const isBoolField = booleanFields.indexOf(fieldName) !== -1;
      const isObjField = objectFields.indexOf(fieldName) !== -1;
      if(!isStringField && !isNumberField && !isBoolField && !isObjField){
          arr.push(fieldName);
          return;
      }
      const prevType = isStringField ? "string" : isNumberField ? "number" : isBoolField ? "boolean" : "object";
      if(type !== prevType && prevType !== "object") {
          // need to remove it from where it is and make it an object field
          const prevArray = isStringField ? stringFields : isNumberField ? numberFields : isBoolField ? booleanFields : objectFields;
          const index = prevArray.indexOf(fieldName);
          prevArray.splice(index, 1); // remove element
          
          objectFields.push(fieldName);
      }
    };
    
    for(let i=0; i<json.length; i++) {
        Object.entries(json[i]).forEach(([key, value], index) => {
            if (typeof value === 'string') {
                pushTo(stringFields, 'string', key);
            } else if (typeof value === 'number') {
                pushTo(numberFields, 'number', key);
            } else if (typeof value === 'boolean') {
                pushTo(booleanFields, 'boolean', key);
            } else {
                pushTo(objectFields, "object", key);
            }
        });
    }
    const pk = stringFields.indexOf("id") === -1 && numberFields.indexOf("id") == -1 ? 
        "id INTEGER PRIMARY KEY AUTOINCREMENT, " :
        `id ${stringFields.indexOf("id") ? "TEXT" : "NUMBER"} PRIMARY KEY,`
    const sqlString = [
        `CREATE TABLE IF NOT EXISTS '${args.table}' (${pk}`
    ];
    const appendField =(fieldName, sqlType) => {
        if(fieldName !== "id") // skip we got this one
        {
            sqlString[sqlString.length] = `${fieldName} ${sqlType}, `;
        }
    };
    
    for(let i = 0; i < stringFields.length; i++) {
        appendField(stringFields[i], "TEXT");
    }
    for(let i = 0; i < numberFields.length; i++) {
        appendField(numberFields[i], "NUMBER");
    }
    for(let i = 0; i < booleanFields.length; i++) {
        appendField(booleanFields[i], "BOOL");
    }
    for(let i = 0; i < objectFields.length; i++) {
        appendField(objectFields[i], "BLOB");
    }
    sqlString[sqlString.length-1] = sqlString[sqlString.length-1].trim().substring(0, sqlString[sqlString.length-1].trim().length-1)
    sqlString[sqlString.length] = ")";

    const db = new sqlite.DB(args.filename);
    await db.execute(sqlString.join(""));

    const sqlEscape = (value : string) => {
        return value.replace(/"/g, '""').replace(/'/g, "''");
    }
    // Insert
    for(let i=0; i<json.length; i++)
    {
        const fieldList = [] as Array<string>;
        const valueList = [] as Array<string>;
        Object.entries(json[i]).forEach(([key, value], index) => {
            fieldList[fieldList.length] = key;
            const dataType = stringFields.indexOf(key) !== -1 ? "string" :
                numberFields.indexOf(key) !== -1 ? "number" :
                booleanFields.indexOf(key)!== -1? "bool" : "blob";
            console.log(key, dataType);
            valueList[valueList.length] = dataType === "string" ?
                    `'${sqlEscape((value || '') as string)}'`:
                dataType === "number" ?
                    `${value}` :
                dataType === "bool" ?
                    `${value === true}` :
                    `'${sqlEscape(JSON.stringify(value))}'`;
        });

        const sql = `
            INSERT INTO ${args.table} (${fieldList.join(", ")})
                VALUES (${valueList.join(", ")})`;
        console.log(sql);
        await db.execute(sql);
    }
    db.close();
    
} catch (error) {
    Arguments.rethrowUnprintableException(error);
}