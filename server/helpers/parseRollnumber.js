module.exports = function parseRollNumber(rollNumber) {
    if (!rollNumber) return null;

    // remove spaces just in case
    rollNumber = String(rollNumber).trim();

    // ✅ now allow 9 digits
    if (!/^\d{9}$/.test(rollNumber)) return null;

    const department = rollNumber.slice(0, 4);
    const batch = rollNumber.slice(4, 6);
    const rollNo = rollNumber.slice(6, 9);

    return {
        department,
        batch,
        rollNo
    };
};