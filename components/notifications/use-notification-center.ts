"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import type { Announcement } from "@/lib/marketing/types";
import { useAuth } from "@/lib/AuthContext";
import type { NotificationPreferences, UserNotification } from "@/lib/notifications/types";
import { DEFAULT_NOTIFICATION_PREFERENCES, loadNotificationPreferences, saveNotificationPreferences } from "@/lib/notifications/types";

const READ_ANNOUNCEMENTS_KEY = "thriftx:read-announcements";
const POLL_INTERVAL_MS = 60_000;

function readStoredIds(): string[] {
    try {
        const value = window.localStorage.getItem(READ_ANNOUNCEMENTS_KEY);
        if (!value) return [];
        const parsed: unknown = JSON.parse(value);
        return Array.isArray(parsed)
            ? parsed.filter((id): id is string => typeof id === "string")
            : [];
    } catch (error) {
        console.error("Could not read announcement state:", error);
        return [];
    }
}

export interface NotificationCenterState {
    userId: string | null;
    personal: UserNotification[];
    announcements: Announcement[];
    readIds: string[];
    unreadPersonal: number;
    unreadTotal: number;
    loading: boolean;
    marking: boolean;
    prefs: NotificationPreferences;
    loadAll: () => Promise<void>;
    markAllRead: () => Promise<void>;
    setPrefs: (next: NotificationPreferences) => void;
}

export function useNotificationCenter(): NotificationCenterState {
    const { user } = useAuth();
    const userId = user?.id ?? null;
    const [personal, setPersonal] = useState<UserNotification[]>([]);
    const personalRef = useRef<UserNotification[] | null>(null);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [readIds, setReadIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState(false);
    const [prefs, setPrefsState] = useState<NotificationPreferences>(() => ({ ...DEFAULT_NOTIFICATION_PREFERENCES }));
    const prefsRef = useRef(prefs);
    const announcementsRef = useRef<Announcement[]>([]);
    const requestInFlight = useRef(false);
    const initialized = useRef(false);

    useEffect(() => {
        setPrefsState(loadNotificationPreferences());
    }, []);

    useEffect(() => {
        prefsRef.current = prefs;
    }, [prefs]);

    const setPrefs = useCallback((next: NotificationPreferences) => {
        setPrefsState(next);
        prefsRef.current = next;
        saveNotificationPreferences(next);
    }, []);
    const persistReadIds = useCallback((ids: string[]) => {
        setReadIds(ids);
        try {
            window.localStorage.setItem(READ_ANNOUNCEMENTS_KEY, JSON.stringify(ids));
        } catch (storageError) {
            console.error("Could not save announcement state:", storageError);
        }
    }, []);

    const loadAnnouncements = useCallback(async () => {
        if (requestInFlight.current) return;
        requestInFlight.current = true;
        try {
            const response = await fetch("/api/marketing/announcements", {
                cache: "no-store",
                headers: { "Cache-Control": "no-cache" },
            });
            if (!response.ok) throw new Error(`Unable to load announcements (${response.status}).`);
            const data: { success?: boolean; announcements?: Announcement[] } = await response.json();
            if (!data.success || !Array.isArray(data.announcements)) throw new Error("Invalid announcements response.");
            const nextAnnouncements = data.announcements
                .filter((a) => a.isActive)
                .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
            const prior = announcementsRef.current;
            if (initialized.current && prefsRef.current.inapp !== false) {
                const known = new Set(prior.map((a) => a.id));
                const fresh = nextAnnouncements.filter((a) => !known.has(a.id));
                fresh.slice(0, 2).forEach((a) =>
                    toast.info("New announcement", { description: a.message.slice(0, 90), duration: 5000 }),
                );
            }
            announcementsRef.current = nextAnnouncements;
            setAnnouncements(nextAnnouncements);
        } catch (error) {
            console.error("Failed to load announcements:", error);
        } finally {
            requestInFlight.current = false;
        }
    }, []);

    const loadPersonal = useCallback(async (id: string | null) => {
        if (!id) {
            personalRef.current = [];
            setPersonal([]);
            return;
        }
        try {
            const res = await fetch("/api/notifications", { cache: "no-store" });
            if (res.status === 401) {
                personalRef.current = [];
                setPersonal([]);
                return;
            }
            if (!res.ok) return;
            const data: { success?: boolean; notifications?: UserNotification[] } = await res.json();
            if (!data.success || !Array.isArray(data.notifications)) return;
            const next = data.notifications;
            const prior = personalRef.current;
            if (prior && prefsRef.current.inapp !== false) {
                const known = new Set(prior.map((item) => item.id));
                const fresh = next.filter((item) => !item.read && !known.has(item.id));
                fresh.slice(0, 2).forEach((item) =>
                    toast.success(item.title, { description: item.message.slice(0, 100), duration: 6000 }),
                );
            }
            personalRef.current = next;
            setPersonal(next);
        } catch (error) {
            console.error("Failed to load notifications:", error);
        }
    }, []);

    const loadAll = useCallback(async () => {
        setLoading(true);
        await Promise.all([loadAnnouncements(), loadPersonal(userId)]);
        setLoading(false);
        initialized.current = true;
    }, [loadAnnouncements, loadPersonal, userId]);

    const markAllRead = useCallback(async () => {
        if (marking) return;
        setMarking(true);
        try {
            const personalIds = personal.filter((n) => !n.read).map((n) => n.id);
            if (userId && personalIds.length > 0) {
                await fetch("/api/notifications", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ids: personalIds }),
                }).catch(() => undefined);
                setPersonal((prev) => prev.map((n) => ({ ...n, read: true })));
            }
            const unreadAnnouncementIds = announcements
                .filter((a) => !readIds.includes(a.id))
                .map((a) => a.id);
            if (unreadAnnouncementIds.length > 0) persistReadIds([...readIds, ...unreadAnnouncementIds]);
        } finally {
            setMarking(false);
        }
    }, [announcements, marking, persistReadIds, personal, readIds, userId]);

    useEffect(() => {
        setReadIds(readStoredIds());
        personalRef.current = null;
        announcementsRef.current = [];
        initialized.current = false;
        void loadAll();
        const intervalId = window.setInterval(() => {
            if (document.visibilityState === "visible") void loadAll();
        }, POLL_INTERVAL_MS);
        const onVisible = () => {
            if (document.visibilityState === "visible") void loadAll();
        };
        document.addEventListener("visibilitychange", onVisible);
        return () => {
            window.clearInterval(intervalId);
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, [loadAll]);

    const unreadPersonal = personal.filter((item) => !item.read).length;
    const unreadAnnouncements = announcements.filter((a) => !readIds.includes(a.id)).length;
    const unreadTotal = unreadPersonal + unreadAnnouncements;

    return {
        userId,
        personal,
        announcements,
        readIds,
        unreadPersonal,
        unreadTotal,
        loading,
        marking,
        prefs,
        loadAll,
        markAllRead,
        setPrefs,
    };
}
