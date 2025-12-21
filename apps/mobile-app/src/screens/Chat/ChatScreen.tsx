import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/config';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface ProductSuggestion {
  _id: string;
  ten: string;
  gia: number;
  giaKhuyenMai?: number;
  hinhAnh: string[];
  slug?: string;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  products?: ProductSuggestion[];
}

const ChatScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Xin chào! Tôi là trợ lý ảo của LP SHOP. Tôi có thể giúp gì cho bạn?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await api.sendChatMessage(
        inputText.trim(),
        messages.map((m) => ({
          role: m.isUser ? 'user' : 'assistant',
          content: m.text,
        }))
      );

      console.log('AI Response:', JSON.stringify(response.data, null, 2));

      if (response.success && response.data?.message) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.data.message,
          isUser: false,
          timestamp: new Date(),
          products: response.data.suggestedProducts || [], // Product suggestions từ AI
        };

        console.log('Bot message products:', botMessage.products);
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error('Không nhận được phản hồi từ AI');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setLoading(false);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={styles.messageContainer}>
      <View style={[styles.messageRow, item.isUser && styles.messageRowUser]}>
        {/* Avatar cho AI bot */}
        {!item.isUser && (
          <View style={styles.botAvatar}>
            <Ionicons name="sparkles" size={16} color={COLORS.white} />
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            item.isUser ? styles.userBubble : styles.botBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              item.isUser ? styles.userText : styles.botText,
            ]}
          >
            {item.text}
          </Text>
          <Text
            style={[
              styles.timestamp,
              item.isUser ? styles.userTimestamp : styles.botTimestamp,
            ]}
          >
            {item.timestamp.toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {/* Avatar cho user */}
        {item.isUser && (
          <View style={styles.userAvatarContainer}>
            {user?.anhDaiDien || user?.avatar ? (
              <Image
                source={{ uri: user.anhDaiDien || user.avatar }}
                style={styles.userAvatar}
              />
            ) : (
              <View style={styles.userAvatarFallback}>
                <Ionicons name="person" size={16} color={COLORS.white} />
              </View>
            )}
          </View>
        )}
      </View>

      {/* Product Cards nếu có suggestions */}
      {item.products && item.products.length > 0 && !item.isUser && (
        <View style={styles.productsContainer}>
          {item.products.map((product, index) => (
            <TouchableOpacity
              key={`${item.id}-product-${index}`}
              style={styles.productCard}
              onPress={() => navigation.navigate('ProductDetail', { id: product._id })}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: product.hinhAnh[0] || 'https://via.placeholder.com/400' }}
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {product.ten}
                </Text>
                <View style={styles.productPriceRow}>
                  {product.giaKhuyenMai ? (
                    <>
                      <Text style={styles.productSalePrice}>
                        ₫{product.giaKhuyenMai.toLocaleString('vi-VN')}
                      </Text>
                      <Text style={styles.productOriginalPrice}>
                        ₫{product.gia.toLocaleString('vi-VN')}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.productPrice}>
                      ₫{product.gia.toLocaleString('vi-VN')}
                    </Text>
                  )}
                </View>
                <View style={styles.productAction}>
                  <Text style={styles.productActionText}>Xem chi tiết</Text>
                  <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SIZES.safeAreaTop }]}>
        <View style={styles.headerIcon}>
          <Ionicons name="chatbubbles" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Trợ lý ảo</Text>
          <Text style={styles.headerSubtitle}>Luôn sẵn sàng hỗ trợ bạn</Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang trả lời...</Text>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor={COLORS.gray[400]}
          multiline
          maxLength={500}
          editable={!loading}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || loading) && styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim() || loading}
        >
          <Ionicons
            name="send"
            size={20}
            color={
              !inputText.trim() || loading ? COLORS.gray[400] : COLORS.white
            }
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  headerSubtitle: {
    fontSize: SIZES.small,
    color: COLORS.gray[600],
    marginTop: 2,
  },
  messagesList: {
    padding: SIZES.padding,
  },
  messageContainer: {
    marginBottom: 12,
    width: '100%',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.warning,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  userAvatarContainer: {
    width: 32,
    height: 32,
    marginBottom: 4,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  userAvatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gray[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBubble: {
    flex: 1,
    maxWidth: '70%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: SIZES.body,
    lineHeight: 22,
  },
  userText: {
    color: COLORS.white,
  },
  botText: {
    color: COLORS.dark,
  },
  timestamp: {
    fontSize: SIZES.tiny,
    marginTop: 4,
  },
  userTimestamp: {
    color: COLORS.white,
    opacity: 0.8,
    textAlign: 'right',
  },
  botTimestamp: {
    color: COLORS.gray[500],
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: SIZES.padding,
    gap: 8,
  },
  loadingText: {
    fontSize: SIZES.small,
    color: COLORS.gray[600],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: SIZES.body,
    color: COLORS.dark,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.gray[200],
  },
  // Product Card Styles
  productsContainer: {
    marginTop: 8,
    gap: 8,
    width: '100%',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    padding: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.gray[100],
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  productSalePrice: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.danger,
  },
  productOriginalPrice: {
    fontSize: SIZES.small,
    color: COLORS.gray[400],
    textDecorationLine: 'line-through',
  },
  productAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  productActionText: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default ChatScreen;
