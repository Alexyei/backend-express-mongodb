export function shuffle(array:any[]){
    //https://stackoverflow.com/a/46545530/10000274
    return array
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
}