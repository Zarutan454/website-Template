export const formatNumber = (num: number) => {
  return new Intl.NumberFormat('de-DE').format(num);
};

export const formatDate = (timestamp: number) => {
  return new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(timestamp * 1000));
};
