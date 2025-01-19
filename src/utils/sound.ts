export const playSuccessSound = () => {
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2018/success-1-6297.wav');
  audio.volume = 0.5; // Set volume to 50%
  audio.play().catch(() => {
    // Silently handle autoplay restrictions
  });
};

export const playActionSound = () => {
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/pop-up-2571.wav');
  audio.volume = 0.3; // Set volume to 30%
  audio.play().catch(() => {
    // Silently handle autoplay restrictions
  });
};