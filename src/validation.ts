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
