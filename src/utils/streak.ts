export const calculateStreak = (streak: Streak, currentDate: Date): Streak => {
  const lastDate = new Date(streak.lastActionDate);
  const daysDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff <= 1) {
    // Maintain or increase streak
    const newCurrentStreak = streak.currentStreak + 1;
    return {
      ...streak,
      currentStreak: newCurrentStreak,
      longestStreak: Math.max(newCurrentStreak, streak.longestStreak),
      lastActionDate: currentDate,
    };
  } else {
    // Break streak
    return {
      ...streak,
      currentStreak: 1,
      lastActionDate: currentDate,
    };
  }
};