export function Add(params: string[]) {
    const [a, b] = params.map(Number);
    console.log(`Add function called with parameters: ${a}, ${b}`);
    console.log(`Result: ${a + b}`);
}

export function Sub(params: string[]) {
    const [a, b] = params.map(Number);
    console.log(`Sub function called with parameters: ${a}, ${b}`);
    console.log(`Result: ${a - b}`);
}
