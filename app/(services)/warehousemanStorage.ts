import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

interface WarehousemanData {
  id: string;
  name: string;
  secretKey: string;
  city: string;
}

class WarehousemanStorageService {
  private USER_KEY = 'logged_warehouseman';

  async saveWarehouseman(warehousemanData: WarehousemanData): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.USER_KEY, 
        JSON.stringify(warehousemanData)
      );
    } catch (error) {
      console.error('Error saving warehouseman data:', error);
    }
  }

  async getWarehouseman(): Promise<WarehousemanData | null> {
    try {
      const allWarehousemans = await AsyncStorage.getItem(this.USER_KEY);
      return allWarehousemans != null ? JSON.parse(allWarehousemans) : null;
    } catch (error) {
      console.error('Error getting warehouseman data:', error);
      return null;
    }
  }

  async logoutWarehouseman(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.USER_KEY);
      router.push('/');
      console.log('Warehouseman logged out successfully.');
    } catch (error) {
      console.error('Error logging out of warehouseman:', error);
    }
  }

}

export default new WarehousemanStorageService();