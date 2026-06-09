package com.project.BookStore.Publisher.Mapper;

import com.project.BookStore.Publisher.DTO.Request.PublisherRequest;
import com.project.BookStore.Publisher.DTO.Response.PublisherResponse;
import com.project.BookStore.Publisher.Entity.Publisher;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PublisherMapper {

    // ================= ENTITY -> RESPONSE =================
    @Mapping(target = "isDeleted", expression = "java(publisher.getDeletedAt() != null)")
    PublisherResponse toResponse(Publisher publisher);

    List<PublisherResponse> toResponseList(List<Publisher> publishers);


    Publisher toEntity(PublisherRequest request);

    // ================= REQUEST -> ENTITY (UPDATE) =================
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updatePublisher(@MappingTarget Publisher publisher, PublisherRequest request);
}
