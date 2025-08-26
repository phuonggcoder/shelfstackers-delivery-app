import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { useAuth } from '../lib/auth';
import ShipperRatingService from '../lib/shipperRatingService';

interface RatingStats {
  total_ratings: number;
  avg_rating: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  delivered_orders: number;
}

interface ShipperRatingStatsProps {
  shipperId: string;
  showDetails?: boolean;
  onViewAllRatings?: () => void;
}

export default function ShipperRatingStats({ 
  shipperId, 
  showDetails = true, 
  onViewAllRatings 
}: ShipperRatingStatsProps) {
  const { token } = useAuth();
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔑 ShipperRatingStats - Token from useAuth:', token);
    console.log('🔑 ShipperRatingStats - ShipperId:', shipperId);
    fetchRatingStats();
  }, [shipperId, token]);

  const fetchRatingStats = async () => {
    try {
      console.log('🔍 fetchRatingStats - Starting...');
      setLoading(true);
      setError(null);
      
      const data = await ShipperRatingService.getShipperRating(shipperId, token);
      console.log('🔍 fetchRatingStats - Received data:', data);
      console.log('🔍 fetchRatingStats - Stats:', data.stats);
      
      setStats(data.stats);
    } catch (err) {
      console.error('🔍 fetchRatingStats - Error:', err);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Ionicons key={i} name="star" size={16} color="#FFD700" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Ionicons key={i} name="star-half" size={16} color="#FFD700" />
        );
      } else {
        stars.push(
          <Ionicons key={i} name="star-outline" size={16} color="#C0C0C0" />
        );
      }
    }
    return stars;
  };

  const renderRatingDistribution = () => {
    if (!stats?.rating_distribution) return null;

    const total = stats.total_ratings;
    if (total === 0) return null;

    return (
      <View style={styles.distributionContainer}>
        <Text style={styles.distributionTitle}>Phân bố đánh giá:</Text>
        {[5, 4, 3, 2, 1].map((star) => (
          <View key={star} style={styles.distributionRow}>
            <Text style={styles.starLabel}>{star} ⭐</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${(stats.rating_distribution[star as keyof typeof stats.rating_distribution] / total) * 100}%` 
                  }
                ]} 
              />
            </View>
            <Text style={styles.countLabel}>
              {stats.rating_distribution[star as keyof typeof stats.rating_distribution]}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang tải thống kê...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={24} color="#FF6B6B" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchRatingStats}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!stats) {
    console.log('🔍 ShipperRatingStats - No stats available');
    return (
      <View style={styles.noDataContainer}>
        <Ionicons name="star-outline" size={48} color="#C0C0C0" />
        <Text style={styles.noDataText}>Chưa có đánh giá nào</Text>
      </View>
    );
  }

  console.log('🔍 ShipperRatingStats - Stats loaded:', stats);
  console.log('🔍 ShipperRatingStats - Avg rating:', stats.avg_rating);
  console.log('🔍 ShipperRatingStats - Total ratings:', stats.total_ratings);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Thống Kê Đánh Giá</Text>
        {onViewAllRatings && (
          <TouchableOpacity style={styles.viewAllButton} onPress={onViewAllRatings}>
            <Text style={styles.viewAllButtonText}>Xem tất cả</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Main Stats */}
      <View style={styles.mainStats}>
        <View style={styles.statCard}>
          <View style={styles.ratingDisplay}>
            <Text style={styles.ratingNumber}>{stats.avg_rating.toFixed(1)}</Text>
            <View style={styles.starsContainer}>
              {renderStars(stats.avg_rating)}
            </View>
          </View>
          <Text style={styles.ratingLabel}>Điểm trung bình</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total_ratings}</Text>
            <Text style={styles.statLabel}>Đánh giá</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.delivered_orders}</Text>
            <Text style={styles.statLabel}>Đơn đã giao</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {stats.delivered_orders > 0 
                ? Math.round((stats.total_ratings / stats.delivered_orders) * 100)
                : 0
              }%
            </Text>
            <Text style={styles.statLabel}>Tỷ lệ đánh giá</Text>
          </View>
        </View>
      </View>

      {/* Rating Distribution */}
      {showDetails && renderRatingDistribution()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewAllButtonText: {
    fontSize: 14,
    color: Colors.primary,
    marginRight: 4,
  },
  mainStats: {
    marginBottom: 16,
  },
  statCard: {
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingDisplay: {
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  ratingLabel: {
    fontSize: 14,
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  distributionContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
  },
  distributionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starLabel: {
    width: 40,
    fontSize: 14,
    color: '#666',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginHorizontal: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  countLabel: {
    width: 30,
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
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
    backgroundColor: Colors.primary,
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
});
