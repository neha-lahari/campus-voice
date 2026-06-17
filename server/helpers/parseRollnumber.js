function parseRollNumber(rollNumber) {
    if (!rollNumber) return null;

    const roll = String(rollNumber).trim();

    if (roll.length !== 9) return null;

    for (let i = 0; i < roll.length; i++) {
        if (roll[i] < '0' || roll[i] > '9') return null;
    }

    return {
        department: roll.slice(0, 4),
        batch: roll.slice(4, 6),
        rollNo: roll.slice(6, 9),
    };
}

module.exports = parseRollNumber;