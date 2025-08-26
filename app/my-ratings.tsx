import { Colors } from '@/constants/Colors';
import { useAuth } from '@/lib/auth';
import ShipperRatingService from '@/lib/shipperRatingService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface RatingItem {
  _id: string;
  rating: number;
  selected_prompts: string[];
  comment: string;
  is_anonymous: boolean;
  created_at: string;
  order_id: {
    order_id: string;
    order_date: string;
    total_amount: number;
  };
  user_id: {
    full_name: string;
    phone: string;
    email: string;
  };
}

interface RatingStats {
  total_ratings: number;
  avg_rating: number;
  total_orders: number;
  delivered_orders: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export default function MyRatings() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { t, i18n } = useTranslation();
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    console.log('🔑 MyRatings - User object:', user);
    console.log('🔑 MyRatings - User token:', user?.token);
    console.log('🔑 MyRatings - User roles:', user?.roles);
    console.log('🔑 MyRatings - Token from useAuth:', token);
    
    if (user && user.roles && user.roles.includes('shipper')) {
      fetchRatings();
      fetchStats();
    }
  }, [user, token]);

  const fetchRatings = async (pageNum = 1, isRefresh = false) => {
    try {
      console.log('🔑 fetchRatings - Token being passed:', token);
      console.log('🔑 fetchRatings - Token length:', token ? token.length : 0);
      
      if (isRefresh) {
        setRefreshing(true);
        setPage(1);
      } else {
        setLoading(true);
      }

      const data = await ShipperRatingService.getMyRatings(pageNum, 10, token);
      
      if (pageNum === 1 || isRefresh) {
        setRatings(data.ratings);
      } else {
        setRatings(prev => [...prev, ...data.ratings]);
      }
      
      setHasMore(data.pagination.page < data.pagination.pages);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Sử dụng cùng method với Profile để đồng bộ data
      const data = await ShipperRatingService.getShipperRating(user?.id || user?._id, token);
      // Thêm fallback cho rating_distribution nếu không có
      const statsWithFallback = {
        ...data.stats,
        total_orders: data.stats.delivered_orders || 0, // Map delivered_orders to total_orders
        rating_distribution: data.stats.rating_distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
      setStats(statsWithFallback);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleRefresh = () => {
    fetchRatings(1, true);
    fetchStats();
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchRatings(page + 1);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons 
          key={i} 
          name={i <= rating ? "star" : "star-outline"} 
          size={16} 
          color={i <= rating ? "#FFD700" : "#C0C0C0"} 
        />
      );
    }
    return stars;
  };

  const renderPrompts = (prompts: string[]) => {
    if (!prompts || prompts.length === 0) return null;

    return (
      <View style={styles.promptsContainer}>
        {prompts.map((prompt, index) => (
          <View key={index} style={styles.promptTag}>
            <Text style={styles.promptText}>{prompt}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderRatingItem = ({ item }: { item: RatingItem }) => (
    <View style={styles.ratingItem}>
      {/* Header */}
      <View style={styles.ratingHeader}>
        <View style={styles.ratingInfo}>
          <View style={styles.starsRow}>
            {renderStars(item.rating)}
            <Text style={styles.ratingNumber}>{item.rating}</Text>
          </View>
          <Text style={styles.ratingDate}>
            {new Date(item.created_at).toLocaleDateString('vi-VN')}
          </Text>
        </View>
        {item.is_anonymous && (
          <View style={styles.anonymousBadge}>
            <Ionicons name="eye-off" size={12} color="#666" />
            <Text style={styles.anonymousText}>Ẩn danh</Text>
          </View>
        )}
      </View>

      {/* Prompts */}
      {renderPrompts(item.selected_prompts)}

      {/* Comment */}
      {item.comment && (
        <View style={styles.commentContainer}>
          <Text style={styles.commentText}>{item.comment}</Text>
        </View>
      )}

      {/* User Info */}
      <View style={styles.userInfo}>
        <Ionicons name="person" size={16} color="#666" />
        <Text style={styles.userName}>
          {item.is_anonymous ? 'Khách hàng ẩn danh' : item.user_id.full_name}
        </Text>
      </View>

      {/* Order Info */}
      <View style={styles.orderInfo}>
        <View style={styles.orderDetail}>
          <Ionicons name="receipt" size={16} color="#666" />
          <Text style={styles.orderId}>Đơn hàng: {item.order_id.order_id}</Text>
        </View>
        <View style={styles.orderDetail}>
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={styles.orderDate}>
            {new Date(item.order_id.order_date).toLocaleDateString('vi-VN')}
          </Text>
        </View>
        <View style={styles.orderDetail}>
          <Ionicons name="cash" size={16} color="#666" />
          <Text style={styles.orderAmount}>
            {item.order_id.total_amount.toLocaleString('vi-VN')} VNĐ
          </Text>
        </View>
      </View>
    </View>
  );

  if (!user || !user.roles || !user.roles.includes('shipper')) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('profile.ratingStatistics')}</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF6B6B" />
          <Text style={styles.errorText}>{t('errors.unauthorized')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
              <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('profile.ratingStatistics')}</Text>
          <View style={styles.placeholder} />
        </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Thống kê đánh giá chi tiết */}
        {stats && (
          <View style={styles.ratingStatsCard}>
            {/* Header thống kê đánh giá */}
            <View style={styles.statsHeader}>
              <Text style={styles.statsTitle}>{t('profile.ratingStatistics')}</Text>
            </View>

            {/* Thống kê chính */}
            <View style={styles.mainStats}>
              {/* Điểm trung bình */}
              <View style={styles.avgRatingSection}>
                <Text style={styles.avgRatingNumber}>{stats.avg_rating.toFixed(1)}</Text>
                <View style={styles.starRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= Math.floor(stats.avg_rating) ? "star" : 
                            star === Math.ceil(stats.avg_rating) && stats.avg_rating % 1 > 0 ? "star-half" : "star-outline"}
                      size={20}
                      color="#FFD700"
                    />
                  ))}
                </View>
                <Text style={styles.avgRatingLabel}>{t('profile.averageRating')}</Text>
              </View>

              {/* KPIs */}
              <View style={styles.kpiRow}>
                <View style={styles.kpiItem}>
                  <Text style={styles.kpiNumber}>{stats.total_ratings}</Text>
                  <Text style={styles.kpiLabel}>{t('profile.totalRatings')}</Text>
                </View>
                <View style={styles.kpiItem}>
                  <Text style={styles.kpiNumber}>{stats.delivered_orders}</Text>
                  <Text style={styles.kpiLabel}>{t('profile.deliveredOrders')}</Text>
                </View>
                <View style={styles.kpiItem}>
                  <Text style={styles.kpiNumber}>{Math.round((stats.total_ratings / stats.delivered_orders) * 100)}%</Text>
                  <Text style={styles.kpiLabel}>{t('profile.ratingPercentage')}</Text>
                </View>
              </View>
            </View>

            {/* Phân bố đánh giá */}
            <View style={styles.ratingDistribution}>
              <Text style={styles.distributionTitle}>{t('profile.ratingDistribution')}:</Text>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.rating_distribution?.[star as keyof typeof stats.rating_distribution] || 0;
                const percentage = stats.total_ratings > 0 ? (count / stats.total_ratings) * 100 : 0;
                
                return (
                  <View key={star} style={styles.distributionRow}>
                    <Text style={styles.starNumberText}>{star}</Text>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <View style={styles.progressBarContainer}>
                      <View 
                        style={[
                          styles.progressBar, 
                          { width: `${percentage}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.distributionCount}>{count}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}


      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  statIconContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 30,
  },
  statContent: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 11,
    color: '#4A90E2',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 13,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  ratingItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ratingInfo: {
    flex: 1,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  ratingDate: {
    fontSize: 12,
    color: '#666',
  },
  anonymousBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  anonymousText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 4,
  },
  promptsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  promptTag: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  promptText: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  commentContainer: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 14,
    color: '#333',
    marginLeft: 6,
  },
  orderInfo: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  orderDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  orderAmount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 32,
  },
  noDataText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  loadMoreContainer: {
    alignItems: 'center',
    padding: 16,
  },
  loadMoreText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  // Styles mới cho thống kê đánh giá
  ratingStatsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewAllButtonText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
  mainStats: {
    marginBottom: 20,
  },
  avgRatingSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avgRatingNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 8,
  },
  starRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  avgRatingLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  kpiItem: {
    alignItems: 'center',
    flex: 1,
  },
  kpiNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  ratingDistribution: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 20,
  },
  distributionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  distributionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    minWidth: 20,
    textAlign: 'right',
  },
  starNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
    minWidth: 15,
    textAlign: 'center',
  },
});
