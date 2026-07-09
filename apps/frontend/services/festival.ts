export function getFestival() {
  const today = new Date();

  const month = today.getMonth() + 1;
  const day = today.getDate();

  if (month === 3)
    return "Holi";

  if (month === 10 || month === 11)
    return "Diwali";

  if (month === 1 && day >= 13 && day <= 15)
    return "Pongal";

  return "None";
}