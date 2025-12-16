import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { COLORS, SIZES } from '../../constants/config';

const ReviewScreen = ({ route, navigation }: any) => {
  const { productId, productName, productImage, orderId } = route.params || {};

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề đánh giá');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung đánh giá');
      return;
    }

    if (content.length < 20) {
      Alert.alert('Lỗi', 'Nội dung đánh giá phải có ít nhất 20 ký tự');
      return;
    }

    setLoading(true);
    try {
      const reviewData: any = {
        danhGia: rating,
        tieuDe: title,
        noiDung: content,
      };

      if (orderId) {
        reviewData.donHang = orderId;
      }

      const response = await api.createReview(productId, reviewData);

      if (response.success) {
        Alert.alert(
          'Thành công',
          'Đánh giá của bạn đã được gửi và đang chờ phê duyệt',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể gửi đánh giá');
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      Alert.alert(
        'Lỗi',
        error.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại sau.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={40}
              color={star <= rating ? '#FFD700' : COLORS.gray[400]}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getRatingText = () => {
    switch (rating) {
      case 1:
        return 'Rất tệ';
      case 2:
        return 'Tệ';
      case 3:
        return 'Bình thường';
      case 4:
        return 'Tốt';
      case 5:
        return 'Rất tốt';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Product Info */}
        <View style={styles.productCard}>
          {productImage && (
            <Image
              source={{ uri: productImage }}
              style={styles.productImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {productName || 'Sản phẩm'}
            </Text>
          </View>
        </View>

        {/* Rating Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đánh giá của bạn</Text>
          {renderStars()}
          <Text style={styles.ratingText}>{getRatingText()}</Text>
        </View>

        {/* Title Input */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Tiêu đề đánh giá <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Tóm tắt đánh giá của bạn"
            value={title}
            onChangeText={setTitle}
            maxLength={200}
          />
          <Text style={styles.charCount}>{title.length}/200</Text>
        </View>

        {/* Content Input */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Nội dung đánh giá <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Chia sẻ chi tiết về trải nghiệm của bạn với sản phẩm này (tối thiểu 20 ký tự)"
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={6}
            maxLength={1000}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{content.length}/1000</Text>
        </View>

        {/* Guidelines */}
        <View style={styles.guidelinesCard}>
          <View style={styles.guidelineHeader}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            <Text style={styles.guidelineTitle}>Hướng dẫn viết đánh giá</Text>
          </View>
          <Text style={styles.guidelineText}>
            • Đánh giá trung thực về sản phẩm{'\n'}
            • Mô tả chi tiết ưu/nhược điểm{'\n'}
            • Không sử dụng ngôn ngữ không phù hợp{'\n'}
            • Đánh giá sẽ được kiểm duyệt trước khi hiển thị
          </Text>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="send" size={20} color={COLORS.white} />
              <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadius,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    justifyContent: 'center',
  },
  productName: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.dark,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    textAlign: 'center',
    fontSize: SIZES.h3,
    fontWeight: '600',
    color: COLORS.primary,
  },
  label: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
  },
  required: {
    color: COLORS.error,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: SIZES.borderRadius,
    padding: 12,
    fontSize: SIZES.body,
    color: COLORS.dark,
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  charCount: {
    textAlign: 'right',
    fontSize: SIZES.small,
    color: COLORS.gray[600],
    marginTop: 4,
  },
  guidelinesCard: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: SIZES.borderRadius,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  guidelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  guidelineTitle: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.primary,
  },
  guidelineText: {
    fontSize: SIZES.small,
    color: COLORS.gray[700],
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: '600',
  },
});

export default ReviewScreen;
