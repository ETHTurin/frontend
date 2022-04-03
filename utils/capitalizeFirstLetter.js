export const capitalizeFirstLetterStr = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const capitalizeFirstLetterArr = (array) => {
  return array
    .map((el) => {
      return el.charAt(0).toUpperCase() + el.slice(1);
    })
    .join(", ");
};
