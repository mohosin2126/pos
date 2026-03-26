import { useCallback, useEffect, useState } from "react";
import useApi from "@/hooks/use-api";
import { TDashboardSummary, TDashboardSummaryApiResponse } from "@/interface/common";

export function useDashboardSummary() {
  const [summary, setSummary] = useState<TDashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await useApi.get<TDashboardSummaryApiResponse>("/v1/admin/dashboard/summary");
      setSummary(data?.data || null);
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, refetch: fetchSummary };
}
