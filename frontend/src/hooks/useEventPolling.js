import { useEffect } from 'react';
import { eventService } from '../api/services';

const EVENT_REFRESH_INTERVAL = 15000;

const useEventPolling = (onEventsUpdated) => {
  useEffect(() => {
    let mounted = true;

    const refreshEvents = async () => {
      try {
        const events = await eventService.getAll();
        if (mounted) {
          onEventsUpdated(events);
        }
      } catch (error) {
        console.error('Unable to refresh community events:', error);
      }
    };

    const intervalId = window.setInterval(refreshEvents, EVENT_REFRESH_INTERVAL);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, [onEventsUpdated]);
};

export default useEventPolling;
