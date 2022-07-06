export function omit(obj: object & {[key: string]:any}, ...properties:string[]){
    properties.forEach((prop)=>{delete obj[prop]})
    return obj;
}
