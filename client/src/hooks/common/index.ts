import { useCallback, useEffect, useState } from "react";
import {TOption, TUseOptionResult} from "@/interface/common";
import useApi from "@/hooks/use-api";


export function useOptions<T extends TOption>(
  url: string
): TUseOptionResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: responseData } = await useApi.get(url);
      const formatted: T[] = responseData?.data?.map((item: any) => ({
        label: item?.name || item?.companyName,
        value: item?.id,
      }));
      setData(formatted);
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
}

export const useSuppliers = () =>
  useOptions<TOption>("/v1/admin/common/suppliers");

export const useProducts = () =>
  useOptions<TOption>("/v1/admin/common/products");

export const useCategories = () =>
  useOptions<TOption>("/v1/admin/common/categories");

export function useDelete<T = any>(endpoint: string) {
  const deleteItem = async (id: string | number): Promise<T | undefined> => {
    try {
      const { data } = await useApi.delete(`${endpoint}/${id}`);
      return data;
    } catch (error) {
      console.error(`Error deleting from ${endpoint}:`, error);
    }
  };

  return { deleteItem };
}
