// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Handle polyfills for crypto, etc.
config.resolver.extraNodeModules = {
  stream: require.resolve("stream-browserify"),
  buffer: require.resolve("buffer"),
};

module.exports = config;
