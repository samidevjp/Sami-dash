export const playNotificationSound = () => {
  const audio = new Audio('/sounds/notification.mp3');
  audio.play().catch((e) => console.error('Audio play failed:', e));
};
