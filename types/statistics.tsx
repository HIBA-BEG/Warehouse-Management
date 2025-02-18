export interface Statistics {
    totalProducts: number;
    totalStock: number;
    outOfStock: number;
    averagePrice: number;
    totalValue: number;
    totalOutOfStock: number;
    mostAddedProducts: Array<{
        nom: string;
        quantity: number;
    }>;
    mostRemovedProducts: Array<{
        nom: string;
        quantity: number;
    }>;
}

