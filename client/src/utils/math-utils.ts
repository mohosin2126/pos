
const DECIMAL_PLACES = 2;


export const roundTo = (value: number, decimals: number = DECIMAL_PLACES): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

export const add = (a: number, b: number): number => {
  return roundTo(a + b);
};


export const subtract = (a: number, b: number): number => {
  return roundTo(a - b);
};


export const multiply = (a: number, b: number): number => {
  return roundTo(a * b);
};


export const divide = (a: number, b: number): number => {
  if (b === 0) {
    throw new Error("Division by zero");
  }
  return roundTo(a / b);
};


export const max = (a: number, b: number): number => {
  return Math.max(a, b);
};


export const min = (a: number, b: number): number => {
  return Math.min(a, b);
};


export const lessThan = (a: number, b: number): boolean => {
  return a < b;
};


export const lessThanOrEqual = (a: number, b: number): boolean => {
  return a <= b;
};


export const greaterThan = (a: number, b: number): boolean => {
  return a > b;
};


export const greaterThanOrEqual = (a: number, b: number): boolean => {
  return a >= b;
};


export const isInteger = (value: number): boolean => {
  return Number.isInteger(value);
};


export const equals = (a: number, b: number, tolerance: number = 1e-10): boolean => {
  return Math.abs(a - b) < tolerance;
};


export const percentage = (value: number, percent: number): number => {
  return roundTo((value * percent) / 100);
};


export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};
