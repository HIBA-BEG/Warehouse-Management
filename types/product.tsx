export interface Product {
    id: number;
    name: string;
    type: string;
    barcode: string;
    price: number;
    supplier: string;
    image: string;
    stocks: {
        id: number;
        name: string;
        quantity: number;
        localisation: {
            city: string;
            latitude: number;
            longitude: number;
        };
    }[];
    editedBy: {
        warehousemanId: number;
        at: string;
    }[];
}
