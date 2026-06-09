package com.project.BookStore.Author.Service;

import com.project.BookStore.Address.DTO.Response.AddressResponse;
import com.project.BookStore.Author.DTO.Request.AuthorRequest;
import com.project.BookStore.Author.DTO.Response.AuthorResponse;
import com.project.BookStore.Author.Entity.Author;
import com.project.BookStore.Author.Mapper.AuthorMapper;
import com.project.BookStore.Author.Repository.AuthorRepository;
import com.project.BookStore.Common.Enum.ErrorCode;
import com.project.BookStore.Common.Exception.AppException;
import com.project.BookStore.Common.Response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthorServiceImpl implements AuthorService {

    private final AuthorRepository authorRepository;
    private final AuthorMapper authorMapper;

    // CREATE
    @Override
    public AuthorResponse create(AuthorRequest request) {

        String slug = generateSlug(request);

        if (authorRepository.existsBySlug(slug)) {
            throw new AppException(ErrorCode.AUTHOR_ALREADY_EXISTS);
        }

        Author author = authorMapper.toEntity(request);
        author.setSlug(slug);

        return authorMapper.toResponse(authorRepository.save(author));
    }

    @Override
    public AuthorResponse update(Long id, AuthorRequest request) {

        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND));

        String slug = generateSlug(request);

        if (authorRepository.existsBySlugAndIdNot(slug, id)) {
            throw new AppException(ErrorCode.AUTHOR_ALREADY_EXISTS);
        }

        authorMapper.updateAuthor(author, request);
        author.setSlug(slug);

        return authorMapper.toResponse(authorRepository.save(author));
    }

    @Override
    public void delete(Long id) {

        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND));

        author.setDeletedAt(LocalDateTime.now());
        authorRepository.save(author);
    }

    @Override
    public void restore(Long id) {

        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND));

        author.setDeletedAt(null);
        authorRepository.save(author);
    }

    @Override
    public PageResponse<AuthorResponse> getAll(Boolean deleted , Pageable pageable) {
        Page<AuthorResponse> page;
        if (deleted == null) {
           page= authorRepository.findAll(pageable)
                   .map(authorMapper::toResponse);
        } else if (deleted) {
            page = authorRepository.findByDeletedAtIsNotNull(pageable)
                    .map(authorMapper::toResponse);
        } else {
            page = authorRepository.findByDeletedAtIsNull(pageable)
                    .map(authorMapper::toResponse);
        }

        int pageNumber = pageable.getPageNumber() - 1;
        pageNumber = Math.max(pageNumber, 0);
        return PageResponse.<AuthorResponse>builder()
                .data(page.getContent())
                .page(page.getNumber() + 1)
                .size(page.getSize())
                .total(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    @Override
    public AuthorResponse getById(Long id) {

        Author author = authorRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new AppException(ErrorCode.AUTHOR_NOT_FOUND));

        return authorMapper.toResponse(author);
    }


    private String generateSlug(AuthorRequest request) {

        String normalized = Normalizer.normalize(request.getFullName(), Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");

        String base = normalized.toLowerCase()
                .replaceAll("đ", "d") //
                .replaceAll("[^a-z0-9\\s]", "")
                .trim()
                .replaceAll("\\s+", "-");

        String slug = base;
        int count = 1;

        while (authorRepository.existsBySlug(slug)) {
            slug = base + "-" + count++;
        }
        String birthYearStr = request.getBirthYear().toString();
        return slug + "-" + birthYearStr;
    }
}
