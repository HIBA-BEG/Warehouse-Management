export const loginWarehouseman = async (secretKey: string) => {
    try {
        const response = await fetch('http://localhost:3000/warehousemans');
        const warehousemans = await response.json();

        const warehouseman = warehousemans.find((warehouseman: { secretKey: string }) => warehouseman.secretKey === secretKey);

        return warehouseman ? { success: true, warehouseman } : { success: false };
    } catch (error) {
        console.error('Error fetching warehousemans:', error);
        return { success: false, error: 'Unable to login. Please try again later.' };
    }
};


export const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3000/products');
      const data = await response.json();
      return { success: true, products: data };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { success: false, error: 'Unable to fetch products.' };
    }
  };