type TypeHandler = (a: any, b: any) => boolean;

const operatorNameToSymbol: Record<string, string> = {
  // Text-based comparison operators
  greaterthan: '>',
  greaterthanorequal: '>=',
  lessthan: '<',
  lessthanorequal: '<=',
  equal: '==',
  equals: '==',
  notequal: '!=',
  notequals: '!=',

  // Shorthand comparison operators
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
  ne: '!=',
};
class LogicalFunctions {
  private typeHandlers: Map<string, Record<string, TypeHandler>>;

  constructor() {
    // Initialize a map to hold handlers for different types/classes
    this.typeHandlers = new Map();
  }

  // Register operator for a specific class or type (e.g., Person, Animal, Number, etc.)
  register(type: string, operator: string, handler: TypeHandler): void {
    if (!this.typeHandlers.has(type)) {
      this.typeHandlers.set(type, {});
    }
      const typeRegistry = this.typeHandlers.get(type)!;

    if (typeRegistry[operator]) {
      throw new Error(`Operator "${operator}" for type "${type}" is already registered.`);
    }

    typeRegistry[operator] = handler;
  }

  // Execute the logical operation, checking the types/classes of the operands
  execute(operator: string, a: any, b: any): boolean {
    const aClass = a.constructor ? a.constructor.name : typeof a;
    const bClass = b.constructor ? b.constructor.name : typeof b;

    if(operatorNameToSymbol[operator.toLowerCase()]){
      operator=operatorNameToSymbol[operator.toLowerCase()]
    }
    // Try class-specific operator registration first
    if (this.typeHandlers.has(aClass)) {
      const aHandlers = this.typeHandlers.get(aClass)!;
      if (aHandlers[operator]) {
        if (aClass === 'buffer' && !Buffer.isBuffer(b)){
          const convertedBuffer = Buffer.from(b)
          return aHandlers[operator](a, convertedBuffer);
        }
        return aHandlers[operator](a, b);
      }
    }

    // If class-specific handler not found, check for type (primitive) operators
    if (this.typeHandlers.has(aClass.toLowerCase())) {
      const aHandlers = this.typeHandlers.get(aClass.toLowerCase())!;
      if (aHandlers[operator]) {
        if (aClass.toLowerCase() === 'buffer' && !Buffer.isBuffer(b)){
          const convertedBuffer = Buffer.from(b,'hex')
          return aHandlers[operator](a, convertedBuffer);
        }
        return aHandlers[operator](a, b);
      }
    }

    // Try class-specific operator registration for the second operand
    if (this.typeHandlers.has(bClass)) {
      const bHandlers = this.typeHandlers.get(bClass)!;
      if (bHandlers[operator]) {
        return bHandlers[operator](a, b);
      }
    }

    // If still not found, try for primitive types such as number, string, etc.
    if (this.typeHandlers.has("number")) {
      const numberHandlers = this.typeHandlers.get("number")!;
      if (numberHandlers[operator]) {
        return numberHandlers[operator](a, b);
      }
    }

    console.log("typeHandlers",JSON.stringify(Array.from( this.typeHandlers.keys()),undefined,2));
    console.log("typeHandlersvalues",JSON.stringify(Array.from( this.typeHandlers.values()),undefined,2));

    // If operator is not found for the types of operands, throw an error
    throw new Error(`Operator "${operator}" is not supported for operands of types "${aClass}" and "${bClass}".`);
  }
}



// Initialize the _logicalFunctions instance
const _logicalFunctions = new LogicalFunctions();

// Register handlers for numbers
_logicalFunctions.register("number", "==", (a: number, b: number) => a === b);
_logicalFunctions.register("number", "!=", (a: number, b: number) => a !== b);
_logicalFunctions.register("number", ">", (a: number, b: number) => a > b);
_logicalFunctions.register("number", "<", (a: number, b: number) => a < b);
_logicalFunctions.register("number", ">=", (a: number, b: number) => a >= b);
_logicalFunctions.register("number", "<=", (a: number, b: number) => a <= b);

// Register handlers for strings
_logicalFunctions.register("string", "==", (a: string, b: string) => a === b);
_logicalFunctions.register("string", "!=", (a: string, b: string) => a !== b);
_logicalFunctions.register("string", ">", (a: string, b: string) => a > b);
_logicalFunctions.register("string", "<", (a: string, b: string) => a < b);
_logicalFunctions.register("string", ">=", (a: string, b: string) => a >= b);
_logicalFunctions.register("string", "<=", (a: string, b: string) => a <= b);

// Register handlers for buffers
_logicalFunctions.register("buffer", "==", (a: Buffer, b: Buffer) => a.equals(b));
_logicalFunctions.register("buffer", "!=", (a: Buffer, b: Buffer) => !a.equals(b));
_logicalFunctions.register("buffer", ">", (a: Buffer, b: Buffer) => a.compare(b) > 0);
_logicalFunctions.register("buffer", "<", (a: Buffer, b: Buffer) => a.compare(b) < 0);
_logicalFunctions.register("buffer", ">=", (a: Buffer, b: Buffer) => a.compare(b) >= 0);
_logicalFunctions.register("buffer", "<=", (a: Buffer, b: Buffer) => a.compare(b) <= 0);

export const logicalFunctions=_logicalFunctions;

