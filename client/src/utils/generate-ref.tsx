export const generateReferenceNo = (): string => {
  const prefix: string = "S";
  const year: number = new Date().getFullYear();

  // Get last counter from localStorage
  let counter: number = Number(localStorage.getItem("refCounter") || 0);
  counter += 1; // increment
  localStorage.setItem("refCounter", counter.toString());

  // Format counter with leading zeros
  const counterStr: string = counter.toString().padStart(3, "0");

  return `${prefix}-${year}-${counterStr}`;
};
