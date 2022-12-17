// deno-lint-ignore no-explicit-any
export const buildTable = (tableName: string, json: any) => {
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
        Object.entries(json[i]).forEach(([key, value]) => {
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
        `id ${stringFields.indexOf("id") ? "TEXT" : "NUMBER"} PRIMARY KEY, `
    const sqlString = [
        `CREATE TABLE IF NOT EXISTS '${tableName}' (${pk}`
    ];
    const appendField = (fieldName: string, sqlType: string) => {
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
    return { sql: sqlString.join(""), stringFields, numberFields, booleanFields}; //, objectFields];
}

const sqlEscape = (value : string) => {
    return value.replace(/"/g, '""').replace(/'/g, "''");
}

// deno-lint-ignore no-explicit-any
export const createInsert = (tableName: string, row: any, stringFields: Array<string>, numberFields: Array<string>, booleanFields: Array<string>) => {
    const fieldList = [] as Array<string>;
    const valueList = [] as Array<string>;
    Object.entries(row).forEach(([key, value]) => {
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

    const sql = `INSERT INTO ${tableName} (${fieldList.join(", ")})`+
    ` VALUES (${valueList.join(", ")})`;
    console.log(sql);
    return sql;
} 