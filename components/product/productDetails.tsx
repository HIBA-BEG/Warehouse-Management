import ApiService from '@/app/(services)/api';
import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Alert, TextInput, TouchableOpacity } from 'react-native';
import { Product } from '@/types/product';
    

const ProductDetails: React.FC<{ product: Product; onClose: () => void }> = ({ product, onClose }) => {
    const [quantityTo, setQuantityTo] = useState('');


    const getStockStatusBandStyle = (quantity: number) => {
        if (quantity === 0) {
            return styles.outOfStockBand;
        } else if (quantity < 10) {
            return styles.lowStockBand;
        }
        return styles.inStockBand;
    };

    const handleAddStock = async () => {
        const quantity = parseInt(quantityTo, 10);
        if (quantity < 0) {
            Alert.alert('Error', 'Please enter a valid quantity.');
            return;
        }
        
        const updatedStock = product.stocks[0].quantity + quantity;
        try {
            const response = await ApiService.updateStock(String(product.id), product.stocks[0].id, updatedStock);
            if (response.success) {
                Alert.alert('Success', 'Stock updated successfully!');
                setQuantityTo('');
                // onClose(); 
            } else {
                Alert.alert('Error', response.error || 'Failed to update stock.');
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred.');
        }
    };
    
    const handleRemoveStock = async () => {
        const quantity = parseInt(quantityTo, 10);
        if (quantity < 0) {
            Alert.alert('Error', 'Please enter a valid quantity.');
            return;
        }
        
        const updatedStock = product.stocks[0].quantity - quantity;
        if (updatedStock < 0) {
            Alert.alert('Error', 'Stock cannot be negative.');
            return;
        }
        try {
            const response = await ApiService.updateStock(String(product.id), product.stocks[0].id, updatedStock);
            if (response.success) {
                Alert.alert('Success', 'Stock updated successfully!');
                setQuantityTo(''); 
                // onClose();
            } else {
                Alert.alert('Error', response.error || 'Failed to update stock.');
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred.');
        }
    };

    return (
        <View style={styles.container}>
            <Feather style={styles.closeButton} name="x-square" size={24} color="#000" onPress={onClose} />
            <Text style={styles.title}>{product.name}</Text>
            <Image source={{ uri: product.image }} style={styles.image} />
            <Text style={styles.price}>Price: {product.price} $</Text>
            <Text style={styles.type}>Type: {product.type}</Text>
            <Text style={styles.barcode}>Barcode: {product.barcode}</Text>
            <Text style={styles.supplier}>Supplier: {product.supplier}</Text>

            <Text style={styles.stockTitle}>Stocks:</Text>
            {product.stocks.map((stock: any) => (
                <View key={stock.id} style={styles.stockContainer}>
                    <View style={[styles.stockStatusBand, getStockStatusBandStyle(stock.quantity)]} />
                    <Text style={styles.stockName}>{stock.name}</Text>
                    <Text>Quantity: {stock.quantity}</Text>
                    <Text>Location: {stock.localisation.city}</Text>

                    <View style={styles.inputContainer}>
                        <TouchableOpacity onPress={handleRemoveStock}>
                            <Text>Remove</Text>
                        </TouchableOpacity>
                        <TextInput
                            placeholder="0"
                            keyboardType="numeric"
                            value={quantityTo}
                            onChangeText={setQuantityTo}
                            style={styles.input}
                        />
                        <TouchableOpacity onPress={handleAddStock}>
                            <Text>Add</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            ))}

            <Text style={styles.edited}>Edited on {product.editedBy[0]?.at}</Text>

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
        padding: 5,
        width: 50,
        textAlign: 'center',
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
});

export default ProductDetails;