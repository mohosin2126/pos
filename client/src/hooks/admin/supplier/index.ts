import { useCallback, useEffect, useState } from "react";
import {TSupplierPayload, TSuppliersApiResponse} from "@/interface/common";
import useApi from "@/hooks/use-api";
import {useDelete} from "@/hooks/common";


export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<TSupplierPayload[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // @ts-ignore
    const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await useApi.get<TSuppliersApiResponse>(
        "/v1/admin/supplier/all"
      );
      setSuppliers(data?.data || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  return { suppliers, loading, refetch: fetchSuppliers };
}

export function useSupplier(id: string | undefined) {
  const [supplier, setSupplier] = useState<TSupplierPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // @ts-ignore
    const fetchSupplier = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await useApi.get(`/v1/admin/supplier/${id}`);
      setSupplier(data?.data || null);
    } catch (error) {
      console.error("Error fetching supplier:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSupplier();
  }, [fetchSupplier]);

  return { supplier, loading, refetch: fetchSupplier };
}

export function useCreateSupplier() {
  const [error, setError] = useState<string[]>([]);

  const createSupplier = async (data: TSupplierPayload) => {
    try {
      const { data: result } = await useApi.post(
        "/v1/admin/supplier/create",
        data
      );
      return result;
    } catch (error: any) {
      setError([
        error?.response?.data?.message || "An unexpected error occurred.",
      ]);
      console.error("Error creating supplier:", error?.response?.data?.message);
    }
  };

  return { createSupplier, error };
}

export function useUpdateSupplier() {
  const [error, setError] = useState<string[]>([]);

  const updateSupplier = async (
    id: string | undefined,
    data: Partial<TSupplierPayload>
  ) => {
    try {
      const { data: result } = await useApi.put(
        `/v1/admin/supplier/update/${id}`,
        data
      );
      return result;
    } catch (error: any) {
      setError([
        error?.response?.data?.message || "An unexpected error occurred.",
      ]);
      console.error("Error updating supplier:", error);
    }
  };

  return { updateSupplier, error };
}

// export function useDeleteSupplier() {
//   const deleteSupplier = async (id: string) => {
//     try {
//       const { data } = await useApi.delete(`/v1/admin/supplier/delete/${id}`);
//       return data;
//     } catch (error) {
//       console.error("Error deleting supplier:", error);
//     }
//   };

//   return { deleteSupplier };
// }

export function useDeleteSupplier() {
  return useDelete("/v1/admin/supplier/delete");
}
