import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/config';
import SearchBar from '../../components/SearchBar';
import ProductCard from '../../components/ProductCard';
import api from '../../services/api';

const SearchScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches] = useState([
    'Giày chạy bộ',
    'Áo thể thao',
    'Quần short',
    'Găng tay',
    'Bóng đá',
    'Yoga',
  ]);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  // Auto search with debounce (like customer-web)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch(searchQuery);
      } else {
        setProducts([]);
        setHasSearched(false);
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadRecentSearches = async () => {
    // Load from AsyncStorage if needed
    // For now, using empty array
  };

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setProducts([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const response = await api.searchProducts(query.trim());
      if (response.success && response.data) {
        const productList = Array.isArray(response.data)
          ? response.data
          : response.data.products || [];
        setProducts(productList);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setProducts([]);
    }

    setLoading(false);
  }, []);

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      // Add to recent searches when user explicitly submits
      if (!recentSearches.includes(searchQuery.trim())) {
        const updated = [searchQuery.trim(), ...recentSearches.slice(0, 9)];
        setRecentSearches(updated);
      }
    }
  };

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setProducts([]);
    setHasSearched(false);
  };

  const renderProduct = ({ item }: any) => (
    <View style={styles.productWrapper}>
      <ProductCard
        id={item._id}
        ten={item.ten || item.tenSanPham}
        gia={item.gia || item.giaBan}
        giaKhuyenMai={item.giaKhuyenMai}
        hinhAnh={item.hinhAnh?.[0] || ''}
        danhGiaTrungBinh={item.danhGiaTrungBinh}
        daBan={item.daBan}
        onPress={() => navigation.navigate('ProductDetail', { id: item._id })}
      />
    </View>
  );

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
        </View>
      );
    }

    if (hasSearched && products.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="search-outline" size={80} color={COLORS.gray[300]} />
          <Text style={styles.emptyTitle}>Không tìm thấy kết quả</Text>
          <Text style={styles.emptyText}>
            Không có sản phẩm nào phù hợp với "{searchQuery}"
          </Text>
          <Text style={styles.emptySubtext}>
            Hãy thử từ khóa khác hoặc kiểm tra chính tả
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.suggestionsContainer}>
        {recentSearches.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tìm kiếm gần đây</Text>
              <TouchableOpacity onPress={() => setRecentSearches([])}>
                <Text style={styles.clearText}>Xóa tất cả</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.chipContainer}>
              {recentSearches.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.chip}
                  onPress={() => handleQuickSearch(item)}
                >
                  <Ionicons name="time-outline" size={16} color={COLORS.gray[600]} />
                  <Text style={styles.chipText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tìm kiếm phổ biến</Text>
          <View style={styles.chipContainer}>
            {popularSearches.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.chip, styles.popularChip]}
                onPress={() => handleQuickSearch(item)}
              >
                <Ionicons name="trending-up-outline" size={16} color={COLORS.primary} />
                <Text style={[styles.chipText, styles.popularChipText]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SIZES.safeAreaTop }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <View style={styles.searchBarContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm kiếm sản phẩm..."
            onClear={handleClearSearch}
            autoFocus={true}
            onSubmitEditing={handleSearchSubmit}
          />
        </View>
      </View>

      {/* Results */}
      {hasSearched && products.length > 0 ? (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultCount}>
            Tìm thấy {products.length} sản phẩm
          </Text>
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item._id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.productList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      ) : (
        renderEmptyState()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  searchBarContainer: {
    flex: 1,
  },
  searchButton: {
    padding: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2,
  },
  loadingText: {
    marginTop: 12,
    fontSize: SIZES.body,
    color: COLORS.gray[600],
  },
  emptyTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginTop: 16,
  },
  emptyText: {
    fontSize: SIZES.body,
    color: COLORS.gray[600],
    marginTop: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: SIZES.small,
    color: COLORS.gray[500],
    marginTop: 4,
    textAlign: 'center',
  },
  suggestionsContainer: {
    flex: 1,
    padding: SIZES.padding,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  clearText: {
    fontSize: SIZES.small,
    color: COLORS.primary,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.gray[100],
    borderRadius: 20,
  },
  chipText: {
    fontSize: SIZES.small,
    color: COLORS.gray[700],
  },
  popularChip: {
    backgroundColor: COLORS.primary + '15',
  },
  popularChipText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  resultCount: {
    fontSize: SIZES.body,
    color: COLORS.gray[600],
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  productList: {
    padding: SIZES.padding,
  },
  row: {
    justifyContent: 'space-between',
  },
  productWrapper: {
    width: '48%',
    marginBottom: 16,
  },
});

export default SearchScreen;
