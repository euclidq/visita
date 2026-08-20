export const formatVisitDuration = (duration?: number) => {
  if (duration === undefined) return 'Not available';

  const totalMinutes = Math.floor(duration / 60_000);
  if (totalMinutes < 1) return 'Less than a minute';

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return [hours && `${hours}h`, minutes && `${minutes}m`].filter(Boolean).join(' ');
};
