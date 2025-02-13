import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';
import ApiService from '../../app/(services)/api';
import { Feather } from '@expo/vector-icons';
import warehousemanStorage from '@/app/(services)/warehousemanStorage';
import { router } from 'expo-router';

const AddProduct: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [barcode, setBarcode] = useState('');
    const [price, setPrice] = useState('');
    const [supplier, setSupplier] = useState('');
    const [image, setImage] = useState('');
    const [stocks, setStocks] = useState([{ name: '', quantity: 0, localisation: { city: '' } }]);

    const handleAddProduct = async () => {
        const warehouseman = await warehousemanStorage.getWarehouseman();
        // console.log('warehouseman', warehouseman);
        
        const warehousemanId = warehouseman?.id;
        // console.log('warehousemanId', warehousemanId);
        
        const newProduct = {
            name,
            type,
            barcode,
            price: parseFloat(price),
            supplier,
            image,
            stocks,
            editedBy: [{ warehousemanId, at: new Date().toISOString() }]
        };
        // console.log('the newProduct', newProduct)

        try {
            const response = await ApiService.addProduct(newProduct);
            if (response.success) {
                Alert.alert('Success',   'Product added successfully!');
                onClose();
            } else {
                Alert.alert('Error', response.error || 'Failed to add product.');
            }
        } catch (error) {
            console.error('Error adding product:', error);
            Alert.alert('Error', 'An error occurred while adding the product.');
        }
    };

    return (
        <View style={styles.container}>
            <Feather style={styles.closeButton} name="x-square" size={24} color="#000" onPress={onClose} />

            <Text style={styles.title}>Add New Product</Text>

            <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
            <TextInput placeholder="Type" value={type} onChangeText={setType} style={styles.input} />
            <View style={styles.barcodeContainer}>
                <TextInput placeholder="Barcode" value={barcode} onChangeText={setBarcode} style={styles.barCodeInput} />
                <TouchableOpacity style={styles.scanButton} onPress={()=>router.push("/codeBarScanner")}>
                    <Text style={{color: '#fff'}}>Scan Barcode</Text>
                </TouchableOpacity>
            </View>
            <TextInput placeholder="Price" value={price} onChangeText={setPrice} keyboardType="numeric" style={styles.input} />
            <TextInput placeholder="Supplier" value={supplier} onChangeText={setSupplier} style={styles.input} />
            <TextInput placeholder="Image URL" value={image} onChangeText={setImage} style={styles.input} />
            <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
                    <Text style={styles.buttonText}>Add Product</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                    <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        width: '90%',
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        color: '#E91E63',
        padding: 10,
    },
    title: {
        fontSize: 24,
        marginBottom: 10,
    },
    barcodeContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        justifyContent: 'space-between',
        gap: 10
    },
    scanButton: {
        backgroundColor: '#1B263B',
        padding: 10,
        borderRadius: 12,
        alignItems: 'center',
    },
    barCodeInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        padding: 10,
        width: '100%'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        padding: 10,
        marginBottom: 10,
    },
    buttonsContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10
    },
    addButton: {
        backgroundColor: '#1B263B',
        padding: 10,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 10,
        width: '48%',
    },
    cancelButton: {
        backgroundColor: '#778DA9',
        padding: 10,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 10,
        width: '48%'
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    }
});

export default AddProduct;