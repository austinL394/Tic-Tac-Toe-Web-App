export const cssSafe = (value: number | [number, number]): string => {
  if (typeof value === 'number') {
    return `${value.toFixed(9)}`;
  } else {
    return `${value[0].toFixed(9)},${value[1].toFixed(9)}`;
  }
};
