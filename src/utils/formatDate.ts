export const formatDate = (dateStr: string): string => {
  try {
    const xatabFormat = /^\d{2}-\d{2}-\d{4}, \d{2}:\d{2}$/;

    if (xatabFormat.test(dateStr)) {
      const [datePart] = dateStr.split(", ");
      const [day, month, year] = datePart.split("-");
      dateStr = `${year}-${month}-${day}`;
    }

    const date = new Date(dateStr);

    if (isNaN(date.getTime())) {
      return dateStr;
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateStr;
  }
};
