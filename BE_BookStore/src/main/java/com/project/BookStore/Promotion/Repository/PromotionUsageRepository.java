package com.project.BookStore.Promotion.Repository;

import com.project.BookStore.Promotion.Entity.PromotionUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PromotionUsageRepository extends JpaRepository<PromotionUsage, Long> {
    
    @Query("SELECT COUNT(pu) FROM PromotionUsage pu WHERE pu.promotion.id = :promotionId AND pu.user.id = :userId AND pu.isCancelled = false")
    int countByPromotionIdAndUserId(@Param("promotionId") Long promotionId, @Param("userId") Long userId);
    
    @Query("""
        SELECT pu.promotion.id, COUNT(pu) 
        FROM PromotionUsage pu 
        WHERE pu.user.id = :userId 
          AND pu.promotion.id IN :promotionIds 
          AND pu.isCancelled = false 
        GROUP BY pu.promotion.id
    """)
    List<Object[]> countByUserIdAndPromotionIdsIn(@Param("userId") Long userId, @Param("promotionIds") List<Long> promotionIds);

    List<PromotionUsage> findByOrderId(Long orderId);
}
