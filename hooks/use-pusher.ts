import { useAuthStore } from "@/stores/authStore";
import PusherLib from "pusher-js/react-native";
import { useEffect, useRef } from "react";

// @ts-ignore
const Pusher = PusherLib.Pusher;

export interface SensorEvent {
  deviceId: string;
  cowName: string;
  temperature: number | null;
  heartRate: number | null;
  spo2: number | null;
  latitude: number | null;
  longitude: number | null;
  rssi: number | null;
  isAnomaly: boolean;
  createdAt: string;
}

const PUSHER_KEY = "7662bc11ec767cc43308";
const PUSHER_CLUSTER = "ap1";

export function usePusher(onNewData: (data: SensorEvent) => void) {
  const { user } = useAuthStore();
  const onNewDataRef = useRef(onNewData);

  useEffect(() => {
    onNewDataRef.current = onNewData;
  }, [onNewData]);

  useEffect(() => {
    if (!user?.id) return;
    Pusher.logToConsole = true;

    const pusher = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      forceTLS: true,
    });

    const channel = pusher.subscribe(`farmer-${user.id}`);

    channel.bind("new-sensor-reading", (data: SensorEvent) => {
      console.log("Realtime:", data);
      onNewDataRef.current(data);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`farmer-${user.id}`);
      pusher.disconnect();
    };
  }, [user?.id]);
}
