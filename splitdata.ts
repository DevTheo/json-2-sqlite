export const splitData = (data: any, path: string) => {
    const pathArray = path.split(".")

    for (let i = 0; i < pathArray.length; i++)
    {
        data = data[pathArray[i]];
        if (data === undefined)
        {
            throw new Error(`Path ${pathArray[i]} does not exist`);
        }
    }
    return data;
}