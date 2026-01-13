export const calculateChildAge = (dob) => {
  let childAge = 0;
  const today = new Date();
  const birthDate = new Date(dob);
  childAge = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    childAge--;
  }
  return childAge;
};
