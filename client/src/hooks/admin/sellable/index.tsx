// hooks/admin/sellable.ts (or wherever your hook lives)
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
            // if useApi is a hook, call it first: const api = useApi(); then api.get(...)
            const { data } = await useApi.get(
                "/v1/admin/inventory/sellable-products",
                { params: memoizedParams }
            );

            // Expecting: { success: true, message: "...", data: [{ product: {...}, unexpiredQty: "10.00" }, ...] }
            const rows = data?.data ?? [];

            const normalized = rows.map((row: any) => {
                const p = row?.product ?? {};
                // fallbacks for fields your UI reads
                return {
                    ...p,
                    // prefer unexpiredQty as actual sellable stock
                    unexpiredQty: Number(row?.unexpiredQty ?? 0),
                    stockQuantity: Number(row?.unexpiredQty ?? p?.stockQuantity ?? 0),
                    // make sure price/unitPrice exists (0 if the API doesn’t provide it)
                    unitPrice: Number(p?.unitPrice ?? p?.price ?? 0),
                    // normalize category so productCategoryName() can read it
                    category:
                        p?.category ??
                        (p?.categoryName ? { name: p.categoryName } : undefined),
                };
            });

            setProducts(normalized);
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
