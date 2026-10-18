import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Bell, CheckCheck, Clock, ExternalLink } from "lucide-react";
import { api } from "../lib/api.js";
import type { NotificationResponse } from "@estateos/shared";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await api<{ notifications: NotificationResponse[]; unreadCount: number }>(
        "/notifications"
      );
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch {
      // Ignore polling errors
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 45000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, link?: string | null) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (link) {
        setIsOpen(false);
        navigate(link);
      }
    } catch {
      // Ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md shadow-rose-500/50">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/50">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-800/60">
            {isLoading && notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                <Bell className="h-8 w-8 mx-auto text-slate-700 mb-2 opacity-50" />
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleMarkAsRead(n.id, n.link)}
                  className={`p-3.5 flex flex-col gap-1 cursor-pointer transition text-left hover:bg-slate-800/50 ${
                    !n.isRead ? "bg-slate-800/25 border-l-2 border-emerald-500" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-xs ${!n.isRead ? "font-semibold text-white" : "text-slate-300"}`}>
                      {n.message}
                    </p>
                    {n.link && <ExternalLink className="h-3 w-3 text-slate-500 flex-shrink-0 mt-0.5" />}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Clock className="h-2.5 w-2.5" />
                    <span>{new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
