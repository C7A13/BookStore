package com.project.BookStore.Shipment.Repository;

import com.project.BookStore.Shipment.Entity.Shipment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    @Query("SELECT s FROM Shipment s JOIN FETCH s.order WHERE s.id = :id")
    Optional<Shipment> findById(@Param("id") Long id);

    @Query("SELECT s FROM Shipment s JOIN FETCH s.order WHERE s.order.id = :orderId")
    Optional<Shipment> findByOrderId(@Param("orderId") Long orderId);

    @Query(value = "SELECT s FROM Shipment s JOIN FETCH s.order",
            countQuery = "SELECT count(s) FROM Shipment s")
    Page<Shipment> findAll(Pageable pageable);

    @Query("SELECT s FROM Shipment s JOIN FETCH s.order o WHERE o.user.id = :userId")
    List<Shipment> findByOrder_UserId(@Param("userId") Long userId);
}
