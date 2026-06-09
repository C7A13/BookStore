package com.project.BookStore.Book.Repository;

import com.project.BookStore.Book.DTO.Request.BookFilterRequest;
import com.project.BookStore.Book.Entity.Book;
import jakarta.persistence.*;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class BookRepositoryCustomImpl implements BookRepositoryCustom {

    private final EntityManager em;

    @Override
    public Page<Book> findAllWithFilter(BookFilterRequest filter, Pageable pageable) {
        CriteriaBuilder cb = em.getCriteriaBuilder();

        CriteriaQuery<Book> query = cb.createQuery(Book.class);
        Root<Book> root = query.from(Book.class);
        root.fetch("category",  JoinType.LEFT);
        root.fetch("publisher", JoinType.LEFT);

        List<Predicate> predicates = buildPredicates(cb, root, filter);
        query.where(predicates.toArray(new Predicate[0]));
        Sort.Order priceOrder = pageable.getSort().getOrderFor("price");
        Sort.Order titleOrder = pageable.getSort().getOrderFor("title");
        if (priceOrder != null) {
            Expression<BigDecimal> effectivePrice =
                    cb.coalesce(root.get("salePrice"), root.get("price"));
            query.orderBy(
                    priceOrder.isAscending()
                            ? cb.asc(effectivePrice)
                            : cb.desc(effectivePrice)
            );
        } else if (titleOrder != null) {
            query.orderBy(
                    titleOrder.isAscending()
                            ? cb.asc(root.get("title"))
                            : cb.desc(root.get("title"))
            );
        } else {
            query.orderBy(cb.desc(root.get("createdAt")));
        }

        List<Book> books = em.createQuery(query)
                .setFirstResult((int) pageable.getOffset())
                .setMaxResults(pageable.getPageSize())
                .getResultList();

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<Book> countRoot = countQuery.from(Book.class);
        List<Predicate> countPredicates = buildPredicates(cb, countRoot, filter);
        countQuery.select(cb.count(countRoot)).where(countPredicates.toArray(new Predicate[0]));
        Long total = em.createQuery(countQuery).getSingleResult();

        return new PageImpl<>(books, pageable, total);
    }

    private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<Book> root, BookFilterRequest f) {
        List<Predicate> predicates = new ArrayList<>();

        predicates.add(cb.isNull(root.get("deletedAt")));

        if (Boolean.TRUE.equals(f.getIncludeInactive())) {
            if (f.getIsActive() != null) {
                predicates.add(cb.equal(root.get("isActive"), f.getIsActive()));
            }
        } else {
            predicates.add(cb.isTrue(root.get("isActive")));
        }

        if (f.getKeyword() != null && !f.getKeyword().isBlank()) {
            String lkw = "%" + f.getKeyword().toLowerCase() + "%";
            predicates.add(cb.or(
                cb.like(cb.lower(root.get("title")), lkw),
                cb.like(root.get("isbn"), lkw)
            ));
        }

        if (f.getCategoryId() != null) {
            com.project.BookStore.Catetory.Entity.Category selectedCategory =
                    em.find(com.project.BookStore.Catetory.Entity.Category.class, f.getCategoryId());
            if (selectedCategory != null && selectedCategory.getPath() != null) {
                predicates.add(cb.like(root.get("category").get("path"), selectedCategory.getPath() + "%"));
            } else {
                predicates.add(cb.equal(root.get("category").get("id"), f.getCategoryId()));
            }
        }
        if (f.getPublisherId() != null) {
            predicates.add(cb.equal(root.get("publisher").get("id"), f.getPublisherId()));
        }
        if (f.getAuthorId() != null) {
            Join<Book, com.project.BookStore.Book.Entity.BookAuthor> bookAuthorsJoin = root.join("bookAuthors", JoinType.INNER);
            predicates.add(cb.equal(bookAuthorsJoin.get("author").get("id"), f.getAuthorId()));
        }
        if (f.getMinPrice() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("price"), f.getMinPrice()));
        }
        if (f.getMaxPrice() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("price"), f.getMaxPrice()));
        }
        if (f.getLanguage() != null) {
            predicates.add(cb.equal(root.get("language"), f.getLanguage()));
        }
        if (Boolean.TRUE.equals(f.getOnSaleOnly())) {
            predicates.add(cb.isNotNull(root.get("salePrice")));
        }
        if (f.getInStockOnly() != null && f.getInStockOnly()) {
            predicates.add(cb.greaterThan(root.get("stockQuantity"), 0));
        }
        if (Boolean.TRUE.equals(f.getLowStockOnly())) {
            predicates.add(cb.lessThanOrEqualTo(root.get("stockQuantity"), root.get("reorderPoint")));
        }

        return predicates;
    }
}
