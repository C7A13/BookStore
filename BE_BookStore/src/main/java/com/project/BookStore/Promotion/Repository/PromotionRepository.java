package com.project.BookStore.Promotion.Repository;

import com.project.BookStore.Promotion.Entity.Promotion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    Optional<Promotion> findByCodeAndDeletedAtIsNull(String code);
    Optional<Promotion> findByIdAndDeletedAtIsNull(Long id);
    Page<Promotion> findAllByDeletedAtIsNull(Pageable pageable);

    @Query("SELECT p FROM Promotion p WHERE p.deletedAt IS NULL " +
           "AND p.isActive = true " +
           "AND (p.validFrom IS NULL OR p.validFrom <= :now) " +
           "AND (p.validTo IS NULL OR p.validTo >= :now)")
    List<Promotion> findActivePromotions(@Param("now") LocalDateTime now);
    
    @Query("SELECT p FROM Promotion p WHERE p.code IN :codes AND p.deletedAt IS NULL")
    List<Promotion> findByCodesAndDeletedAtIsNull(@Param("codes") List<String> codes);

    @Modifying
    @Query("UPDATE Promotion p SET p.usedCount = p.usedCount + 1 " +
           "WHERE p.id = :id AND (p.usageLimit IS NULL OR p.usedCount < p.usageLimit)")
    int incrementUsedCountIfAvailable(@Param("id") Long id);
    
    @Modifying
    @Query("UPDATE Promotion p SET p.usedCount = p.usedCount - 1 " +
           "WHERE p.id = :id AND p.usedCount > 0")
    int decrementUsedCount(@Param("id") Long id);
}
