// =====================================================
// ORBIT GUARDIAN V1
// Simple rule-based moderation
// =====================================================

const abusiveWords = [
    "idiot",
    "stupid",
    "moron",
    "fuck",
    "shit"
];

const spamPatterns = [
    "buy now",
    "click here",
    "free money",
    "win cash",
    "subscribe now"
];

function checkMessage(message) {

    const text = message
        .toLowerCase()
        .trim();

    // ================================================
    // ABUSE CHECK
    // ================================================

    const abusive = abusiveWords.some(
        (word) => text.includes(word)
    );

    if (abusive) {

        return {
            allowed: false,
            reason: "ABUSIVE_CONTENT"
        };

    }

    // ================================================
    // SPAM CHECK
    // ================================================

    const spam = spamPatterns.some(
        (pattern) => text.includes(pattern)
    );

    if (spam) {

        return {
            allowed: false,
            reason: "SPAM"
        };

    }

    // ================================================
    // REPEATED CHARACTER CHECK
    // ================================================

    if (/(.)\1{7,}/.test(text)) {

        return {
            allowed: false,
            reason: "SPAM"
        };

    }

    // ================================================
    // MESSAGE ALLOWED
    // ================================================

    return {
        allowed: true,
        reason: null
    };
}


module.exports = {
    checkMessage
};