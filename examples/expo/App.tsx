import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import React from "react";
import { StyleSheet, Text, View, SafeAreaView, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WalletConnectButton } from "./components/WalletConnectButton";
import { MarketInfo } from "./components/MarketInfo";

// Create a client for React Query
const queryClient = new QueryClient();

// Main App component
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Simplified Expo Example</Text>
          <Text style={styles.subtitle}>SDK integrations removed</Text>
          <WalletConnectButton />
          <MarketInfo />
          <StatusBar style="auto" />
        </ScrollView>
      </SafeAreaView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 20,
    textAlign: "center",
  },
});
