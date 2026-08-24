export interface DailyStatus {
  streak: number;
  todayChecked: boolean;
  checkedDays: number[];
}

export interface DailyCheckinRequest {
  day?: number;
}

export interface DailyHistoryItem {
  day: number;
  month: number;
  year: number;
  createdAt: string;
}

export interface RewardResponse {
  status: string;
  message: string;
  todayChecked?: boolean;
  streak?: number;
  credited?: number;
}

export interface RewardSettings {
  firebaseUid: string;
  rewardEnabled: boolean;
  referralCode: string;
  updatedAt: string;
}

export interface ReferralHistoryItem {
  friend: string;
  date: string;
  bonus: number;
  redeemed: boolean;
}
