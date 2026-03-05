import React, { createContext, useContext, useState } from "react";

export interface UserInfo {
  name: string;
  gender: string;
  birthDate: string; // YYYY-MM-DD
  occupation: string;
  interests: string;
  relationship: string;
  mbti: string;
  confusion: string;
  selfIntro: string;
}

export interface UserContextType {
  userInfo: UserInfo;
  setUserInfo: (info: UserInfo) => void;
}

const defaultUserInfo: UserInfo = {
  name: "",
  gender: "",
  birthDate: "",
  occupation: "",
  interests: "",
  relationship: "",
  mbti: "",
  confusion: "",
  selfIntro: "",
};

const UserContext = createContext<UserContextType>({
  userInfo: defaultUserInfo,
  setUserInfo: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userInfo, setUserInfo] = useState<UserInfo>(defaultUserInfo);
  return (
    <UserContext.Provider value={{ userInfo, setUserInfo }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

export function getZodiac(birthDate: string): string {
  if (!birthDate) return "未知";
  const parts = birthDate.split("-");
  if (parts.length < 3) return "未知";
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(month) || isNaN(day)) return "未知";

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "白羊座";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "金牛座";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return "双子座";
  if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return "巨蟹座";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "狮子座";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "处女座";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) return "天秤座";
  if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) return "天蝎座";
  if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) return "射手座";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "摩羯座";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "水瓶座";
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "双鱼座";
  return "未知";
}

export function getAge(birthDate: string): number {
  if (!birthDate) return 0;
  const parts = birthDate.split("-");
  if (parts.length < 1) return 0;
  const birthYear = parseInt(parts[0], 10);
  if (isNaN(birthYear)) return 0;
  const currentYear = new Date().getFullYear();
  return currentYear - birthYear;
}
