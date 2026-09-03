import { PaySharpValidationError } from "./errors.js";

export function required(value: unknown, field: string): void {
  if (value === undefined || value === null || value === "") throw new PaySharpValidationError(`${field} is required`);
}
export function positive(value: number, field: string): void {
  if (!Number.isFinite(value) || value < 1) throw new PaySharpValidationError(`${field} must be a number greater than or equal to 1`);
}
export function maxLength(value: string | undefined, length: number, field: string): void {
  if (value !== undefined && value.length > length) throw new PaySharpValidationError(`${field} must be at most ${length} characters`);
}
export function mobile(value: string, field = "mobileNo"): void {
  if (!/^\d{10}$/.test(value)) throw new PaySharpValidationError(`${field} must contain exactly 10 digits`);
}

export function integerRange(value: number, minimum: number, maximum: number, field: string): void {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new PaySharpValidationError(`${field} must be an integer from ${minimum} to ${maximum}`);
  }
}

export function maxItems(value: readonly unknown[] | undefined, maximum: number, field: string): void {
  if (value !== undefined && value.length > maximum) {
    throw new PaySharpValidationError(`${field} must contain at most ${maximum} items`);
  }
}

export function oneOf<T extends string>(value: string, values: readonly T[], field: string): asserts value is T {
  if (!values.includes(value as T)) {
    throw new PaySharpValidationError(`${field} must be one of: ${values.join(", ")}`);
  }
}

export function digitLength(value: string | undefined, minimum: number, maximum: number, field: string): void {
  if (value !== undefined && (!/^\d+$/.test(value) || value.length < minimum || value.length > maximum)) {
    throw new PaySharpValidationError(`${field} must contain ${minimum} to ${maximum} digits`);
  }
}
