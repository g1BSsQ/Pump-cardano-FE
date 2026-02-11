export const formatDateTime = (dateInput: string | number | Date) => {
  const date = new Date(dateInput);
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date);
};

export const formatDate = (dateInput: string | number | Date) => {
   const date = new Date(dateInput);
   return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
   }).format(date);
}

// Hàm bù giờ cho server date (nếu bị lệch UTC+0 mà browser hiểu là Local)
export const parseServerDate = (dateInput: string | number | Date): Date => {
  const date = new Date(dateInput);
  // Cộng thêm 7 tiếng
  return new Date(date.getTime() + 7 * 60 * 60 * 1000);
};
