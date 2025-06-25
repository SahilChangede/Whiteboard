import { format } from "date-fns";

export const formatDateKey = (date) => {
  return format(date, "yyyy-MM-dd");
};

export const loadTasksFromStorage = () => {
  const stored = localStorage.getItem("tasksByDate");
  return stored ? JSON.parse(stored) : {};
};

export const saveTasksToStorage = (tasksByDate) => {
  localStorage.setItem("tasksByDate", JSON.stringify(tasksByDate));
};
