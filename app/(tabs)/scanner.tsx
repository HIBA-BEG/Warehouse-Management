import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ApiService from '../(services)/api';

export default function Scanner() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = React.useState(false);
    const [isChecking, setIsChecking] = React.useState(false);
    const [productDetails, setProductDetails] = React.useState(null);
    const [showNotFoundModal, setShowNotFoundModal] = React.useState(false);
    const [scannedBarcode, setScannedBarcode] = React.useState('');

    useFocusEffect(
        React.useCallback(() => {
            setScanned(false);
            setIsChecking(false);
        }, [])
    );

    React.useEffect(() => {
        requestCameraPermission();
    }, []);

    const requestCameraPermission = async () => {
        if (!permission?.granted) {
            const permissionResult = await requestPermission();
            if (!permissionResult.granted) {
                Alert.alert(
                    'Permission Required',
                    'Camera permission is required to scan barcodes',
                    [{ text: 'OK', onPress: () => router.back() }]
                );
            }
        }
    };

    const BarcodeExists = async (barcode: string) => {
        try {
            setIsChecking(true);
            const result = await ApiService.checkBarcodeExists(barcode);
            console.log('code bar search: ', barcode);

            if (result.success) {
                if (result.product) {
                    setProductDetails(result.product);
                    return result.product;
                }
                return null;
            } else {
                Alert.alert('Error', result.error || 'Failed to check barcode in database');
                return null;
            }
        } catch (error) {
            console.error('Error checking barcode:', error);
            Alert.alert('Error', 'Failed to check barcode in database');
            return null;
        } finally {
            setIsChecking(false);
        }
    };


    const handleBarCodeScanned = async ({ data }: { data: string }) => {
        if (scanned || isChecking) return;
        setScanned(true);

        try {
            const product = await BarcodeExists(data);

            if (product) {
                router.push({
                    pathname: `/products`,
                    params: {
                        productId: product.id,
                        showDetails: "true"
                    }
                });
                setTimeout(() => setScanned(false), 500);

            } else {
                setScannedBarcode(data);
                setShowNotFoundModal(true);
            }
        } catch (error) {
            console.error('Scanning error:', error);
            Alert.alert('Error', 'Failed to process barcode');
            setScanned(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <CameraView
                style={styles.camera}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ['ean13', 'ean8', 'upc_e', 'upc_a'],
                }}
            >
                <View style={styles.overlay}>
                    <Text style={styles.scanhereText}>
                        Scan here your barcode
                    </Text>
                    <View style={styles.scanArea}>
                        {isChecking && (
                            <View style={styles.loadingContainer}>
                                <Text style={styles.loadingText}>Checking barcode...</Text>
                            </View>
                        )}
                    </View>
                </View>
            </CameraView>

            <Modal
                visible={showNotFoundModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => {
                    setShowNotFoundModal(false);
                    setScanned(false);
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Product Not Found</Text>
                        <Text style={styles.modalText}>Would you like to add this product?</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.addProdButton]}
                                onPress={() => {
                                    setShowNotFoundModal(false);
                                    router.push({
                                        pathname: "/products",
                                        params: { barcode: scannedBarcode }
                                    });
                                }}
                            >
                                <Text style={styles.addProdText}>Add Product</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.reScanButton]}
                                onPress={() => {
                                    setShowNotFoundModal(false);
                                    setScanned(false);
                                }}
                            >
                                <Text style={styles.reScanText}>Scan Again</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanArea: {
        width: 300,
        height: 160,
        borderWidth: 2,
        borderColor: '#007AFF',
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        position: 'relative',
    },
    loadingContainer: {
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 20,
        borderRadius: 10,
    },
    loadingText: {
        color: 'white',
        marginTop: 10,
        fontSize: 14,
        fontWeight: '500',
    },
    scanhereText: {
        color: 'white',
        fontSize: 20,
        textAlign: 'center',
        position: 'absolute',
        top: 40,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        width: '80%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#1a1a1a',
    },
    modalText: {
        fontSize: 16,
        marginBottom: 20,
        color: '#666',
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    addProdButton: {
        padding: 10,
        borderRadius: 12,
        minWidth: 120,
        alignItems: 'center',
        backgroundColor: '#1B263B',
    },
    reScanButton: {
        padding: 10,
        borderRadius: 12,
        minWidth: 120,
        alignItems: 'center',
        backgroundColor: '#778DA9',
    },
    addProdText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    reScanText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});