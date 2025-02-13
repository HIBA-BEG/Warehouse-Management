interface Product {
    name: string;
    type: string;
    barcode: string;
    price: number;
    supplier: string;
    image: string;
    stocks: {
        name: string;
        quantity: number;
        localisation: {
            city: string;
        };
    }[];
    editedBy: {
        warehousemanId: number;
        at: string;
    }[];
}

const ApiService = {
    async loginWarehouseman(secretKey: string) {
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/warehousemans`);
            const warehousemans = await response.json();

            const warehouseman = warehousemans.find((warehouseman: { secretKey: string }) => warehouseman.secretKey === secretKey);

            return warehouseman ? { success: true, warehouseman } : { success: false };

        } catch (error) {
            console.error('Error fetching warehousemans:', error);
            return { success: false, error: 'Unable to login. Please try again later.' };
        }
    },

    async fetchProducts() {
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/products`);
            const data = await response.json();
            return { success: true, products: data };
        } catch (error) {
            console.error('Error fetching products:', error);
            return { success: false, error: 'Unable to fetch products.' };
        }
    },

    async addProduct(product: Product) {    
        // const dbPath = path.join(__dirname, '../../db/db.json');

        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(product),
            });
            const data = await response.json();
            return { success: true, product: data };
        } catch (error) {
            console.error('Error adding product:', error);
            return { success: false, error: 'Unable to add product.' };
        }
    },

};

export default ApiService;