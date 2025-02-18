
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native"
import ApiService from "../(services)/api"
import { Statistics } from "../../types/statistics"

export default function StatisticsScreen() {
    const [statistics, setStatistics] = useState<Statistics | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);


useEffect(() => {
    const loadStats = async () => {
      try {
        const result = await ApiService.fetchStatistics();
        if (result.success) {
          setStatistics(result.statistics as Statistics);
        } else {
          setError('Failed to fetch statistics');
        }
      } catch (err) {
        setError('An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) return <View><Text>Loading statistics...</Text></View>;
  if (error) return <View><Text>Error: {error}</Text></View>;
  if (!statistics) return <View><Text style={styles.errorText}>No statistics available</Text></View>;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#740938" />
        <Text style={styles.loadingText}>Loading statistics...</Text>
      </View>
    )
  }

  return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Warehouse Statistics</Text>

        <View style={styles.cardContainer}>
          <StatCard title="Total Products" value={statistics.totalProducts} color="green" />
          <StatCard title="Total Stock" value={statistics.totalStock} color="#FF8042" />
          <StatCard title="Stock Value" value={`$${statistics.totalValue}`} color="#FFC107" />
        </View>
      </ScrollView>
  )
}

const StatCard = ({ title, value, color }: { title: string; value: string | number; color: string }) => (
  <View style={[styles.statCard, { borderLeftColor: color, borderRightColor: color, borderBottomColor: color, borderTopColor: color }]}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
)


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#740938",
  },
  errorText: {
    fontSize: 18,
    color: "#D32F2F",
    textAlign: "center",
    marginTop: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1B263B",
    textAlign: "center",
  },
  cardContainer: {
    marginTop:40,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    width: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 2,
    borderTopWidth: 2
  },
  statTitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  button: {
    backgroundColor: "#740938",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },
  
})
