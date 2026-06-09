package com.project.BookStore.Book.Service;

import com.project.BookStore.Author.Entity.Author;
import com.project.BookStore.Author.Repository.AuthorRepository;
import com.project.BookStore.Book.DTO.Request.BookCreateRequest;
import com.project.BookStore.Book.DTO.Request.BookFilterRequest;
import com.project.BookStore.Book.DTO.Request.BookUpdateRequest;
import com.project.BookStore.Book.DTO.Request.SalePriceRequest;
import com.project.BookStore.Book.DTO.Response.BookDetailResponse;
import com.project.BookStore.Book.DTO.Response.BookListResponse;
import com.project.BookStore.Book.Entity.Book;
import com.project.BookStore.Book.Entity.BookAuthor;
import com.project.BookStore.Book.Entity.BookImage;
import com.project.BookStore.Book.Helpers.SlugUtils;
import com.project.BookStore.Book.Mapper.BookMapper;
import com.project.BookStore.Book.Repository.BookAuthorRepository;
import com.project.BookStore.Book.Repository.BookImageRepository;
import com.project.BookStore.Book.Repository.BookRepository;
import com.project.BookStore.Catetory.Entity.Category;
import com.project.BookStore.Catetory.Repository.CategoryRepository;
import com.project.BookStore.Common.Enum.ErrorCode;
import com.project.BookStore.Common.Exception.AppException;
import com.project.BookStore.Common.Response.PageResponse;
import com.project.BookStore.Common.Service.Cloudinary.CloudinaryService;
import com.project.BookStore.Publisher.Entity.Publisher;
import com.project.BookStore.Publisher.Repository.PublisherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookServiceImpl implements BookService {

    private final BookRepository bookRepository;
    private final BookAuthorRepository bookAuthorRepository;
    private final BookImageRepository bookImageRepository;
    private final AuthorRepository authorRepository;
    // private final InventoryLogRepository inventoryLogRepository;
    private final CloudinaryService cloudinaryService;
    private final BookMapper bookMapper;
    private final CategoryRepository categoryRepository;
    private final PublisherRepository publisherRepository;

    // QUERY & HIỂN THỊ

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BookListResponse> getList(
            BookFilterRequest filter,
            Pageable pageable) {
        Page<Book> page = bookRepository.findAllWithFilter(filter, pageable);

        List<BookListResponse> data = page.getContent()
                .stream()
                .map(bookMapper::toListResponse)
                .toList();

        return PageResponse.<BookListResponse>builder()
                .data(data)
                .page(page.getNumber() + 1)
                .size(page.getSize())
                .total(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public BookDetailResponse getDetail(String slug) {
        Book book = bookRepository.findBySlugWithDetails(slug)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
        return bookMapper.toDetailResponse(book);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BookListResponse> search(String keyword, Pageable pageable) {
        int pageNumber = pageable.getPageNumber() - 1;
        Page<Book> page = bookRepository.searchByKeyword(keyword, pageable);
        List<BookListResponse> data = page.getContent().stream()
                .map(bookMapper::toListResponse)
                .toList();

        return PageResponse.<BookListResponse>builder()
                .data(data)
                .page(page.getNumber() + 1)
                .size(page.getSize())
                .total(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookListResponse> getRelated(Long bookId, int limit) {

        Book book = findActiveBookById(bookId);
        int size = (limit <= 0) ? 8 : Math.min(limit, 12);
        Pageable pageable = PageRequest.of(0, size);
        return bookRepository
                .findRelated(book.getCategory().getId(), bookId, pageable)
                .stream()
                .map(bookMapper::toListResponse)
                .toList();
    }
//     @Override
//     @Transactional(readOnly = true)
//     public List<BookListResponse> getBestsellers(int limit) {
//     return bookRepository.findBestsellers(limit)
//     .stream()
//     .map(bookMapper::toListResponse)
//     .toList();
//     }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BookListResponse> getOnSale(Pageable pageable) {

        LocalDateTime now = LocalDateTime.now();

        Page<Book> page = bookRepository.findOnSale(now, pageable);

        List<BookListResponse> data = page.getContent()
                .stream()
                .map(bookMapper::toListResponse)
                .toList();

        return PageResponse.<BookListResponse>builder()
                .data(data)
                .page(page.getNumber() + 1) // convert 0-based -> 1-based
                .size(page.getSize())
                .total(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    @Override
    public PageResponse<BookListResponse> getBooksByCategorySlug(String slug, Pageable pageable) {
        Category root = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUNT));

        List<Long> ids = categoryRepository
                .findByPathStartingWith(root.getPath())
                .stream()
                .map(Category::getId)
                .toList();

        Page<Book> page = bookRepository.findPublicBooksByCategoryIds(ids, pageable);

        List<BookListResponse> data = page.getContent()
                .stream()
                .map(bookMapper::toListResponse)
                .toList();

        return PageResponse.<BookListResponse>builder()
                .data(data)
                .page(page.getNumber() + 1)
                .size(page.getSize())
                .total(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    // TÍNH GIÁ

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getEffectivePrice(Long bookId) {
        Book book = findActiveBookById(bookId);
        LocalDateTime now = LocalDateTime.now();

        boolean isOnSale = book.getSalePrice() != null &&
                book.getSaleFrom() != null &&
                book.getSaleTo() != null &&
                !now.isBefore(book.getSaleFrom()) &&
                !now.isAfter(book.getSaleTo());

        return isOnSale ? book.getSalePrice() : book.getPrice();
    }

    @Override
    @Transactional(readOnly = true)
    public Integer getDiscountPercent(Long bookId) {
        Book book = findActiveBookById(bookId);

        BigDecimal effectivePrice = getEffectivePrice(bookId);
        BigDecimal originalPrice = book.getPrice();

        if (effectivePrice == null || originalPrice == null)
            return null;
        if (originalPrice.compareTo(BigDecimal.ZERO) == 0)
            return null;

        if (effectivePrice.compareTo(originalPrice) == 0)
            return null;

        BigDecimal discount = BigDecimal.ONE
                .subtract(effectivePrice.divide(originalPrice, 4, RoundingMode.HALF_UP))
                .multiply(BigDecimal.valueOf(100));

        return discount.setScale(0, RoundingMode.HALF_UP).intValue();
    }

    // CRUD ADMIN

    @Override
    @Transactional
    public BookDetailResponse create(BookCreateRequest request) {
        if (request.getIsbn() != null &&
                bookRepository.existsByIsbnAndDeletedAtIsNull(request.getIsbn())) {
            throw new AppException(ErrorCode.ISBN_ALREADY_EXISTS);
        }

        Book book = bookMapper.toEntity(request);
        book.setSlug(generateUniqueSlug(request.getTitle()));
        book.setCategory(categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUNT)));
        book.setPublisher(publisherRepository.findById(request.getPublisherId())
                .orElseThrow(() -> new AppException(ErrorCode.PUBLISHER_NOT_FOUND)));

        // Lưu URL ảnh từ frontend đã upload lên Cloudinary
        if (request.getCoverImage() != null && !request.getCoverImage().isBlank()) {
            book.setCoverImage(request.getCoverImage());
        }

        if (request.getAuthors() != null && !request.getAuthors().isEmpty()) {
            Set<BookAuthor> bookAuthors = request.getAuthors().stream().map(authReq -> {
                Author author = authorRepository.findById(authReq.getAuthorId())
                        .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND));

                BookAuthor ba = new BookAuthor();

                BookAuthor.BookAuthorId baId = new BookAuthor.BookAuthorId();
                baId.setAuthorId(author.getId());
                ba.setId(baId);
                ba.setBook(book);
                ba.setAuthor(author);
                ba.setRole(authReq.getRole());

                return ba;
            }).collect(Collectors.toSet());

            book.setBookAuthors(bookAuthors);
        }
        bookRepository.save(book);
        Book savedBook = bookRepository.findByIdWithDetails(book.getId()).orElse(book);
        return bookMapper.toDetailResponse(savedBook);
    }

    @Override
    @Transactional
    public BookDetailResponse update(Long id, BookUpdateRequest request) {
        Book book = findActiveBookById(id);
        bookMapper.updateEntity(book, request);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUNT));
            book.setCategory(category);
        }

        if (request.getPublisherId() != null) {
            Publisher publisher = publisherRepository.findById(request.getPublisherId())
                    .orElseThrow(() -> new AppException(ErrorCode.PUBLISHER_NOT_FOUND));
            book.setPublisher(publisher);
        }

        // URL ảnh đã được upload từ FE, chỉ cần lưu URL mới nếu có thay đổi
        if (request.getCoverImage() != null && !request.getCoverImage().isBlank()) {
            book.setCoverImage(request.getCoverImage());
        }

        if (request.getAuthors() != null) {
            book.getBookAuthors().clear();
            Set<BookAuthor> bookAuthors = request.getAuthors().stream().map(authReq -> {
                com.project.BookStore.Author.Entity.Author author = authorRepository.findById(authReq.getAuthorId())
                        .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND));

                BookAuthor ba = new BookAuthor();
                BookAuthor.BookAuthorId baId = new BookAuthor.BookAuthorId();
                baId.setAuthorId(author.getId());
                baId.setBookId(book.getId());
                ba.setId(baId);
                ba.setBook(book);
                ba.setAuthor(author);
                ba.setRole(authReq.getRole() != null ? authReq.getRole() : "author");
                return ba;
            }).collect(Collectors.toSet());
            book.getBookAuthors().addAll(bookAuthors);
        }

        bookRepository.save(book);
        Book updatedBook = bookRepository.findByIdWithDetails(id).orElse(book);
        return bookMapper.toDetailResponse(updatedBook);
    }

    @Override
    @Transactional
    public void delete(Long id, Long deletedBy) {
        Book book = findActiveBookById(id);
        book.setDeletedAt(LocalDateTime.now());
        bookRepository.save(book);
    }

    @Override
    @Transactional
    public void restore(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
        book.setDeletedAt(null);
        book.setIsActive(true);
        bookRepository.save(book);
    }

    @Override
    @Transactional
    public void setSalePrice(Long id, SalePriceRequest request) {
        Book book = findActiveBookById(id);

        BigDecimal salePrice = request.getSalePrice();
        BigDecimal price = book.getPrice();

        if (salePrice == null || price == null) {
            throw new IllegalArgumentException("Price cannot be null");
        }

        // salePrice < price
        if (salePrice.compareTo(price) >= 0) {
            throw new IllegalArgumentException("Sale price must be lower than the original price");
        }

        if (request.getSaleFrom() == null || request.getSaleTo() == null) {
            throw new IllegalArgumentException("Date and time are required");
        }

        if (request.getSaleFrom().isAfter(request.getSaleTo())) {
            throw new IllegalArgumentException("Start date must be before end date");
        }

        book.setSalePrice(salePrice);
        book.setSaleFrom(request.getSaleFrom());
        book.setSaleTo(request.getSaleTo());
    }

    @Override
    @Transactional
    public void removeSalePrice(Long id) {
        Book book = findActiveBookById(id);
        book.setSalePrice(null);
        book.setSaleFrom(null);
        book.setSaleTo(null);
        bookRepository.save(book);
    }

    @Override
    @Transactional
    public void addAuthor(Long bookId, Long authorId, String role) {
        Book book = findActiveBookById(bookId);
        Author author = authorRepository.findById(authorId)
                .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND));
        if (bookAuthorRepository.existsByBookIdAndAuthorId(bookId, authorId)) {
            throw new AppException(ErrorCode.BOOK_AUTHOR_ALREADY_EXISTS);
        }

        BookAuthor bookAuthor = new BookAuthor();
        bookAuthor.setBook(book);
        bookAuthor.setAuthor(author);
        bookAuthor.setRole(role);
        bookAuthorRepository.save(bookAuthor);
    }

    @Override
    @Transactional
    public void removeAuthor(Long bookId, Long authorId) {
        BookAuthor bookAuthor = bookAuthorRepository
                .findByBookIdAndAuthorId(bookId, authorId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_AUTHOR_NOT_FOUND));
        bookAuthorRepository.delete(bookAuthor);
    }

    private Book findActiveBookById(Long id) {
        return bookRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
    }

    private String generateUniqueSlug(String title) {
        String baseSlug = SlugUtils.toSlug(title);
        String slug = baseSlug;
        int count = 1;
        while (bookRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + count++;
        }
        return slug;
    }

    @Override
    @Transactional
    public void activate(Long id) {

        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        book.setIsActive(true);

        bookRepository.save(book);
    }

    @Override
    @Transactional
    public void deactivate(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
        book.setIsActive(false);
        bookRepository.save(book);
    }
    // private void saveInventoryLog(Book book, int changeQty, String type,
    // Long referenceId, String note, Long createdBy) {
    // InventoryLog log = new InventoryLog();
    // log.setBook(book);
    // log.setChangeQty(changeQty);
    // log.setType(type);
    // log.setReferenceId(referenceId);
    // log.setNote(note);
    // log.setCreatedBy(createdBy);
    // inventoryLogRepository.save(log);
    // }
    // TỒN KHO

    // @Override
    // @Transactional(readOnly = true)
    // public void checkStock(Long bookId, int quantity) {
    // Book book = findActiveBookById(bookId);
    // if (book.getStockQuantity() < quantity) {
    // throw new InsufficientStockException(
    // "Sách '" + book.getTitle() + "' chỉ còn " + book.getStockQuantity() + "
    // quyển"
    // );
    // }
    // }
    //
    // @Override
    // @Transactional
    // public void decreaseStock(Long bookId, int quantity, Long orderId) {
    // // Dùng pessimistic lock để tránh 2 người cùng mua quyển cuối
    // Book book = bookRepository.findByIdWithLock(bookId)
    // .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
    //
    // if (book.getStockQuantity() < quantity) {
    // throw new InsufficientStockException(
    // "Sách '" + book.getTitle() + "' chỉ còn " + book.getStockQuantity() + "
    // quyển"
    // );
    // }
    //
    // book.setStockQuantity(book.getStockQuantity() - quantity);
    // bookRepository.save(book);
    //
    // // Ghi log biến động kho
    // saveInventoryLog(book, -quantity, "sale", orderId, null, null);
    // }
    //
    // @Override
    // @Transactional
    // public void increaseStock(Long bookId, int quantity, String type,
    // Long referenceId, String note, Long createdBy) {
    // Book book = findActiveBookById(bookId);
    // book.setStockQuantity(book.getStockQuantity() + quantity);
    // bookRepository.save(book);
    //
    // saveInventoryLog(book, quantity, type, referenceId, note, createdBy);
    // }
    //
    // @Override
    // @Transactional(readOnly = true)
    // public List<BookListResponse> getLowStock() {
    // return bookRepository.findLowStock()
    // .stream()
    // .map(bookMapper::toListResponse)
    // .toList();
    // }

}
