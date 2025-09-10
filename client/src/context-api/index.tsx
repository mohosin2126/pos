import React, { createContext, useEffect, useState, useContext, type ReactNode } from "react";
import Cookies from "js-cookie";

export type User = Record<string, unknown>;

type UserContextValue = {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

export const UserContext = createContext<UserContextValue | undefined>(undefined);

type UserProviderProps = {
    children: ReactNode;
};

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const initialUser = (): User | null => {
        try {
            const userCookie = Cookies.get("user");
            return userCookie ? (JSON.parse(userCookie) as User) : null;
        } catch (error) {
            console.error("Error parsing user cookie:", error);
            return null;
        }
    };

    const [user, setUser] = useState<User | null>(initialUser);

    useEffect(() => {
        try {
            Cookies.set("user", JSON.stringify(user), { expires: 7 });
        } catch (error) {
            console.error("Error setting user cookie:", error);
        }
    }, [user]);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextValue => {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUser must be used within a UserProvider");
    return ctx;
};
