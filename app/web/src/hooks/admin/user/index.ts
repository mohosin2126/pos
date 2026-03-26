import { useCallback, useEffect, useState } from "react";
import {TUserPayload, TUsersApiResponse} from "@/interface/common";
import useApi from "@/hooks/use-api";
import {useDelete} from "@/hooks/common";
;

// All users
export function useUsers() {
  const [users, setUsers] = useState<TUserPayload[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await useApi.get<TUsersApiResponse>(
        "/v1/admin/user/all"
      );
      setUsers(data?.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, refetch: fetchUsers };
}

// Single user
export function useUser(id: string | undefined) {
  const [user, setUser] = useState<TUserPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await useApi.get(`/v1/admin/user/${id}`);
      setUser(data?.data || null);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading, refetch: fetchUser };
}

// Create user
export function useCreateUser() {
  const [error, setError] = useState<string[]>([]);

  const createUser = async (data: TUserPayload) => {
    try {
      const { data: result } = await useApi.post("/v1/admin/user/create", data);
      return result;
    } catch (error: any) {
      setError([
        error?.response?.data?.message || "An unexpected error occurred.",
      ]);
      console.error("Error creating user:", error?.response?.data?.message);
    }
  };

  return { createUser, error };
}

// Update user
export function useUpdateUser() {
  const [error, setError] = useState<string[]>([]);

  const updateUser = async (
    id: string | undefined,
    data: Partial<TUserPayload>
  ) => {
    try {
      const { data: result } = await useApi.put(
        `/v1/admin/user/update/${id}`,
        data
      );
      return result;
    } catch (error: any) {
      setError([
        error?.response?.data?.message || "An unexpected error occurred.",
      ]);
      console.error("Error updating user:", error);
    }
  };

  return { updateUser, error };
}

// Delete user
// export function useDeleteUser() {
//   const deleteUser = async (id: string) => {
//     try {
//       const { data } = await useApi.delete(`/v1/admin/user/delete/${id}`);
//       return data;
//     } catch (error) {
//       console.error("Error deleting user:", error);
//     }
//   };

//   return { deleteUser };
// }

export function useDeleteUser() {
  return useDelete("/v1/admin/user/delete");
}
