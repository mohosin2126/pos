import { useCallback, useEffect, useState } from "react";
import type { TSupplierPayload, TSuppliersApiResponse } from "@/interface/common";
import useApi from "@/hooks/use-api";


export function useSuppliers() {
    const [suppliers, setSuppliers] = useState<TSupplierPayload[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchSuppliers = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await useApi.get<TSuppliersApiResponse>("/v1/admin/supplier/all");
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

    const fetchSupplier = useCallback(async () => {
        if (!id) return;
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

    const createSupplier = async (payload: TSupplierPayload) => {
        try {
            const { data: result } = await useApi.post("/v1/admin/supplier/create", payload);
            return result;
        } catch (error: any) {
            setError([error?.response?.data?.message || "An unexpected error occurred."]);
            console.error("Error creating supplier:", error?.response?.data?.message || error);
            throw error;
        }
    };

    return { createSupplier, error };
}


export function useUpdateSupplier() {
    const [error, setError] = useState<string[]>([]);

    const updateSupplier = async (id: string | undefined, partial: Partial<TSupplierPayload>) => {
        try {
            const { data: result } = await useApi.put(`/v1/admin/supplier/update/${id}`, partial);
            return result;
        } catch (error: any) {
            setError([error?.response?.data?.message || "An unexpected error occurred."]);
            console.error("Error updating supplier:", error?.response?.data?.message || error);
            throw error;
        }
    };

    return { updateSupplier, error };
}


export function useDeleteSupplier() {
    const [loading, setLoading] = useState(false);

    const deleteSupplier = async (id: string) => {
        setLoading(true);
        try {
            const { data } = await useApi.delete(`/v1/admin/supplier/delete/${id}`);
            return data;
        } finally {
            setLoading(false);
        }
    };

    return { deleteSupplier, loading };
}
