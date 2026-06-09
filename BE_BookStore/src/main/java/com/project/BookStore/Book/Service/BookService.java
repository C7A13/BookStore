package com.project.BookStore.Book.Service;

import com.project.BookStore.Book.DTO.Request.BookCreateRequest;
import com.project.BookStore.Book.DTO.Request.BookFilterRequest;
import com.project.BookStore.Book.DTO.Request.BookUpdateRequest;
import com.project.BookStore.Book.DTO.Request.SalePriceRequest;
import com.project.BookStore.Book.DTO.Response.BookDetailResponse;
import com.project.BookStore.Book.DTO.Response.BookListResponse;
import com.project.BookStore.Common.Response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface BookService {

    PageResponse<BookListResponse> getList(BookFilterRequest filter, Pageable pageable);

    BookDetailResponse getDetail(String slug);

    PageResponse<BookListResponse> search(String keyword, Pageable pageable);

    List<BookListResponse> getRelated(Long bookId, int limit);

//     List<BookListResponse> getBestsellers(int limit);

    PageResponse<BookListResponse> getOnSale(Pageable pageable);

    PageResponse<BookListResponse> getBooksByCategorySlug(
            String slug,
            Pageable pageable);

    BigDecimal getEffectivePrice(Long bookId);

    Integer getDiscountPercent(Long bookId);

    // CRUD ADMIN (staff / manager)

    BookDetailResponse create(BookCreateRequest request);

    BookDetailResponse update(Long id, BookUpdateRequest request);

    void delete(Long id, Long deletedBy);

    void restore(Long id);

    void setSalePrice(Long id, SalePriceRequest request);

    void removeSalePrice(Long id);


    void addAuthor(Long bookId, Long authorId, String role);

    void removeAuthor(Long bookId, Long authorId);

    void activate(Long id);

    void deactivate(Long id);

    // // TỒN KHO
    //
    // //Kiểm tra còn đủ hàng không
    // void checkStock(Long bookId, int quantity);
    //
    // /**
    // * Trừ stock khi đặt đơn — bắt buộc chạy trong transaction
    // * Ghi log vào inventory_logs
    // */
    // void decreaseStock(Long bookId, int quantity, Long orderId);
    //
    // //Cộng stock khi nhập hàng hoặc hoàn trả
    // void increaseStock(Long bookId, int quantity, String type, Long referenceId,
    // String note, Long createdBy);
    //
    // //Lấy danh sách sách sắp hết hàng (stock <= reorder_point)
    // List<BookListResponse> getLowStock();
}
