function getCurrentDate(): string {

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const day = tomorrow.getDate().toString().padStart(2, '0');
  const month = (tomorrow.getMonth() + 1).toString().padStart(2, '0');
  const year = tomorrow.getFullYear();

  return `${year}-${month}-${day}`;
}
export default getCurrentDate;