// helpers/getBadges.js
const getBadges = (karma = 0) => {
    const badges = [];
    if (karma >= 500) badges.push("Power User");
    if (karma >= 100) badges.push("Most Helpful");
    if (karma >= 50) badges.push("Active Contributor");
    return badges;
};

module.exports = getBadges;