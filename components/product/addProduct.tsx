import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, Alert, TouchableOpacity, ScrollView } from 'react-native';
import ApiService from '../../app/(services)/api';
import { Feather } from '@expo/vector-icons';
import warehousemanStorage from '@/app/(services)/warehousemanStorage';
import { router } from 'expo-router';
import { Product } from '@/types/product';
import * as ImagePicker from "expo-image-picker"
import { Image } from 'react-native';

const generateUniqueId = () => Date.now() + Math.floor(Math.random() * 1000);

const AddProduct: React.FC<{ onClose: () => void, initialBarcode?: string }> = ({ onClose, initialBarcode }) => {
    const [showStockForm, setShowStockForm] = useState(false);
    const [productData, setProductData] = useState<Product>({
        id: generateUniqueId(),
        name: '',
        type: '',
        barcode: initialBarcode || '',
        price: 0,
        supplier: '',
        image: '',
        stocks: [
            {
                id: generateUniqueId(),
                name: "",
                quantity: 0,
                localisation: {
                    city: "",
                    latitude: 0,
                    longitude: 0
                }
            }
        ],
        editedBy: []
    });

    const handleAddProduct = async () => {
        const warehouseman = await warehousemanStorage.getWarehouseman();
        // console.log('warehouseman', warehouseman);

        const warehousemanId = warehouseman?.id;
        // console.log('warehousemanId', warehousemanId);

        const newProduct = {
            ...productData,
            price: parseFloat(productData.price.toString()),
            stocks: productData.stocks.map(stock => ({
                ...stock,
                id: generateUniqueId(),
                quantity: parseInt(stock.quantity.toString()),
                localisation: {
                    ...stock.localisation,
                    id: generateUniqueId(),
                    latitude: parseFloat(stock.localisation.latitude.toString()),
                    longitude: parseFloat(stock.localisation.longitude.toString())
                }
            })),
            editedBy: [{ warehousemanId, at: new Date().toISOString() }]
        };
        console.log('the newProduct', newProduct)

        try {
            const response = await ApiService.addProduct(newProduct as any);
            if (response.success) {
                Alert.alert('Success', 'Product added successfully!');
                onClose();
            } else {
                Alert.alert('Error', response.error || 'Failed to add product.');
            }
        } catch (error) {
            console.error('Error adding product:', error);
            Alert.alert('Error', 'An error occurred while adding the product.');
        }
    };

    const handleInputChange = (field: keyof Product, value: string) => {
        setProductData(prev => ({
            ...prev,
            [field]: field === 'price' ? parseFloat(value) || 0 : value
        }));
    };

    const handleStockChange = (index: number, field: string, value: string) => {
        const newStocks = [...productData.stocks];

        if (field === 'city') {
            newStocks[index] = {
                ...newStocks[index],
                localisation: {
                    ...newStocks[index].localisation,
                    city: value
                }
            };
        } else if (field === 'latitude' || field === 'longitude') {
            newStocks[index] = {
                ...newStocks[index],
                localisation: {
                    ...newStocks[index].localisation,
                    [field]: parseFloat(value) || 0
                }
            };
        } else if (field === 'quantity') {
            newStocks[index] = {
                ...newStocks[index],
                quantity: parseInt(value) || 0
            };
        } else {
            newStocks[index] = {
                ...newStocks[index],
                [field]: value
            };
        }

        setProductData(prev => ({ ...prev, stocks: newStocks }));
    };

    const handleImagePick = async () => {
        try {

            const permissionResult =
                await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                alert(
                    "Permission denied. You need to grant permission to access the media library."
                );
                return;
            }

            const pickerResult = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.5,
            });

            if (
                !pickerResult.canceled &&
                pickerResult.assets &&
                pickerResult.assets.length > 0
            ) {
                const imageUri = pickerResult.assets[0].uri;
                handleInputChange("image", imageUri)
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to pick image. Please try again.");
        }
    };

    const addNewStock = () => {
        setProductData(prev => ({
            ...prev,
            stocks: [
                ...prev.stocks,
                {
                    id: generateUniqueId(),
                    name: "",
                    quantity: 0,
                    localisation: {
                        city: "",
                        latitude: 0,
                        longitude: 0
                    }
                }
            ]
        }));
    };

    return (
        <ScrollView style={styles.container}>
            <Feather style={styles.closeButton} onPress={onClose} name="x-square" size={24} color="#E91E63" />

            <Text style={styles.title}>Add New Product</Text>

            <TextInput placeholder="Name" value={productData.name} onChangeText={(value) => handleInputChange('name', value)} style={styles.input} />
            <TextInput placeholder="Type" value={productData.type} onChangeText={(value) => handleInputChange('type', value)} style={styles.input} />
            <View style={styles.barcodeContainer}>
                <TextInput placeholder="Barcode" value={productData.barcode} onChangeText={(value) => handleInputChange('barcode', value)} style={styles.barCodeInput} />
                <TouchableOpacity style={styles.scanButton} onPress={() => router.push("/codeBarScanner")}>
                    <Text style={{ color: '#fff' }}>Scan Barcode</Text>
                </TouchableOpacity>
            </View>
            <TextInput placeholder="Price" value={productData.price.toString()} onChangeText={(value) => handleInputChange('price', value)} keyboardType="numeric" style={styles.input} />
            <TextInput placeholder="Supplier" value={productData.supplier} onChangeText={(value) => handleInputChange('supplier', value)} style={styles.input} />
            <TouchableOpacity onPress={handleImagePick} style={styles.imageButton}>
                <Text style={{ color: '#fff' }}>Pick Image</Text>
            </TouchableOpacity>

            {productData.image ? (
                <Image source={{ uri: productData.image }} style={styles.imagePreview} />
            ) : (
                <Text style={styles.noImageText}>No image selected</Text>
            )}

            <View style={styles.warehouseHeader}>
                <Text style={styles.warehouseTitle}>do you want to add Warehouse in your product ?</Text>
                <TouchableOpacity style={styles.toggleButton} onPress={() => setShowStockForm(!showStockForm)}>
                    <Text style={styles.toggleButtonText}>{showStockForm ? "-" : "+"}</Text>
                </TouchableOpacity>
            </View>

            {showStockForm &&
                productData.stocks.map((stock, index) => (
                    <View key={index} style={styles.stockContainer}>
                        <Text style={styles.stockTitle}>Stock {index + 1}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Warehouse Name"
                            placeholderTextColor="gray"
                            value={stock.name}
                            onChangeText={(value) => handleStockChange(index, "name", value)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Quantity"
                            placeholderTextColor="gray"
                            keyboardType="numeric"
                            value={stock.quantity.toString()}
                            onChangeText={(value) => handleStockChange(index, "quantity", value)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="City"
                            placeholderTextColor="gray"
                            value={stock.localisation.city}
                            onChangeText={(value) => handleStockChange(index, "city", value)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="latitude"
                            placeholderTextColor="gray"
                            value={stock.localisation.latitude.toString()}
                            onChangeText={(value) => handleStockChange(index, "latitude", value)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="longitude"
                            placeholderTextColor="gray"
                            value={stock.localisation.longitude.toString()}
                            onChangeText={(value) => handleStockChange(index, "longitude", value)}
                        />
                    </View>
                ))}

            {showStockForm && (
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={addNewStock}
                >
                    <Text style={styles.addButtonText}>Add Another Stock</Text>
                </TouchableOpacity>
            )}

            <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
                    <Text style={styles.buttonText}>Add Product</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                    <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
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
        // color: '#E91E63',
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
        width: '60%'
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
    imageButton: {
        backgroundColor: "#1B263B",
        padding: 10,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 20,
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
    },
    imagePreview: {
        width: 150,
        height: 150,
        resizeMode: "cover",
        marginTop: 10,
        marginBottom: 20,
        borderRadius: 8,
        alignSelf: "center",
    },
    noImageText: {
        color: "#6C757D",
        fontSize: 16,
        marginTop: 10,
        marginBottom: 20,
        textAlign: "center",
    },
    warehouseHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
        backgroundColor: "#E9ECEF",
        padding: 15,
        borderRadius: 8,
    },
    warehouseTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#495057",
    },
    toggleButton: {
        backgroundColor: "#AF1740",
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
    },
    toggleButtonText: {
        color: "white",
        fontSize: 24,
        fontWeight: "bold",
    },

    stockContainer: {
        marginBottom: 20,
        padding: 20,
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#CED4DA",
    },
    stockTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#495057",
    },
    addButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});

export default AddProduct;