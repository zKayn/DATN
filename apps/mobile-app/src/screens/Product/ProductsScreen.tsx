import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from '../../components/ProductCard';
import api from '../../services/api';
import { COLORS, SIZES } from '../../constants/config';

interface Product {
  _id: string;
  ten: string;
  slug?: string;
  gia: number;
  giaKhuyenMai?: number;
  hinhAnh: string[];
  danhGiaTrungBinh: number;
  soLuongDanhGia: number;
  daBan: number;
  thuongHieu: string;
  danhMuc: any;
  soLuongTonKho: number;
  noiBat?: boolean;
  sanPhamMoi?: boolean;
}

interface Filters {
  category: string;
  brand: string;
  minPrice: number;
  maxPrice: number;
  sort: string;
  filter: string; // sale, new, bestseller, featured, all
}

const ProductsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  const [filters, setFilters] = useState<Filters>({
    category: '',
    brand: '',
    minPrice: 0,
    maxPrice: 10000000,
    sort: 'newest',
    filter: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  // Handle route params (category, filter)
  useEffect(() => {
    if (route.params) {
      const { category, filter } = route.params;

      // Reset filters first
      const newFilters: Filters = {
        category: '',
        brand: '',
        minPrice: 0,
        maxPrice: 10000000,
        sort: 'newest',
        filter: '',
      };

      // Handle category param
      if (category) {
        // Find category by slug or name
        const foundCategory = categories.find(
          (cat) => cat.slug === category || cat.ten === category || cat._id === category
        );
        if (foundCategory) {
          newFilters.category = foundCategory._id;
        }
      }

      // Handle filter param (sale, new, bestseller, featured, all)
      if (filter) {
        newFilters.filter = filter;
        newFilters.sort = filter === 'bestseller' ? 'popular' : filter === 'new' ? 'newest' : 'newest';
      }

      setFilters(newFilters);
    } else {
      // No params, reset to default
      setFilters({
        category: '',
        brand: '',
        minPrice: 0,
        maxPrice: 10000000,
        sort: 'newest',
        filter: '',
      });
    }
  }, [route.params, categories]);

  useEffect(() => {
    applyFilters();
  }, [products, filters, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load products
      const productsResponse = await api.getProducts({ limit: 100 });
      if (productsResponse.success && productsResponse.data) {
        const productList = Array.isArray(productsResponse.data)
          ? productsResponse.data
          : productsResponse.data.products || [];
        setProducts(productList);

        // Extract unique brands
        const uniqueBrands = [...new Set(productList.map((p: Product) => p.thuongHieu))];
        setBrands(uniqueBrands as string[]);
      }

      // Load categories
      const categoriesResponse = await api.getCategories();
      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(Array.isArray(categoriesResponse.data) ? categoriesResponse.data : []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.ten.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.thuongHieu.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Special filter type (sale, new, bestseller, featured)
    if (filters.filter) {
      switch (filters.filter) {
        case 'sale':
          // Products with discount
          filtered = filtered.filter(p => p.giaKhuyenMai && p.giaKhuyenMai < p.gia);
          break;
        case 'new':
          // New products
          filtered = filtered.filter(p => p.sanPhamMoi === true);
          break;
        case 'bestseller':
          // Sort by sold quantity
          filtered.sort((a, b) => b.daBan - a.daBan);
          break;
        case 'featured':
          // Featured products
          filtered = filtered.filter(p => p.noiBat === true);
          break;
        case 'all':
        default:
          // No special filter
          break;
      }
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(p => {
        const categoryId = typeof p.danhMuc === 'object' ? p.danhMuc._id : p.danhMuc;
        return categoryId === filters.category;
      });
    }

    // Brand filter
    if (filters.brand) {
      filtered = filtered.filter(p => p.thuongHieu === filters.brand);
    }

    // Price filter
    filtered = filtered.filter(p => {
      const price = p.giaKhuyenMai || p.gia;
      return price >= filters.minPrice && price <= filters.maxPrice;
    });

    // Sort (if not already sorted by filter)
    if (filters.filter !== 'bestseller') {
      switch (filters.sort) {
        case 'price-asc':
          filtered.sort((a, b) => (a.giaKhuyenMai || a.gia) - (b.giaKhuyenMai || b.gia));
          break;
        case 'price-desc':
          filtered.sort((a, b) => (b.giaKhuyenMai || b.gia) - (a.giaKhuyenMai || a.gia));
          break;
        case 'popular':
          filtered.sort((a, b) => b.daBan - a.daBan);
          break;
        case 'rating':
          filtered.sort((a, b) => b.danhGiaTrungBinh - a.danhGiaTrungBinh);
          break;
        default: // newest
          break;
      }
    }

    setFilteredProducts(filtered);
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      brand: '',
      minPrice: 0,
      maxPrice: 10000000,
      sort: 'newest',
      filter: '',
    });
    setSearchQuery('');
  };

  const renderHeader = () => {
    // Get current filter label
    const getFilterLabel = () => {
      if (filters.filter === 'sale') return 'Flash Sale';
      if (filters.filter === 'new') return 'Hàng Mới Về';
      if (filters.filter === 'bestseller') return 'Bán Chạy';
      if (filters.filter === 'featured') return 'Nổi Bật';
      if (filters.category) {
        const cat = categories.find(c => c._id === filters.category);
        return cat ? cat.ten : '';
      }
      return '';
    };

    const filterLabel = getFilterLabel();

    return (
      <View style={[styles.header, { paddingTop: insets.top + SIZES.safeAreaTop }]}>
        {/* Current Filter Label */}
        {filterLabel && (
          <View style={styles.currentFilterContainer}>
            <Text style={styles.currentFilterLabel}>{filterLabel}</Text>
            <TouchableOpacity onPress={resetFilters}>
              <Ionicons name="close-circle" size={20} color={COLORS.gray[400]} />
            </TouchableOpacity>
          </View>
        )}

        {/* Search */}
        <TouchableOpacity
          style={styles.searchContainer}
          onPress={() => navigation.navigate('Search')}
          activeOpacity={0.7}
        >
          <Ionicons name="search" size={20} color={COLORS.gray[400]} />
          <Text style={styles.searchPlaceholder}>Tìm kiếm sản phẩm...</Text>
        </TouchableOpacity>

        {/* Filter & Sort Buttons */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="options-outline" size={20} color={COLORS.primary} />
            <Text style={styles.filterButtonText}>Bộ lọc</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => {
              const sortOptions = ['newest', 'popular', 'price-asc', 'price-desc', 'rating'];
              const currentIndex = sortOptions.indexOf(filters.sort);
              const nextIndex = (currentIndex + 1) % sortOptions.length;
              setFilters({ ...filters, sort: sortOptions[nextIndex] });
            }}
          >
            <Ionicons name="swap-vertical" size={20} color={COLORS.primary} />
            <Text style={styles.sortButtonText}>
              {filters.sort === 'newest' && 'Mới nhất'}
              {filters.sort === 'popular' && 'Bán chạy'}
              {filters.sort === 'price-asc' && 'Giá tăng dần'}
              {filters.sort === 'price-desc' && 'Giá giảm dần'}
              {filters.sort === 'rating' && 'Đánh giá cao'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.resultCount}>
          {filteredProducts.length} sản phẩm
        </Text>
      </View>
    );
  };

  const renderFiltersModal = () => (
    <Modal visible={showFilters} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Bộ Lọc</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color={COLORS.dark} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Category Filter */}
            <Text style={styles.filterLabel}>Danh mục</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[styles.filterChip, !filters.category && styles.filterChipActive]}
                onPress={() => setFilters({ ...filters, category: '' })}
              >
                <Text style={[styles.filterChipText, !filters.category && styles.filterChipTextActive]}>
                  Tất cả
                </Text>
              </TouchableOpacity>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat._id}
                  style={[styles.filterChip, filters.category === cat._id && styles.filterChipActive]}
                  onPress={() => setFilters({ ...filters, category: cat._id })}
                >
                  <Text style={[styles.filterChipText, filters.category === cat._id && styles.filterChipTextActive]}>
                    {cat.ten}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Brand Filter */}
            <Text style={styles.filterLabel}>Thương hiệu</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[styles.filterChip, !filters.brand && styles.filterChipActive]}
                onPress={() => setFilters({ ...filters, brand: '' })}
              >
                <Text style={[styles.filterChipText, !filters.brand && styles.filterChipTextActive]}>
                  Tất cả
                </Text>
              </TouchableOpacity>
              {brands.map(brand => (
                <TouchableOpacity
                  key={brand}
                  style={[styles.filterChip, filters.brand === brand && styles.filterChipActive]}
                  onPress={() => setFilters({ ...filters, brand })}
                >
                  <Text style={[styles.filterChipText, filters.brand === brand && styles.filterChipTextActive]}>
                    {brand}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Price Range */}
            <Text style={styles.filterLabel}>Khoảng giá</Text>
            <View style={styles.priceRangeContainer}>
              <View style={styles.priceInputContainer}>
                <Text style={styles.priceLabel}>Từ</Text>
                <TextInput
                  style={styles.priceInput}
                  value={filters.minPrice.toString()}
                  onChangeText={(text) => setFilters({ ...filters, minPrice: parseInt(text) || 0 })}
                  keyboardType="numeric"
                />
              </View>
              <Text style={styles.priceSeparator}>-</Text>
              <View style={styles.priceInputContainer}>
                <Text style={styles.priceLabel}>Đến</Text>
                <TextInput
                  style={styles.priceInput}
                  value={filters.maxPrice.toString()}
                  onChangeText={(text) => setFilters({ ...filters, maxPrice: parseInt(text) || 10000000 })}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
              <Text style={styles.resetButtonText}>Đặt lại</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderFiltersModal()}
      <FlatList
        data={filteredProducts}
        renderItem={({ item }) => (
          <ProductCard
            id={item._id}
            ten={item.ten}
            gia={item.gia}
            giaKhuyenMai={item.giaKhuyenMai}
            hinhAnh={item.hinhAnh[0] || 'https://via.placeholder.com/400'}
            danhGiaTrungBinh={item.danhGiaTrungBinh}
            daBan={item.daBan}
            soLuongTonKho={item.soLuongTonKho}
            onPress={() => navigation.navigate('ProductDetail', { id: item._id })}
          />
        )}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
  },
  header: {
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  currentFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  currentFilterLabel: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    marginBottom: SIZES.margin,
    gap: 8,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.gray[400],
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
  },
  filterButtonText: {
    color: COLORS.primary,
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  sortButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
  },
  sortButtonText: {
    color: COLORS.primary,
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  resultCount: {
    fontSize: SIZES.small,
    color: COLORS.gray[600],
  },
  listContent: {
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
  },
  row: {
    justifyContent: 'space-between',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  modalTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  modalBody: {
    padding: SIZES.padding,
  },
  filterLabel: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 12,
    marginTop: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.white,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: SIZES.small,
    color: COLORS.gray[600],
  },
  filterChipTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInputContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: SIZES.small,
    color: COLORS.gray[600],
    marginBottom: 6,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: SIZES.body,
    color: COLORS.dark,
  },
  priceSeparator: {
    fontSize: SIZES.body,
    color: COLORS.gray[600],
    marginTop: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.dark,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default ProductsScreen;
