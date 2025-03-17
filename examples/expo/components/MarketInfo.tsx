import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

export function MarketInfo() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Market Information</Text>
      <Text style={styles.statusText}>
        SDK integrations have been removed from this example.
      </Text>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          This is a simplified version of the MarketInfo component without SDK
          dependencies.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => alert("SDK integrations have been removed")}
      >
        <Text style={styles.buttonText}>Mock Action</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  statusText: {
    fontSize: 16,
    color: "#4b5563",
    marginBottom: 16,
  },
  infoContainer: {
    backgroundColor: "#e5e7eb",
    padding: 10,
    borderRadius: 6,
    marginVertical: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#4b5563",
  },
  button: {
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
