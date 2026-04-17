import { getCows, getDevices, getSensorData } from "@/services/api";
import { SensorReading } from "@/types";
import { useCallback, useEffect, useState } from "react";

export type CowStatus = "sehat" | "peringatan" | "kritis";

export interface CowDashboardItem {
  id: string; // cow ID or fallback
  cowName: string;
  deviceId: string | null;
  status: CowStatus;
  lastUpdate: Date | null;
}

export interface DashboardData {
  totalCows: number;
  activeDevices: number;
  anomaliesCount: number;
  cowList: CowDashboardItem[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function getStatus(reading: SensorReading | null): CowStatus {
  if (!reading) return "sehat";
  const temperature = reading.temperature != null ? Number(reading.temperature) : null;
  const heartRate = reading.heartRate != null ? Number(reading.heartRate) : null;
  const spo2 = reading.spo2 != null ? Number(reading.spo2) : null;

  if (
    (temperature && temperature > 40) ||
    (heartRate && heartRate > 90) ||
    (spo2 && spo2 < 90)
  )
    return "kritis";
  if (
    (temperature && (temperature > 39.5 || temperature < 38.0)) ||
    (heartRate && (heartRate > 80 || heartRate < 55)) ||
    (spo2 && spo2 < 95)
  )
    return "peringatan";
  return "sehat";
}

export function useDashboard(): DashboardData {
  const [data, setData] = useState<Omit<DashboardData, "isLoading" | "error" | "refresh">>({
    totalCows: 0,
    activeDevices: 0,
    anomaliesCount: 0,
    cowList: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [cowsRes, devicesRes, sensorRes] = await Promise.all([
        getCows(),
        getDevices(),
        getSensorData(),
      ]);

      const cows = cowsRes.data.data;
      const devices = devicesRes.data.data;
      const readings = sensorRes.data.data;

      // Group latest readings by device
      const latestReadingMap = new Map<string, SensorReading>();
      for (const r of readings) {
        if (!latestReadingMap.has(r.deviceId)) {
          latestReadingMap.set(r.deviceId, r); 
        }
      }

      let anomaliesCount = 0;
      const cowList: CowDashboardItem[] = cows.map((cow) => {
        // Find assigned device
        const assignedDevice = devices.find((d) => d.cowId === cow.id && d.isActive);
        let status: CowStatus = "sehat";
        let lastUpdate: Date | null = null;

        if (assignedDevice) {
          const latestReading = latestReadingMap.get(assignedDevice.deviceId);
          if (latestReading) {
            status = getStatus(latestReading);
            lastUpdate = new Date(latestReading.createdAt);
            if (status !== "sehat") {
              const todayStr = new Date().toDateString();
              if (lastUpdate.toDateString() === todayStr) {
                anomaliesCount++;
              }
            }
          }
        }

        return {
          id: cow.id.toString(),
          cowName: cow.name,
          deviceId: assignedDevice ? assignedDevice.deviceId : null,
          status,
          lastUpdate,
        };
      });

      setData({
        totalCows: cows.length,
        activeDevices: devices.filter((d) => d.isActive).length,
        anomaliesCount,
        cowList,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || "Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...data, isLoading, error, refresh: fetchData };
}
