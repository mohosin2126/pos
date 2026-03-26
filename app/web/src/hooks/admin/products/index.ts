
import { useCallback, useEffect, useState } from "react";
import {
  TProductListParams,
  TProductPayload,
  TProductsApiResponse,
  TPagination,
  TProductReportTotals,
} from "@/interface/common";
import useApi from "@/hooks/use-api";
import {useDelete} from "@/hooks/common";

const DEFAULT_PAGINATION: TPagination = {
  page: 1,
  limit: 20,
  total: 0,
  pages: 1,
  hasPrev: false,
  hasNext: false,
};

// Hooks
export function useProducts(params: TProductListParams = {}) {
  const [products, setProducts] = useState<TProductPayload[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<TPagination>(DEFAULT_PAGINATION);

  const {
    page = 1,
    limit = 100,
    search,
    status,
    includeAnalytics = false,
    period = "month",
  } = params;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await useApi.get<TProductsApiResponse>("/v1/admin/product/all", {
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
          ...(status ? { status } : {}),
          ...(includeAnalytics ? { includeAnalytics: "true", period } : {}),
        },
      });
      setProducts(data?.data || []);
      setPagination(data?.pagination || DEFAULT_PAGINATION);
    } catch (error) {
      console.error("Error fetching product:", error);
      setProducts([]);
      setPagination(DEFAULT_PAGINATION);
    } finally {
      setLoading(false);
    }
  }, [includeAnalytics, limit, page, period, search, status]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, pagination, refetch: fetchProducts };
}

export function useProductRevenueReport(params: TProductListParams = {}) {
  const [products, setProducts] = useState<TProductPayload[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<TPagination>(DEFAULT_PAGINATION);
  const [reportTotals, setReportTotals] = useState<TProductReportTotals | null>(null);

  const {
    page = 1,
    limit = 10,
    search,
    status,
    period = "month",
  } = params;

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await useApi.get<TProductsApiResponse>("/v1/admin/product/revenue-report", {
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
          ...(status ? { status } : {}),
          period,
        },
      });
      setProducts(data?.data || []);
      setPagination(data?.pagination || DEFAULT_PAGINATION);
      setReportTotals(data?.reportTotals || null);
    } catch (error) {
      console.error("Error fetching product revenue report:", error);
      setProducts([]);
      setPagination(DEFAULT_PAGINATION);
      setReportTotals(null);
    } finally {
      setLoading(false);
    }
  }, [limit, page, period, search, status]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return { products, loading, pagination, reportTotals, refetch: fetchReport };
}

export function useProduct(id: string | undefined) {
  const [product, setProduct] = useState<TProductPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await useApi.get(`/v1/admin/product/${id}`);
      setProduct(data?.data || null);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return { product, loading, refetch: fetchProduct };
}

export function useCreateProduct() {
  const [error, setError] = useState<string[]>([]);

  const createProduct = async (data: TProductPayload) => {
    try {
      const { data: result } = await useApi.post(
        "/v1/admin/product/create",
        data
      );
      return result;
    } catch (error: any) {
      setError([
        error?.response?.data?.message || "An unexpected error occurred.",
      ]);
      console.error("Error creating product:", error?.response?.data?.message);
    }
  };

  return { createProduct, error };
}

export function useUpdateProduct() {
  const [error, setError] = useState<string[]>([]);

  const updateProduct = async (
    id: string | undefined,
    data: Partial<TProductPayload>
  ) => {
    try {
      const { data: result } = await useApi.put(
        `/v1/admin/product/update/${id}`,
        data
      );
      return result;
    } catch (error: any) {
      setError([
        error?.response?.data?.message || "An unexpected error occurred.",
      ]);
      console.error("Error updating product:", error);
    }
  };

  return { updateProduct, error };
}

// export function useDeleteProduct() {
//   const deleteProduct = async (id: string) => {
//     try {
//       const { data } = await useApi.delete(`/v1/admin/product/delete/${id}`);
//       return data;
//     } catch (error) {
//       console.error("Error deleting Product:", error);
//     }
//   };

//   return { deleteProduct };
// }

export function useDeleteProduct() {
  return useDelete("/v1/admin/product/delete");
}
