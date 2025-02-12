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

};

export default ApiService;