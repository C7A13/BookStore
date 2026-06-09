package com.project.BookStore.Comment.Service;

import com.project.BookStore.Auth.Utils.SecurityUtil;
import com.project.BookStore.Book.Entity.Book;
import com.project.BookStore.Book.Repository.BookRepository;
import com.project.BookStore.Common.Enum.ErrorCode;
import com.project.BookStore.Common.Exception.AppException;
import com.project.BookStore.Common.Response.PageResponse;
import com.project.BookStore.Comment.DTO.Request.CommentCreateRequest;
import com.project.BookStore.Comment.DTO.Request.CommentUpdateRequest;
import com.project.BookStore.Comment.DTO.Response.CommentResponse;
import com.project.BookStore.Comment.Entity.Comment;
import com.project.BookStore.Comment.Mapper.CommentMapper;
import com.project.BookStore.Comment.Repository.CommentRepository;
import com.project.BookStore.User.Entity.User;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CommentServiceImpl implements CommentService {

    CommentRepository commentRepository;
    BookRepository bookRepository;
    CommentMapper commentMapper;
    SecurityUtil securityUtil;

    // ========== Public / User ==========

    @Override
    @Transactional
    public CommentResponse create(CommentCreateRequest request) {
        User currentUser = securityUtil.getCurrentUser();

        // 1. Kiểm tra book tồn tại
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        // 2. Kiểm tra parent comment nếu có
        Comment parent = null;
        if (request.getParentId() != null) {
            parent = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new AppException(ErrorCode.PARENT_COMMENT_NOT_FOUND));

            // Đảm bảo comment cha thuộc cùng một sách
            if (!parent.getBook().getId().equals(book.getId())) {
                throw new AppException(ErrorCode.PARENT_COMMENT_DIFFERENT_BOOK);
            }

            // Đảm bảo cấu trúc tối đa 2 tầng (nếu comment cha cũng là một reply, thì gán parent gốc là parent của reply đó)
            if (parent.getParent() != null) {
                parent = parent.getParent();
            }
        }

        // 3. Tạo bình luận mới
        Comment comment = Comment.builder()
                .book(book)
                .user(currentUser)
                .parent(parent)
                .body(request.getBody())
                .isVisible(true)
                .build();

        comment = commentRepository.save(comment);

        return commentMapper.toResponse(comment);
    }

    @Override
    @Transactional
    public CommentResponse update(Long id, CommentUpdateRequest request) {
        User currentUser = securityUtil.getCurrentUser();

        Comment comment = commentRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_FOUND));

        // Chỉ owner mới được sửa
        if (!comment.getUser().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.COMMENT_NOT_OWNER);
        }

        commentMapper.updateEntity(comment, request);
        comment = commentRepository.save(comment);

        return commentMapper.toResponse(comment);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        User currentUser = securityUtil.getCurrentUser();

        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_FOUND));

        // Owner hoặc Admin/Manager mới được quyền xóa
        boolean isAdminOrManager = currentUser.getRoles().stream()
                .anyMatch(role -> role.getName().equalsIgnoreCase("admin") || role.getName().equalsIgnoreCase("manager"));

        if (!comment.getUser().getId().equals(currentUser.getId()) && !isAdminOrManager) {
            throw new AppException(ErrorCode.COMMENT_NOT_OWNER);
        }

        commentRepository.delete(comment);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CommentResponse> getByBook(Long bookId, Pageable pageable) {
        // Kiểm tra book tồn tại
        if (!bookRepository.existsById(bookId)) {
            throw new AppException(ErrorCode.BOOK_NOT_FOUND);
        }

        // Lấy danh sách comment gốc (parent IS NULL) hiển thị công khai (đã fetch join user và book)
        Page<Comment> page = commentRepository.findByBookIdAndParentIsNullAndIsVisibleTrue(bookId, pageable);

        List<Comment> parentComments = page.getContent();
        List<Long> parentIds = parentComments.stream().map(Comment::getId).toList();

        // Bulk-fetch toàn bộ replies kèm theo user/book chi tiết trong 1 câu SQL
        Map<Long, List<Comment>> repliesMap = new HashMap<>();
        if (!parentIds.isEmpty()) {
            List<Comment> allReplies = commentRepository.findRepliesByParentIds(parentIds);
            repliesMap = allReplies.stream()
                    .filter(Comment::getIsVisible) // Chỉ lấy các reply hiển thị
                    .collect(Collectors.groupingBy(c -> c.getParent().getId()));
        }

        final Map<Long, List<Comment>> finalRepliesMap = repliesMap;
        List<CommentResponse> commentResponses = parentComments.stream()
                .map(comment -> {
                    CommentResponse response = commentMapper.toResponse(comment);
                    List<Comment> replies = finalRepliesMap.getOrDefault(comment.getId(), List.of());
                    List<CommentResponse> replyResponses = replies.stream()
                            .map(commentMapper::toResponse)
                            .toList();
                    response.setReplies(replyResponses);
                    return response;
                })
                .toList();

        return PageResponse.<CommentResponse>builder()
                .data(commentResponses)
                .page(page.getNumber())
                .size(page.getSize())
                .total(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    // ========== Admin ==========

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CommentResponse> adminGetByBook(Long bookId, Pageable pageable) {
        if (!bookRepository.existsById(bookId)) {
            throw new AppException(ErrorCode.BOOK_NOT_FOUND);
        }

        // Lấy danh sách comment gốc (parent IS NULL) cho admin (gồm cả comment bị ẩn, đã fetch join user và book)
        Page<Comment> page = commentRepository.findByBookIdAndParentIsNull(bookId, pageable);

        List<Comment> parentComments = page.getContent();
        List<Long> parentIds = parentComments.stream().map(Comment::getId).toList();

        // Bulk-fetch toàn bộ replies kèm theo user/book cho admin (gồm cả các reply bị ẩn)
        Map<Long, List<Comment>> repliesMap = new HashMap<>();
        if (!parentIds.isEmpty()) {
            List<Comment> allReplies = commentRepository.findRepliesByParentIds(parentIds);
            repliesMap = allReplies.stream()
                    .collect(Collectors.groupingBy(c -> c.getParent().getId()));
        }

        final Map<Long, List<Comment>> finalRepliesMap = repliesMap;
        List<CommentResponse> commentResponses = parentComments.stream()
                .map(comment -> {
                    CommentResponse response = commentMapper.toResponse(comment);
                    List<Comment> replies = finalRepliesMap.getOrDefault(comment.getId(), List.of());
                    List<CommentResponse> replyResponses = replies.stream()
                            .map(commentMapper::toResponse)
                            .toList();
                    response.setReplies(replyResponses);
                    return response;
                })
                .toList();

        return PageResponse.<CommentResponse>builder()
                .data(commentResponses)
                .page(page.getNumber())
                .size(page.getSize())
                .total(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    @Override
    @Transactional
    public void toggleVisibility(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_FOUND));

        comment.setIsVisible(!comment.getIsVisible());
        commentRepository.save(comment);
    }
}
