import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { marketplaceService } from "../services/marketplaceService";
import { mapAdoptionToProduct, mapServiceToProduct } from "../utils/productAdapter";
import type { Product } from "../types/marketplace";
import type { AdoptionResponse } from "../../dashboard/shared/adopciones/types/adoption.types";

export const useProductDetails = (id?: string) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [rawAdoption, setRawAdoption] = useState<AdoptionResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            setLoading(true);
            try {
                if (id.startsWith("adoption_")) {
                    const actualId = Number(id.replace("adoption_", ""));
                    const data = await marketplaceService.getAdoptionById(actualId);
                    setRawAdoption(data);
                    setProduct(mapAdoptionToProduct(data));
                } else if (id.startsWith("service_")) {
                    const actualId = Number(id.replace("service_", ""));
                    const data = await marketplaceService.getServiceById(actualId);
                    setProduct(mapServiceToProduct(data));
                } else {
                    const data = await marketplaceService.getProductById(Number(id));
                    setProduct({ ...data, itemType: 'product' });
                }
            } catch (error) {
                console.error("Error fetching product details:", error);
                toast.error("No se pudo cargar el producto.");
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    return { product, rawAdoption, loading };
};