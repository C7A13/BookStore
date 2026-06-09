package com.project.BookStore.Inventory.Repository;

import com.project.BookStore.Inventory.Entity.InventoryLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryLogRepository extends JpaRepository<InventoryLog, Long> {

    @EntityGraph(attributePaths = {"book", "createdBy"})
    Page<InventoryLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @EntityGraph(attributePaths = {"book", "createdBy"})
    Page<InventoryLog> findByBookIdOrderByCreatedAtDesc(Long bookId, Pageable pageable);
}
