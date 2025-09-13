import { useCallback, useEffect, useState } from "react";
import useApi from "../../use-api";
import { TSellableProduct } from "@/interface/common";
export type Product = Record<string, unknown>;

export function useActiveProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchActiveProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await useApi.get("/v1/admin/inventory/active-products");
      setProducts(data?.data || []);
    } catch (error) {
      console.error("Error fetching active products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveProducts();
  }, [fetchActiveProducts]);

  return { products, loading, refetch: fetchActiveProducts };
}

export function useStockProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchStockProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await useApi.get("/v1/admin/inventory/stock-products");
      setProducts(data?.data || []);
    } catch (error) {
      console.error("Error fetching stock products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStockProducts();
  }, [fetchStockProducts]);

  return { products, loading, refetch: fetchStockProducts };
}

export function useLowStockProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchLowStockProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await useApi.get(
        "/v1/admin/inventory/low-stock-products"
      );
      setProducts(data?.data || []);
    } catch (error) {
      console.error("Error fetching Low stock products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLowStockProducts();
  }, [fetchLowStockProducts]);

  return { products, loading, refetch: fetchLowStockProducts };
}

export function useExpiredProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchExpiredProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await useApi.get("/v1/admin/inventory/expired-products");
      setProducts(data?.data || []);
    } catch (error) {
      console.error("Error fetching expired products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpiredProducts();
  }, [fetchExpiredProducts]);

  return { products, loading, refetch: fetchExpiredProducts };
}

export function useSellableProducts() {
  const [products, setProducts] = useState<TSellableProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchSellableProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await useApi.get(
        "/v1/admin/inventory/sellable-products"
      );
      setProducts(data?.data || []);
    } catch (error) {
      console.error("Error fetching sellable products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSellableProducts();
  }, [fetchSellableProducts]);

  return { products, loading, refetch: fetchSellableProducts };
}

export function useOutOfStockProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchOutOfStockProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await useApi.get(
        "/v1/admin/inventory/out-of-stock-products"
      );
      setProducts(data?.data || []);
    } catch (error) {
      console.error("Error fetching out of stock products:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOutOfStockProducts();
  }, [fetchOutOfStockProducts]);

  return { products, loading, refetch: fetchOutOfStockProducts };
}
