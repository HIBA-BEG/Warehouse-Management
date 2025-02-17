import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Alert, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import ApiService from '@/app/(services)/api';
import { Product } from '@/types/product';

interface ProductDetailsProps {
    product: Product;
    onClose: () => void;
    onStockUpdate: () => Promise<void>;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onClose, onStockUpdate }) => {
    const [quantities, setQuantities] = useState<{ [key: number]: string }>({});

    if (!product) {
        return (
            <View style={styles.container}>
                <Feather 
                    style={styles.closeButton} 
                    name="x-square" 
                    size={24} 
                    color="#000" 
                    onPress={onClose} 
                />
                <Text style={styles.errorText}>Product not found</Text>
            </View>
        );
    }

    const getStockStatusBandStyle = (quantity: number) => {
        if (quantity === 0) {
            return styles.outOfStockBand;
        } else if (quantity < 10) {
            return styles.lowStockBand;
        }
        return styles.inStockBand;
    };

    const handleUpdateStock = async (stockId: number, operation: 'add' | 'remove') => {
        const quantity = parseInt(quantities[stockId] || '0', 10);
        if (isNaN(quantity) || quantity < 0) {
            Alert.alert('Error', 'Please enter a valid quantity.');
            return;
        }

        const stock = product.stocks.find((s) => s.id === stockId);
        if (!stock) {
            Alert.alert('Error', 'Stock not found.');
            return;
        }

        let updatedStock = operation === 'add' ? stock.quantity + quantity : stock.quantity - quantity;

        if (updatedStock < 0) {
            Alert.alert('Error', `Not enough stock. Maximum available: ${stock.quantity}`);
            return;
        }

        try {
            const response = await ApiService.updateStock(String(product.id), stockId, updatedStock);
            if (response.success) {
                Alert.alert('Success', 'Stock updated successfully!');
                setQuantities(prev => ({
                    ...prev,
                    [stockId]: ''
                }));
               
                await onStockUpdate();
            } else {
                Alert.alert('Error', response.error || 'Failed to update stock.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'An unexpected error occurred.');
        }
    };

    return (
        <View style={styles.container}>
            <Feather 
                style={styles.closeButton} 
                name="x-square" 
                size={24} 
                color="#000" 
                onPress={onClose} 
            />
            <Text style={styles.title}>{product.name}</Text>
            <Image
                source={{ uri: product.image }}
                style={styles.image}
                onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
            />
            <Text style={styles.price}>Price: {product.price} $</Text>
            <Text style={styles.type}>Type: {product.type}</Text>
            <Text style={styles.barcode}>Barcode: {product.barcode}</Text>
            <Text style={styles.supplier}>Supplier: {product.supplier}</Text>

            <Text style={styles.stockTitle}>Stocks:</Text>
            {product.stocks?.map((stock) => (
                <View key={stock.id} style={styles.stockContainer}>
                    <View 
                        style={[
                            styles.stockStatusBand, 
                            getStockStatusBandStyle(stock.quantity)
                        ]} 
                    />
                    <Text style={styles.stockName}>{stock.name}</Text>
                    <Text>Quantity: {stock.quantity}</Text>
                    <Text>Location: {stock.localisation?.city || 'Unknown'}</Text>

                    <View style={styles.inputContainer}>
                        <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => handleUpdateStock(stock.id, 'remove')}
                        >
                            <Text style={styles.removeButtonText}>Remove</Text>
                        </TouchableOpacity>

                        <TextInput
                            placeholder="0"
                            keyboardType="numeric"
                            value={quantities[stock.id] || ''}
                            onChangeText={(text) => setQuantities(prev => ({
                                ...prev,
                                [stock.id]: text
                            }))}
                            style={styles.input}
                        />

                        <TouchableOpacity
                            onPress={() => handleUpdateStock(stock.id, 'add')}
                            style={styles.addButton}
                        >
                            <Text style={styles.addButtonText}>Add</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ))}

            <Text style={styles.edited}>
                Edited on {product.editedBy[0]?.at}
            </Text>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        width: '90%',
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        color: '#E91E63',
        padding: 10,
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        width: 50,
        textAlign: 'center',
        padding: 10,
        alignItems: 'center',
        marginBottom: 10,
    },

    stockStatusBand: {
        position: 'absolute',
        top: 0,
        right: 0,
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

    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 10,
    },
    price: {
        fontSize: 18,
        color: 'green',
    },
    type: {
        fontSize: 16,
        color: '#666',
    },
    description: {
        fontSize: 14,
        color: '#333',
    },


    barcode: {
        fontSize: 16,
        color: '#666',
    },
    supplier: {
        fontSize: 16,
        color: '#666',
    },
    solde: {
        fontSize: 16,
        color: '#666',
    },
    stockTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
    },
    stockContainer: {
        marginTop: 5,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        position: 'relative',
    },
    stockName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    edited: {
        fontSize: 14,
        color: '#666',
        position: 'absolute',
        bottom: 10,
        right: 10,
    },
    addButton: {
        backgroundColor: '#1B263B',
        color: 'white',
        padding: 10,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 10,
        width: '30%',
    },
    addButtonText: {
        color: 'white',
    },
    removeButton: {
        backgroundColor: '#778DA9',
        padding: 10,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 10,
        width: '30%',
    },
    removeButtonText: {
        color: 'white',
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },

});

export default ProductDetails;