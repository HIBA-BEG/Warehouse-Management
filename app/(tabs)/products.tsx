import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { fetchProducts } from '../services/api';

const Products: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
        const result = await fetchProducts();
        if (result.success) {
          setProducts(result.products);
        } else {
          console.error(result.error);
        }
        setLoading(false);
      };
  
      loadProducts();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <ScrollView style={styles.container}>
      {products.map((product) => (
        <View key={product.id} style={styles.productCard}>
          <Image source={{ uri: product.image }} style={styles.image} />
          <Text style={styles.title}>{product.name}</Text>
          <Text>Type: {product.type}</Text>
          <Text>Price: ${product.price}</Text>
          <Text>Supplier: {product.supplier}</Text>
          <Text>Barcode: {product.barcode}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  productCard: {
    marginBottom: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
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
});

export default Products;