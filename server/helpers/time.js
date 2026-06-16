export const getTimeRemaining = (deadline) => {
    const diff = new Date(deadline) - new Date();

    if (diff <= 0) {
        return { expired: true };
    }

    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60)
    };
};