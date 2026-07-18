import { useAuthStore } from "@/stores/authStore";
import Constants from "expo-constants";
import PusherLib from "pusher-js/react-native";
import { useEffect, useRef } from "react";

// @ts-ignore
const Pusher = PusherLib.Pusher;

const PUSHER_KEY = Constants.expoConfig?.extra?.pusherKey as string;
const PUSHER_CLUSTER = Constants.expoConfig?.extra?.pusherCluster as string;

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
  const onNewDataRef = useRef<(data: SensorEvent) => void>(onNewData);
  const pusherRef = useRef<any>(null);
  const channelRef = useRef<any>(null);

  // Update ref setiap render
  useEffect(() => {
    onNewDataRef.current = onNewData;
  });

  useEffect(() => {
    if (!user?.id) return;
    if (!PUSHER_KEY || !PUSHER_CLUSTER) {
      console.error("Pusher key atau cluster tidak ditemukan!");
      return;
    }

    let isCleanedUp = false;

    const initPusher = () => {
      try {
        const pusherInstance = new Pusher(PUSHER_KEY, {
          cluster: PUSHER_CLUSTER,
          forceTLS: true,
        });

        pusherRef.current = pusherInstance;

        const channel = pusherInstance.subscribe(`farmer-${user.id}`);
        channelRef.current = channel;

        channel.bind("new-sensor-data", (rawData: any) => {
          if (isCleanedUp) return;

          try {
            const data: SensorEvent =
              typeof rawData === "string" ? JSON.parse(rawData) : rawData;

            if (typeof onNewDataRef.current === "function") {
              onNewDataRef.current(data);
            }
          } catch (e) {
            console.error("Pusher data parse error:", e);
          }
        });
      } catch (error) {
        console.error("Pusher init error:", error);
      }
    };

    initPusher();

    return () => {
      isCleanedUp = true;
      try {
        if (channelRef.current) {
          channelRef.current.unbind_all();
          channelRef.current = null;
        }
        if (pusherRef.current) {
          pusherRef.current.unsubscribe(`farmer-${user.id}`);
          pusherRef.current.disconnect();
          pusherRef.current = null;
        }
      } catch (e) {
        console.error("Pusher cleanup error:", e);
      }
    };
  }, [user?.id]);
}
