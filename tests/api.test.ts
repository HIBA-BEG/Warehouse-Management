import ApiService from '../app/(services)/api';

global.fetch = jest.fn();

const mockFetchResponse = (data: any, ok = true) => {
    return Promise.resolve({
        ok,
        json: () => Promise.resolve(data),
        statusText: ok ? 'OK' : 'Error'
    });
};

describe('ApiService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('loginWarehouseman', () => {
        it('should successfully login warehouseman with correct secret key', async () => {
            const mockWarehouseman = { id: 1, name: 'Eytch Hiba', secretKey: 'ABC1234' };
            (global.fetch as jest.Mock).mockImplementationOnce(() => 
                mockFetchResponse([mockWarehouseman])
            );

            const result = await ApiService.loginWarehouseman('ABC1234');
            
            expect(result.success).toBe(true);
            expect(result.warehouseman).toEqual(mockWarehouseman);
        });

        it('should fail login with incorrect secret key', async () => {
            (global.fetch as jest.Mock).mockImplementationOnce(() => 
                mockFetchResponse([{ secretKey: 'ABC1234' }])
            );

            const result = await ApiService.loginWarehouseman('wrong-key');
            
            expect(result.success).toBe(false);
            expect(result.warehouseman).toBeUndefined();
        });

        it('should handle fetch error', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const result = await ApiService.loginWarehouseman('ABC1234');
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('Unable to login. Please try again later.');
        });
    });

    describe('fetchProducts', () => {
        it('should successfully fetch products', async () => {
            const mockProducts = [
                { id: 1, name: 'Aïn saiss' },
                { id: 2, name: 'TOSHIBA' }
            ];
            (global.fetch as jest.Mock).mockImplementationOnce(() => 
                mockFetchResponse(mockProducts)
            );

            const result = await ApiService.fetchProducts();
            
            expect(result.success).toBe(true);
            expect(result.products).toEqual(mockProducts);
        });

        it('should handle fetch error', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const result = await ApiService.fetchProducts();
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('Unable to fetch products.');
        });
    });

    describe('addProduct', () => {
        it('should handle fetch error', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const result = await ApiService.addProduct({} as any);
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('Unable to add product.');
        });
    });

    describe('updateStock', () => {
        it('should successfully update stock quantity', async () => {
            const mockProduct = {
                id: '1',
                stocks: [{ id: 1, quantity: 5 }]
            };
            
            // Mock both fetch calls
            (global.fetch as jest.Mock)
                .mockImplementationOnce(() => mockFetchResponse(mockProduct))
                .mockImplementationOnce(() => mockFetchResponse({ ...mockProduct, stocks: [{ id: 1, quantity: 10 }] }));

            const result = await ApiService.updateStock('1', 1, 10);
            
            expect(result.success).toBe(true);
            expect(result.data.stocks[0].quantity).toBe(10);
        });

        it('should handle fetch error', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const result = await ApiService.updateStock('1', 1, 10);
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('Unable to update product stock.');
        });
    });

    describe('addStock', () => {
        it('should successfully add stock', async () => {
            const mockResponse = { id: 1, quantity: 10 };
            (global.fetch as jest.Mock).mockImplementationOnce(() => 
                mockFetchResponse(mockResponse)
            );

            const result = await ApiService.addStock(1, 10);
            
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockResponse);
        });

        it('should handle fetch error', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const result = await ApiService.addStock(1, 10);
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('Unable to add product stock.');
        });
    });

    describe('checkBarcodeExists', () => {
        it('should return product when barcode exists', async () => {
            const mockProduct = { id: 1, barcode: '123456' };
            (global.fetch as jest.Mock).mockImplementationOnce(() => 
                mockFetchResponse([mockProduct])
            );

            const result = await ApiService.checkBarcodeExists('123456');
            
            expect(result.success).toBe(true);
            expect(result.product).toEqual(mockProduct);
        });

        it('should return null when barcode does not exist', async () => {
            (global.fetch as jest.Mock).mockImplementationOnce(() => 
                mockFetchResponse([])
            );

            const result = await ApiService.checkBarcodeExists('123456');
            
            expect(result.success).toBe(true);
            expect(result.product).toBeNull();
        });

        it('should handle fetch error', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const result = await ApiService.checkBarcodeExists('123456');
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('Unable to check barcode.');
        });
    });

    describe('fetchStatistics', () => {
        it('should calculate correct statistics', async () => {
            const mockProducts = [
                { 
                    id: 1, 
                    price: 10,
                    stocks: [{ quantity: 5 }, { quantity: 5 }]
                },
                {
                    id: 2,
                    price: 20,
                    stocks: [{ quantity: 10 }]
                }
            ];
            (global.fetch as jest.Mock).mockImplementationOnce(() => 
                mockFetchResponse(mockProducts)
            );

            const result = await ApiService.fetchStatistics();
            
            expect(result.success).toBe(true);
            expect(result.statistics).toEqual({
                totalProducts: 2,
                totalStock: 20,
                averagePrice: 15,
                totalValue: 300 
            });
        });

        it('should handle fetch error', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const result = await ApiService.fetchStatistics();
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('Unable to fetch statistics.');
        });
    });
});