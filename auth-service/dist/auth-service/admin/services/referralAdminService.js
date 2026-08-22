const rewardSettings = new Map();
const users = new Map();
function randomFourDigit() {
    return Math.floor(1000 + Math.random() * 9000);
}
export class ReferralAdminService {
    generateReferralCode(firstName) {
        const normalized = String(firstName ?? '').trim().toUpperCase();
        const prefix = normalized.length > 6 ? normalized.slice(0, 6) : normalized || 'USER';
        return `${prefix}${randomFourDigit()}`;
    }
    ensureUniqueReferralCode(firstName) {
        while (true) {
            const referralCode = this.generateReferralCode(firstName);
            const exists = Array.from(rewardSettings.values()).some((entry) => entry.referralCode === referralCode);
            if (!exists) {
                return referralCode;
            }
        }
    }
    cleanDuplicateReferralCodes() {
        const duplicates = new Map();
        for (const entry of rewardSettings.values()) {
            const bucket = duplicates.get(entry.referralCode) ?? [];
            bucket.push(entry);
            duplicates.set(entry.referralCode, bucket);
        }
        const updates = [];
        for (const [referralCode, entries] of duplicates.entries()) {
            if (entries.length < 2) {
                continue;
            }
            entries.sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
            for (let index = 1; index < entries.length; index++) {
                const entry = entries[index];
                const user = users.get(entry.firebaseUid);
                if (!user || !user.firstName) {
                    console.warn(`Skipping duplicate referral cleanup for uid=${entry.firebaseUid} because first name is missing.`);
                    continue;
                }
                const newCode = this.ensureUniqueReferralCode(user.firstName);
                rewardSettings.set(entry.firebaseUid, {
                    ...entry,
                    referralCode: newCode,
                    updatedAt: new Date().toISOString(),
                });
                updates.push({ firebaseUid: entry.firebaseUid, oldCode: referralCode, newCode });
            }
        }
        return {
            message: updates.length > 0
                ? `Cleaned ${updates.length} duplicate referral code(s).`
                : 'No duplicate referral codes found.',
            updates,
        };
    }
    generateUniqueReferralCode(firstName) {
        return this.ensureUniqueReferralCode(firstName);
    }
    seedRewardSetting(firebaseUid, referralCode, updatedAt) {
        rewardSettings.set(firebaseUid, {
            firebaseUid,
            referralCode,
            updatedAt: updatedAt ?? new Date().toISOString(),
        });
    }
    seedUserProfile(firebaseUid, firstName) {
        users.set(firebaseUid, { firebaseUid, firstName });
    }
}
