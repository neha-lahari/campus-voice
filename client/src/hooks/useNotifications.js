import { useEffect, useState } from "react";
import API from "../utils/api";
import { socket } from "../socket";

export default function useNotifications() {

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    // LOAD OLD NOTIFICATIONS
    useEffect(() => {

        fetchNotifications();

    }, []);

    const fetchNotifications = async () => {
        try {

            const res = await API.get("/notifications");

            setNotifications(res.data.notifications);

        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    // REALTIME SOCKET
    useEffect(() => {

        const handler = (data) => {

            setNotifications(prev => [
                data,
                ...prev
            ]);
        };

        socket.on("notification", handler);

        return () => {
            socket.off("notification", handler);
        };

    }, []);

    const unreadCount = notifications.filter(
        n => !n.isRead
    ).length;

    const markAllRead = async () => {

        try {

            await API.patch("/notifications/read-all");

            setNotifications(prev =>
                prev.map(n => ({
                    ...n,
                    isRead: true
                }))
            );

        } catch (err) {
            console.log(err);
        }
    };

    return {
        notifications,
        unreadCount,
        loading,
        markAllRead,
        setNotifications
    };
}