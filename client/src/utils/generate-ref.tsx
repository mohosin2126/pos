export const generateReferenceNo = (): string => {
  const prefix: string = "S";
  const year: number = new Date().getFullYear();

  let counter: number = Number(localStorage.getItem("refCounter") || 0);
  counter += 1;
  localStorage.setItem("refCounter", counter.toString());

  const counterStr: string = counter.toString().padStart(3, "0");

  return `${prefix}-${year}-${counterStr}`;
};
