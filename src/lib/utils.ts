import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Moves an item from one position to another in an array.
 * @param array The array to modify.
 * @param from The index of the item to move.
 * @param to The index to move the item to.
 * @returns A new array with the item moved.
 */
export function arrayMove<T>(array: T[], from: number, to: number): T[] {
  const newArray = [...array];
  const startIndex = from < 0 ? newArray.length + from : from;
  if (startIndex >= 0 && startIndex < newArray.length) {
    const endIndex = to < 0 ? newArray.length + to : to;
    const [item] = newArray.splice(from, 1);
    newArray.splice(endIndex, 0, item);
  }
  return newArray;
}
