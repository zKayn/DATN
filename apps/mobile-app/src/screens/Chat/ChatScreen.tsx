import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../../constants/config';

const ChatScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat AI - Gemini</Text>
      <Text style={styles.subtitle}>Sẽ tích hợp chatbot ở đây</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, padding: SIZES.padding, paddingTop: 50, alignItems: 'center' },
  title: { fontSize: SIZES.h2, fontWeight: 'bold' },
  subtitle: { fontSize: SIZES.body, color: COLORS.gray[500], marginTop: 8 },
});

export default ChatScreen;
