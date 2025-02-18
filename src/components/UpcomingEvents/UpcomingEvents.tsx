"use client";
import React, { useEffect, useState } from "react";
import styles from "@/components/UpcomingEvents/UpcomingEvents.module.scss";

interface EventItem {
  event: string;
  date: string;
  description: string;
}

interface UpcomingEventsProps {
  symbol: string;
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ symbol }) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`/api/stats/${symbol}`);
        const data = await res.json();
        // Assume calendar data includes "Upcoming Events" as an array of event objects
        if (data.calendar && data.calendar["Upcoming Events"]) {
          setEvents(data.calendar["Upcoming Events"]);
        } else {
          setEvents([]);
        }
      } catch (error) {
        console.error("Error fetching upcoming events:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [symbol]);

  if (loading)
    return <p className={styles.loading}>Loading upcoming events...</p>;
  if (events.length === 0)
    return <p className={styles.noEvents}>No upcoming events.</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Upcoming Events</h2>
      <div className={styles.eventsGrid}>
        {events.map((event, idx) => (
          <div key={idx} className={styles.eventCard}>
            <h3 className={styles.eventTitle}>{event.event}</h3>
            <p className={styles.eventDate}>{new Date(event.date).toLocaleString()}</p>
            <p className={styles.eventDescription}>{event.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingEvents;
