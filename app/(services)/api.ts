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

    async updateStock(productId: string, stockId: number, newQuantity: number) {
        try {
            const productResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/products/${productId}`);
            const product = await productResponse.json();
    
            const updatedProduct = {
                ...product,
                stocks: product.stocks.map(stock => 
                    stock.id === stockId 
                        ? { ...stock, quantity: newQuantity }
                        : stock
                )
            };
    
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/products/${productId}`, {
                method: 'PUT', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedProduct),
            });
    
            console.log(` the product id is ${productId} the stock id is ${stockId} the current quantity is ${newQuantity}`);
    
            if (response.ok) {
                const data = await response.json();
                return { success: true, data };
            } else {
                console.log('Error:', response.statusText);
                return { 
                    success: false, 
                    error: response.statusText || 'Failed to update stock'
                };
            }
        } catch (error) {
            console.error("Error updating stock:", error);
            return { success: false, error: 'Unable to update product stock.' };
        }
    },

    async addStock(productId: number, quantity: number) {
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/products/${productId}/stocks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quantity }),
            });

            if (response.ok) {
                const data = await response.json();
                return { success: true, data };
            } else {
                const errorData = await response.json();
                return { success: false, error: errorData.error || 'Failed to add stock' };
            }
        } catch (error) {
            console.error("Error adding stock:", error);
            return { success: false, error: 'Unable to add product stock.'};
        }
    },

    async deleteStock(productId: number, stockId: number) {
        try {
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/products/${productId}/stocks/${stockId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                return { success: true };
            } else {
                const errorData = await response.json();
                return { success: false, error: errorData.error || 'Failed to delete stock' };
            }
        } catch (error) {
            console.error("Error deleting stock:", error);
            return { success: false, error: 'Unable to delete product stock.' };
        }
    },


};

export default ApiService;