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

export function usePusher(onNewData: (data: SensorEvent) => void) {
  const { user } = useAuthStore();
  const onNewDataRef = useRef(onNewData);

  useEffect(() => {
    onNewDataRef.current = onNewData;
  }, [onNewData]);

  useEffect(() => {
    if (!user?.id) return;
    Pusher.logToConsole = true;

    const pusher = new Pusher(process.env.EXPO_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.EXPO_PUBLIC_PUSHER_CLUSTER!,
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
