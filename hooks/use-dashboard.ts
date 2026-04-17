import { getCows, getLatestCowAnomalies } from "@/services/api";
import { SensorReading } from "@/types";
import { useCallback, useEffect, useState } from "react";

interface DashboardData {
  totalCows: number;
  anomalies: SensorReading[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useDashboard(): DashboardData {
  const [totalCows, setTotalCows] = useState<number>(0);
  const [anomalies, setAnomalies] = useState<SensorReading[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [cowsRes, anomaliesRes] = await Promise.all([
        getCows(),
        getLatestCowAnomalies(),
      ]);

      setTotalCows(cowsRes.data.data.length);
      setAnomalies(anomaliesRes.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { totalCows, anomalies, isLoading, error, refresh: fetchData };
}
