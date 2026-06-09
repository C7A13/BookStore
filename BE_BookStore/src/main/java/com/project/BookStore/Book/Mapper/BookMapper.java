package com.project.BookStore.Book.Mapper;


import com.project.BookStore.Book.DTO.Request.BookCreateRequest;
import com.project.BookStore.Book.DTO.Request.BookUpdateRequest;
import com.project.BookStore.Book.DTO.Response.BookDetailResponse;
import com.project.BookStore.Book.DTO.Response.BookListResponse;
import com.project.BookStore.Book.Entity.Book;
import com.project.BookStore.Book.Entity.BookAuthor;
import com.project.BookStore.Book.Entity.BookImage;
import com.project.BookStore.Catetory.Entity.Category;
import com.project.BookStore.Publisher.Entity.Publisher;
import org.mapstruct.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
builder = @Builder(disableBuilder = true)
)
public interface BookMapper {

    @Mapping(target = "effectivePrice", expression = "java(book.getEffectivePrice())")
    @Mapping(target = "isOnSale",       expression = "java(book.isOnSale())")
    @Mapping(target = "discountPercent",expression = "java(calcDiscountPercent(book))")
    @Mapping(target = "categoryName",   expression = "java(getCategoryName(book))")
    @Mapping(target = "authorName",     expression = "java(getAuthorNames(book))")
    @Mapping(target = "avgRating",      ignore = true)
    BookListResponse toListResponse(Book book);


    @Mapping(target = "category",       expression = "java(toCategoryInfo(book.getCategory()))")
    @Mapping(target = "publisher",      expression = "java(toPublisherInfo(book.getPublisher()))")
    @Mapping(target = "authors",        expression = "java(toAuthorInfoList(book.getBookAuthors()))")
    @Mapping(target = "images",         expression = "java(toImageInfoList(book.getImages()))")
    @Mapping(target = "effectivePrice", expression = "java(book.getEffectivePrice())")
    @Mapping(target = "isOnSale",       expression = "java(book.isOnSale())")
    @Mapping(target = "discountPercent",expression = "java(calcDiscountPercent(book))")
    @Mapping(target = "avgRating",      ignore = true)
    @Mapping(target = "reviewCount",    ignore = true)
    BookDetailResponse toDetailResponse(Book book);

    @Mapping(target = "category", ignore = true)
    @Mapping(target = "publisher", ignore = true)
    @Mapping(target = "bookAuthors", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "isActive", constant = "true")
    @Mapping(target = "slug", ignore = true)
    Book toEntity(BookCreateRequest request);




    @Mapping(target = "slug",        ignore = true)
    @Mapping(target = "category",    ignore = true)
    @Mapping(target = "publisher",   ignore = true)
    @Mapping(target = "images",      ignore = true)
    @Mapping(target = "bookAuthors", ignore = true)
    @Mapping(target = "salePrice",     ignore = true)
    @Mapping(target = "saleFrom",      ignore = true)
    @Mapping(target = "saleTo",        ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(@MappingTarget Book book, BookUpdateRequest request);



    default String getCategoryName(Book book) {
        return book.getCategory() != null ? book.getCategory().getName() : null;
    }

    default String getAuthorNames(Book book) {
        if (book.getBookAuthors() == null || book.getBookAuthors().isEmpty()) return null;
        return book.getBookAuthors().stream()
                .filter(ba -> "author".equals(ba.getRole()))
                .map(ba -> ba.getAuthor().getFullName())
                .collect(Collectors.joining(", "));
    }

    default Integer calcDiscountPercent(Book book) {
        if (!book.isOnSale() || book.getSalePrice() == null || book.getPrice() == null) {
            return null;
        }

        BigDecimal price = book.getPrice();
        BigDecimal salePrice = book.getSalePrice();

        if (price.compareTo(BigDecimal.ZERO) == 0) return null;

        BigDecimal discount = BigDecimal.ONE
                .subtract(salePrice.divide(price, 4, RoundingMode.HALF_UP))
                .multiply(BigDecimal.valueOf(100));

        return discount.setScale(0, RoundingMode.HALF_UP).intValue();
    }

    default BookDetailResponse.CategoryInfo toCategoryInfo(Category category) {
        if (category == null) return null;
        return BookDetailResponse.CategoryInfo.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .build();
    }

    default BookDetailResponse.PublisherInfo toPublisherInfo(Publisher publisher) {
        if (publisher == null) return null;
        return BookDetailResponse.PublisherInfo.builder()
                .id(publisher.getId())
                .name(publisher.getName())
                .build();
    }

    default List<BookDetailResponse.AuthorInfo> toAuthorInfoList(Collection<BookAuthor> bookAuthors) {
        if (bookAuthors == null) return List.of();
        return bookAuthors.stream()
                .map(ba -> BookDetailResponse.AuthorInfo.builder()
                        .id(ba.getAuthor().getId())
                        .fullName(ba.getAuthor().getFullName())
                        .slug(ba.getAuthor().getSlug())
                        .role(ba.getRole())
                        .build())
                .collect(Collectors.toList());
    }

    default List<BookDetailResponse.BookImageInfo> toImageInfoList(Collection<BookImage> images) {
        if (images == null) return List.of();
        return images.stream()
                .map(img -> BookDetailResponse.BookImageInfo.builder()
                        .id(img.getId())
                        .url(img.getUrl())
                        .altText(img.getAltText())
                        .sortOrder(img.getSortOrder())
                        .build())
                .collect(Collectors.toList());
    }
}

