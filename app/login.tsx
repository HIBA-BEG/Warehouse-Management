import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import ApiService from './services/api';
import { router } from 'expo-router';
import warehousemanStorage from './services/warehousemanStorage';

const Login: React.FC = () => {
    const [secretKey, setSecretKey] = useState('');

    const handleLogin = async () => {
        const result = await ApiService.loginWarehouseman(secretKey);
    
        if (result.success) {
          console.log('Login successful:', result.warehouseman);
          await warehousemanStorage.saveWarehouseman(result.warehouseman);
          
          router.replace('/(tabs)/products');
        } else {
          Alert.alert('Login Failed', result.error || 'Invalid secret key. Please try again.');
        }
      };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter you secretKey"
                value={secretKey}
                onChangeText={setSecretKey}
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#171717',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    title: {
        color: '#fff',
        fontSize: 24,
        marginBottom: 20,
    },
    input: {
        width: '100%',
        color: '#fff',
        fontWeight: 'bold',
        height: 50,
        boxShadow: 'inset 2px 5px 10px rgb(5, 5, 5)',
        borderWidth: 1,
        borderRadius: 15,
        marginBottom: 15,
        paddingHorizontal: 25,
    },
    forgotPassword: {
        marginTop: 15,
        color: 'blue',
    },
    button: {
        backgroundColor: '#252525',
        boxShadow: 'inset 2px 5px 10px rgb(5, 5, 5)',
        borderRadius: 15,
        borderColor: '#ccc',
        borderWidth: 2,
        padding: 10,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
    },
});

export default Login;