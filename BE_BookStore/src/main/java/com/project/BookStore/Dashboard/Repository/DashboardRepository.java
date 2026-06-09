package com.project.BookStore.Dashboard.Repository;

import com.project.BookStore.Order.Enum.OrderStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public class DashboardRepository {

    @PersistenceContext
    private EntityManager entityManager;

    public Long countTotalBooks() {
        return entityManager.createQuery("""
                SELECT COUNT(b)
                FROM Book b
                WHERE b.deletedAt IS NULL
                """, Long.class).getSingleResult();
    }

    public Long countActiveBooks() {
        return entityManager.createQuery("""
                SELECT COUNT(b)
                FROM Book b
                WHERE b.deletedAt IS NULL AND b.isActive = true
                """, Long.class).getSingleResult();
    }

    public Long countTotalOrders() {
        return entityManager.createQuery("SELECT COUNT(o) FROM Order o", Long.class)
                .getSingleResult();
    }

    public Long countTotalUsers() {
        return entityManager.createQuery("SELECT COUNT(u) FROM User u", Long.class)
                .getSingleResult();
    }

    public BigDecimal sumDeliveredRevenue() {
        return entityManager.createQuery("""
                SELECT SUM(o.totalAmount)
                FROM Order o
                WHERE o.status = :status
                """, BigDecimal.class)
                .setParameter("status", OrderStatus.DELIVERED)
                .getSingleResult();
    }

    public List<Object[]> countBooksByMonth(int year) {
        return entityManager.createQuery("""
                SELECT MONTH(b.createdAt), COUNT(b)
                FROM Book b
                WHERE b.deletedAt IS NULL AND YEAR(b.createdAt) = :year
                GROUP BY MONTH(b.createdAt)
                """, Object[].class)
                .setParameter("year", year)
                .getResultList();
    }

    public List<Object[]> countOrdersByMonth(int year) {
        return entityManager.createQuery("""
                SELECT MONTH(o.createdAt), COUNT(o)
                FROM Order o
                WHERE YEAR(o.createdAt) = :year
                GROUP BY MONTH(o.createdAt)
                """, Object[].class)
                .setParameter("year", year)
                .getResultList();
    }

    public List<Object[]> sumDeliveredRevenueByMonth(int year) {
        return entityManager.createQuery("""
                SELECT MONTH(o.createdAt), SUM(o.totalAmount)
                FROM Order o
                WHERE o.status = :status AND YEAR(o.createdAt) = :year
                GROUP BY MONTH(o.createdAt)
                """, Object[].class)
                .setParameter("status", OrderStatus.DELIVERED)
                .setParameter("year", year)
                .getResultList();
    }

    public List<Object[]> countOrdersByStatus() {
        return entityManager.createQuery("""
                SELECT o.status, COUNT(o)
                FROM Order o
                GROUP BY o.status
                """, Object[].class).getResultList();
    }

    public List<Object[]> findTopSellingBooks(int limit) {
        return entityManager.createQuery("""
                SELECT b.id, b.title, SUM(oi.quantity)
                FROM OrderItem oi
                JOIN oi.order o
                JOIN oi.book b
                WHERE o.status = :status AND b.deletedAt IS NULL
                GROUP BY b.id, b.title
                ORDER BY SUM(oi.quantity) DESC
                """, Object[].class)
                .setParameter("status", OrderStatus.DELIVERED)
                .setMaxResults(limit)
                .getResultList();
    }

    public String findFirstAuthorName(Long bookId) {
        List<String> authors = entityManager.createQuery("""
                SELECT a.fullName
                FROM BookAuthor ba
                JOIN ba.author a
                WHERE ba.book.id = :bookId
                ORDER BY a.fullName ASC
                """, String.class)
                .setParameter("bookId", bookId)
                .setMaxResults(1)
                .getResultList();
        return authors.isEmpty() ? null : authors.get(0);
    }

    public List<Object[]> findLowStockBooks(int limit) {
        return entityManager.createQuery("""
                SELECT b.title, b.stockQuantity
                FROM Book b
                WHERE b.deletedAt IS NULL
                  AND b.isActive = true
                  AND b.stockQuantity <= b.reorderPoint
                ORDER BY b.stockQuantity ASC, b.title ASC
                """, Object[].class)
                .setMaxResults(limit)
                .getResultList();
    }

    public List<Object[]> findHotCategories(int limit) {
        return entityManager.createQuery("""
                SELECT c.name, SUM(oi.quantity)
                FROM OrderItem oi
                JOIN oi.order o
                JOIN oi.book b
                JOIN b.category c
                WHERE b.deletedAt IS NULL
                  AND c.deletedAt IS NULL
                  AND o.status = :status
                GROUP BY c.id, c.name
                ORDER BY SUM(oi.quantity) DESC, c.name ASC
                """, Object[].class)
                .setParameter("status", OrderStatus.DELIVERED)
                .setMaxResults(limit)
                .getResultList();
    }
}
