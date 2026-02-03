// Test file for code review
export function calculateTotal(items: number[]): number {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i];
  }
  return total;
}

export function greet(name: string): string {
  return "Hello, " + name + "!";
}
