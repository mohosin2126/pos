import { useCallback, useEffect, useState } from "react";
import useApi from "../../use-api";
import { useDelete } from "../../common";
import {TCategoryPayload} from "@/interface/common";

// All categories
export function useCategories() {
  const [categories, setCategories] = useState<TCategoryPayload[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await useApi.get("/v1/admin/category/all");
      setCategories(data?.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, refetch: fetchCategories };
}

// Single category
export function useCategory(id: string) {
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchCategory = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await useApi.get(`/v1/admin/category/${id}`);
      setCategory(data?.data || null);
    } catch (error) {
      console.error("Error fetching category:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCategory();
  }, [fetchCategory]);

  return { category, loading, refetch: fetchCategory };
}

// Create category
export function useCreateCategory() {
  const [error, setError] = useState<string[]>([]);

  const createCategory = async (data: TCategoryPayload) => {
    try {
      const { data: result } = await useApi.post(
        "/v1/admin/category/create",
        data
      );
      return result;
    } catch (error: any) {
      setError([
        error?.response?.data?.message || "An unexpected error occurred.",
      ]);
      console.error("Error creating category:", error?.response?.data?.message);
    }
  };

  return { createCategory, error };
}

// Update category
export function useUpdateCategory() {
  const [error, setError] = useState<string[]>([]);

  const updateCategory = async (
    id: string,
    data: Partial<TCategoryPayload>
  ) => {
    try {
      const { data: result } = await useApi.put(
        `/v1/admin/category/update/${id}`,
        data
      );
      return result;
    } catch (error: any) {
      setError([
        error?.response?.data?.message || "An unexpected error occurred.",
      ]);
      console.error("Error updating category:", error);
    }
  };

  return { updateCategory, error };
}

// Delete category
// export function useDeleteCategory() {
//   const deleteCategory = async (id: string) => {
//     try {
//       const { data } = await useApi.delete(`/v1/admin/category/delete/${id}`);
//       return data;
//     } catch (error) {
//       console.error("Error deleting category:", error);
//     }
//   };

//   return { deleteCategory };
// }

export function useDeleteCategory() {
  return useDelete("/v1/admin/category/delete");
}
