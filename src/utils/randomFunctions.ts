//Returns an integer random number between min (included) and max (included):
export function randomInteger(min:number, max:number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}