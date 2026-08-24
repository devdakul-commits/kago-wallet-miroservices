import { RewardRepository } from '../../repositories/user/rewardRepository.js';
export class RewardService {
    repository;
    constructor(repository = new RewardRepository()) {
        this.repository = repository;
    }
    async getDailyStatus(firebaseUid) {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const days = await this.repository.getCheckins(firebaseUid, month, year);
        const today = now.getDate();
        const todayChecked = days.includes(today);
        let streak = 0;
        if (todayChecked) {
            for (let i = today; i >= 1; i--) {
                if (days.includes(i)) {
                    streak++;
                }
                else {
                    break;
                }
            }
        }
        return { streak, todayChecked, checkedDays: days };
    }
    async checkIn(firebaseUid, payload) {
        const now = new Date();
        const day = payload.day ?? now.getDate();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const days = await this.repository.getCheckins(firebaseUid, month, year);
        if (days.includes(day)) {
            return { status: 'already_claimed', message: 'Already checked in today' };
        }
        await this.repository.addCheckin(firebaseUid, day, month, year);
        await this.repository.creditReward(firebaseUid, 50);
        const updatedDays = await this.repository.getCheckins(firebaseUid, month, year);
        let streak = 0;
        for (let i = day; i >= 1; i--) {
            if (updatedDays.includes(i)) {
                streak++;
            }
            else {
                break;
            }
        }
        return {
            status: 'success',
            message: 'Checked in',
            todayChecked: true,
            streak,
            credited: 50,
        };
    }
    async getDailyHistory(firebaseUid) {
        return this.repository.getDailyHistory(firebaseUid);
    }
}
