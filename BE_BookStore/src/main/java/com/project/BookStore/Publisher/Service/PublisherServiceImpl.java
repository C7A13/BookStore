package com.project.BookStore.Publisher.Service;

import com.project.BookStore.Common.Enum.ErrorCode;
import com.project.BookStore.Common.Exception.AppException;
import com.project.BookStore.Publisher.DTO.Request.PublisherRequest;
import com.project.BookStore.Publisher.DTO.Response.PublisherResponse;
import com.project.BookStore.Publisher.Entity.Publisher;
import com.project.BookStore.Publisher.Mapper.PublisherMapper;
import com.project.BookStore.Publisher.Repository.PublisherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PublisherServiceImpl implements PublisherService {

    private final PublisherRepository publisherRepository;
    private final PublisherMapper publisherMapper;

    // ================= CREATE =================
    @Override
    public PublisherResponse create(PublisherRequest request) {

        Publisher publisher = publisherMapper.toEntity(request);

        publisherRepository.save(publisher);

        return publisherMapper.toResponse(publisher);
    }

    // ================= UPDATE =================
    @Override
    public PublisherResponse update(Long id, PublisherRequest request) {

        Publisher publisher = publisherRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new AppException(ErrorCode.PUBLISHER_NOT_FOUND));

        publisherMapper.updatePublisher(publisher, request);

        publisherRepository.save(publisher);

        return publisherMapper.toResponse(publisher);
    }

    // ================= DELETE (Soft) =================
    @Override
    public void delete(Long id) {

        Publisher publisher = publisherRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new AppException(ErrorCode.PUBLISHER_NOT_FOUND));

        publisher.setDeletedAt(LocalDateTime.now());

        publisherRepository.save(publisher);
    }

    // ================= RESTORE =================
    @Override
    public void restore(Long id) {

        Publisher publisher = publisherRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PUBLISHER_NOT_FOUND));

        publisher.setDeletedAt(null);

        publisherRepository.save(publisher);
    }

    // ================= TOGGLE ACTIVE =================
    @Override
    public void toggleActive(Long id) {

        Publisher publisher = publisherRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new AppException(ErrorCode.PUBLISHER_NOT_FOUND));

        publisher.setIsActive(!publisher.getIsActive());

        publisherRepository.save(publisher);
    }

    // ================= GET ALL =================
    @Override
    public List<PublisherResponse> getAll(Boolean deleted) {
        if (deleted == null) {
            return publisherMapper.toResponseList(publisherRepository.findAll());
        }
        if (deleted) {
            return publisherMapper.toResponseList(publisherRepository.findByDeletedAtIsNotNull());
        }
        return publisherMapper.toResponseList(publisherRepository.findByDeletedAtIsNull());
    }

    // ================= GET BY ID =================
    @Override
    public PublisherResponse getById(Long id) {

        Publisher publisher = publisherRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new AppException(ErrorCode.PUBLISHER_NOT_FOUND));

        return publisherMapper.toResponse(publisher);
    }

    // ================= GET ACTIVE (Public) =================
    @Override
    public List<PublisherResponse> getActivePublishers() {
        return publisherMapper.toResponseList(publisherRepository.findByDeletedAtIsNullAndIsActiveTrue());
    }
}
