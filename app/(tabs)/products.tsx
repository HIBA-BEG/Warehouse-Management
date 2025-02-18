import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Modal, RefreshControl } from 'react-native';
import ApiService from '../(services)/api';
import { Feather } from '@expo/vector-icons';
import warehousemanStorage from '../(services)/warehousemanStorage';
import { router, useLocalSearchParams } from 'expo-router';
import ProductDetails from '@/components/product/productDetails';
import AddProduct from '@/components/product/addProduct';
import { Product } from '@/types/product';
import { FlatList, TextInput } from 'react-native-gesture-handler';

type SortBy = 'default' | 'name' | 'stock' | 'price';
type SortOrder = 'asc' | 'desc';

const Products: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [warehouseman, setWarehouseman] = useState<{ name: string, city: string } | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isAddProductVisible, setAddProductVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isModalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortBy>('default');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');


    const params = useLocalSearchParams();
    const barcode = params.barcode;
    const productId = params.productId;
    const showDetails = params.showDetails;

    useEffect(() => {
        if (barcode) {
            console.log('Received barcode:', barcode);
            setAddProductVisible(true);
        }
    }, [barcode]);

    useEffect(() => {
        if (productId && showDetails === "true" && products.length > 0) {
            const product = products.find(p => p.id.toString() === productId);
            if (product) {
                setSelectedProduct(product);
                setModalVisible(true);
            }
        }
    }, [productId, showDetails, products]);

    const loadProducts = async () => {
        try {
            const result = await ApiService.fetchProducts();
            if (result.success) {
                setProducts(result.products);
                if (selectedProduct) {
                    const updatedProduct = result.products.find((p: Product) => p.id === selectedProduct.id);
                    if (updatedProduct) {
                        setSelectedProduct(updatedProduct);
                    }
                }
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to load products. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const checkWarehouseman = async () => {
        const userData = await warehousemanStorage.getWarehouseman();
        console.log(userData);
        if (!userData) {
            Alert.alert('Login Failed', 'Please login to continue.');
            router.replace('/');
            return;
        }
        setWarehouseman(userData);
    }

    useEffect(() => {
        checkWarehouseman();
        loadProducts();
    }, []);

    const getSortedProducts = () => {
        let filtered = products.filter(product =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (sortBy === 'default') return filtered;

        return filtered.sort((a, b) => {
            let valueA, valueB;

            switch (sortBy) {
                case 'name':
                    valueA = a.name.toLowerCase();
                    valueB = b.name.toLowerCase();
                    break;
                case 'price':
                    valueA = a.price;
                    valueB = b.price;
                    break;
                case 'stock':
                    valueA = a.stocks.map((item: any) => item.quantity);
                    valueB = b.stocks.map((item: any) => item.quantity);
                    break;
                default:
                    return 0;
            }

            if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
            if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    };

    const handleSortPress = (option: SortBy) => {
        if (sortBy === option) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(option);
            setSortOrder('asc');
        }
    };

    const getStockStatusBandStyle = (product: Product) => {
        if (product.stocks.length === 0) {
            return styles.outOfStockBand;
        }

        const totalStock = product.stocks.reduce((sum: number, stock: any) => sum + stock.quantity, 0);

        if (totalStock < 10) {
            return styles.lowStockBand;
        }

        return styles.inStockBand;
    };

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        setModalVisible(true);
    };

    const handleCloseDetails = () => {
        setModalVisible(false);
        setSelectedProduct(null);
    };

    const handleOpenAddProduct = () => {
        setAddProductVisible(true);
    };

    const handleCloseAddProduct = () => {
        setAddProductVisible(false);
        loadProducts();
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadProducts();
    };

    const handleStockUpdate = async () => {
        await loadProducts();
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.profileSection}>
                    <View style={styles.avatar}>
                        <Image
                            source={require('../../assets/images/profilepic.jpg')}
                            style={styles.avatarPlaceholder}
                        />
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.name}>{warehouseman?.name}</Text>
                        <Text style={styles.status}>{warehouseman?.city}</Text>
                    </View>
                </View>
                <Feather
                    name="log-out"
                    size={24}
                    color="#000"
                    onPress={() => warehousemanStorage.logoutWarehouseman()}
                />
            </View>

            <View style={styles.searchBar}>
                <Feather name="search" size={20} color="#666" />
                <TextInput
                    style={styles.searchText}
                    placeholder="Search products..."
                    value={searchQuery}
                    onChangeText={setSearchQuery} />
            </View>

            <View style={styles.sortContainer}>
                <Text style={styles.sortLabel}>Sort by:</Text>
                <TouchableOpacity
                    style={[styles.sortButton, sortBy === 'name' && styles.activeSort]}
                    onPress={() => handleSortPress('name')}
                >
                    <Text style={styles.sortText}>Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.sortButton, sortBy === 'price' && styles.activeSort]}
                    onPress={() => handleSortPress('price')}
                >
                    <Text style={styles.sortText}>Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.sortButton, sortBy === 'stock' && styles.activeSort]}
                    onPress={() => handleSortPress('stock')}
                >
                    <Text style={styles.sortText}>Stock {sortBy === 'stock' && (sortOrder === 'asc' ? '↑' : '↓')}</Text>
                </TouchableOpacity>
            </View>

            <View>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>All products</Text>
                    <TouchableOpacity onPress={handleOpenAddProduct}>
                        <Text style={styles.addButton}>
                            <Feather name="plus" size={14} color="#fff" /> Add product
                        </Text>
                    </TouchableOpacity>
                </View>

                <Modal
                    visible={isModalVisible}
                    animationType="slide"
                    transparent={true}
                >
                    {selectedProduct && (
                        <View style={styles.modalOverlay}>
                            <ProductDetails
                                product={selectedProduct}
                                onClose={handleCloseDetails}
                                onStockUpdate={handleStockUpdate}
                            />
                        </View>
                    )}
                </Modal>
            </View>

            <Modal
                visible={isAddProductVisible}
                animationType="fade"
                transparent={true}
            >
                <View style={styles.modalOverlay}>
                    <AddProduct onClose={handleCloseAddProduct} initialBarcode={barcode || ''} />
                </View>
            </Modal>


            <FlatList
                data={getSortedProducts()}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                contentContainerStyle={styles.productsContainer}
                columnWrapperStyle={styles.columnWrapper}
                renderItem={({ item }) => (
                    <View key={item.id} style={styles.productCard}>
                        <View
                            style={[
                                styles.stockStatusBand,
                                getStockStatusBandStyle(item)
                            ]}
                        />
                        <TouchableOpacity onPress={() => handleProductClick(item)}>
                            <Image
                                source={{ uri: item.image }}
                                style={styles.productImage}
                            />
                            <Text style={styles.productTitle}>{item.name}</Text>
                            <Text style={styles.productPrice}>Price: ${item.price}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#e0e1dd',
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        marginRight: 12,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 15,
        backgroundColor: '#E1E1E1',
    },
    profileInfo: {
        justifyContent: 'center',
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
    },
    status: {
        fontSize: 12,
        color: '#666',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 6,
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
    },
    searchText: {
        marginLeft: 8,
        color: '#666',
    },
    productCard: {
        width: '48%',
        marginBottom: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        // borderRadius: 8,
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
    },

    columnWrapper: {
        justifyContent: 'space-between',
    },

    image: {
        width: '100%',
        height: 200,
        borderRadius: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    price: {
        fontSize: 16,
        color: 'green',
        position: 'absolute',
        bottom: 10,
        right: 10,
    },

    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    addButton: {
        color: '#fff',
        fontSize: 14,
        backgroundColor: '#1B263B',
        borderRadius: 12,
        padding: 8,
    },

    productsContainer: {
        padding: 8,
    },
    productImage: {
        width: '100%',
        height: 120,
        borderRadius: 16,
        marginBottom: 8,
    },
    productTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 14,
        color: '#666',
    },
    stockStatusBand: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 8,
        height: '100%',
    },
    inStockBand: {
        backgroundColor: 'green',
    },
    lowStockBand: {
        backgroundColor: '#FFC107',
    },
    outOfStockBand: {
        backgroundColor: '#E91E63',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },


    sortContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        backgroundColor: '#F5F5F5',
        marginTop: 4,
        marginBottom: 16,
        borderRadius: 12,
    },
    sortLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginRight: 10,
        color: '#333',
    },
    sortButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#778DA9',
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    activeSort: {
        backgroundColor: '#1B263B',
    },
    sortText: {
        fontSize: 14,
        color: '#fff',
    },
});

export default Products;