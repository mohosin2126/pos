/**
 * Custom math utilities for precise decimal calculations
 * Replaces decimal.js with native JavaScript rounding
 */

const DECIMAL_PLACES = 2;

/**
 * Round a number to a specific number of decimal places
 */
export const roundTo = (value: number, decimals: number = DECIMAL_PLACES): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

/**
 * Add two numbers with rounding
 */
export const add = (a: number, b: number): number => {
  return roundTo(a + b);
};

/**
 * Subtract two numbers with rounding
 */
export const subtract = (a: number, b: number): number => {
  return roundTo(a - b);
};

/**
 * Multiply two numbers with rounding
 */
export const multiply = (a: number, b: number): number => {
  return roundTo(a * b);
};

/**
 * Divide two numbers with rounding
 */
export const divide = (a: number, b: number): number => {
  if (b === 0) {
    throw new Error("Division by zero");
  }
  return roundTo(a / b);
};

/**
 * Return the maximum of two numbers
 */
export const max = (a: number, b: number): number => {
  return Math.max(a, b);
};

/**
 * Return the minimum of two numbers
 */
export const min = (a: number, b: number): number => {
  return Math.min(a, b);
};

/**
 * Check if a number is less than another
 */
export const lessThan = (a: number, b: number): boolean => {
  return a < b;
};

/**
 * Check if a number is less than or equal to another
 */
export const lessThanOrEqual = (a: number, b: number): boolean => {
  return a <= b;
};

/**
 * Check if a number is greater than another
 */
export const greaterThan = (a: number, b: number): boolean => {
  return a > b;
};

/**
 * Check if a number is greater than or equal to another
 */
export const greaterThanOrEqual = (a: number, b: number): boolean => {
  return a >= b;
};

/**
 * Check if a number is an integer
 */
export const isInteger = (value: number): boolean => {
  return Number.isInteger(value);
};

/**
 * Check if a number equals another (with floating point tolerance)
 */
export const equals = (a: number, b: number, tolerance: number = 1e-10): boolean => {
  return Math.abs(a - b) < tolerance;
};

/**
 * Calculate percentage of a value
 */
export const percentage = (value: number, percent: number): number => {
  return roundTo((value * percent) / 100);
};

/**
 * Ensure a value is within a range
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};
