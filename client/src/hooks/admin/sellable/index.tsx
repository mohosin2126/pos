
import { useCallback, useEffect, useMemo, useState } from "react";
import useApi from "../../use-api";

type QueryParams = Record<string, string | number | boolean | undefined>;

export function useSellableProducts(params?: QueryParams) {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const memoizedParams = useMemo(() => params ?? {}, [params]);

    const fetchSellableProducts = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const { data } = await useApi.get(
                "/v1/admin/inventory/sellable-products",
                { params: memoizedParams }
            );

          
            setProducts(data?.data ?? []);
        } catch (err: any) {
            const message =
                err?.response?.data?.message || "Failed to fetch sellable products.";
            setError(message);
            console.error("Error fetching sellable products:", message);
        } finally {
            setLoading(false);
        }
    }, [memoizedParams]);

    useEffect(() => {
        fetchSellableProducts();
    }, [fetchSellableProducts]);

    return {
        products,
        loading,
        error,
        refetch: fetchSellableProducts,
    };
}
