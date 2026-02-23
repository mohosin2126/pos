import { useCallback, useEffect, useState } from "react";
import useApi from "@/hooks/use-api";
import { useDelete } from "@/hooks/common";


export interface TRole {
  id: number;
  name: string;
  permissions: string[];
  users?: { id: number; firstName: string; lastName: string; email: string }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TRoleFormPayload {
  name: string;
  permissions: string[];
}


export function useRoles() {
  const [roles, setRoles] = useState<TRole[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await useApi.get("/v1/admin/role/all");
      setRoles(data?.data || []);
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return { roles, loading, refetch: fetchRoles };
}

export function useRole(id: string | number | undefined) {
  const [role, setRole] = useState<TRole | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRole = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await useApi.get(`/v1/admin/role/${id}`);
      setRole(data?.data || null);
    } catch (error) {
      console.error("Error fetching role:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  return { role, loading, refetch: fetchRole };
}


export function useCreateRole() {
  const [error, setError] = useState<string[]>([]);

  const createRole = async (payload: TRoleFormPayload) => {
    try {
      const { data } = await useApi.post("/v1/admin/role/create", payload);
      return data;
    } catch (err: any) {
      setError([
        err?.response?.data?.message || "An unexpected error occurred.",
      ]);
      console.error("Error creating role:", err?.response?.data?.message);
    }
  };

  return { createRole, error };
}

export function useUpdateRole() {
  const [error, setError] = useState<string[]>([]);

  const updateRole = async (
    id: string | number,
    payload: Partial<TRoleFormPayload>
  ) => {
    try {
      const { data } = await useApi.put(
        `/v1/admin/role/update/${id}`,
        payload
      );
      return data;
    } catch (err: any) {
      setError([
        err?.response?.data?.message || "An unexpected error occurred.",
      ]);
      console.error("Error updating role:", err?.response?.data?.message);
    }
  };

  return { updateRole, error };
}

export function useDeleteRole() {
  return useDelete("/v1/admin/role/delete");
}


export function useRoleOptions() {
  const [options, setOptions] = useState<{ label: string; value: number }[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  const fetchOptions = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await useApi.get("/v1/admin/role/all");
      const roles: TRole[] = data?.data || [];
      setOptions(
        roles.map((r) => ({
          label: r.name.charAt(0).toUpperCase() + r.name.slice(1),
          value: r.id,
        }))
      );
    } catch (error) {
      console.error("Error fetching role options:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  return { options, loading, refetch: fetchOptions };
}
