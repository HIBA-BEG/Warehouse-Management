import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Modal, RefreshControl } from 'react-native';
import ApiService from '../(services)/api';
import { Feather } from '@expo/vector-icons';
import warehousemanStorage from '../(services)/warehousemanStorage';
import { router, useLocalSearchParams } from 'expo-router';
import ProductDetails from '@/components/product/productDetails';
import AddProduct from '@/components/product/addProduct';
import { Product } from '@/types/product';

const Products: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [warehouseman, setWarehouseman] = useState<{ name: string, city: string } | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isAddProductVisible, setAddProductVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isModalVisible, setModalVisible] = useState(false);

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
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
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
                <Text style={styles.searchText}>Search</Text>
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
                <View style={styles.productsContainer}>
                    {products.map((product) => (
                        <View key={product.id} style={styles.productCard}>
                            <View
                                style={[
                                    styles.stockStatusBand,
                                    getStockStatusBandStyle(product)
                                ]}
                            />
                            <TouchableOpacity onPress={() => handleProductClick(product)}>
                                <Image
                                    source={{ uri: product.image }}
                                    style={styles.productImage}
                                />
                                <Text style={styles.productTitle}>{product.name}</Text>
                                <Text style={styles.productPrice}>Price: ${product.price}</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
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
        </ScrollView>
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
        marginVertical: 16,
        padding: 12,
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
    },
    searchText: {
        marginLeft: 8,
        color: '#666',
    },
    productCard: {
        width: '47%',
        marginBottom: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        // borderRadius: 8,
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
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
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 14,
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
});

export default Products;