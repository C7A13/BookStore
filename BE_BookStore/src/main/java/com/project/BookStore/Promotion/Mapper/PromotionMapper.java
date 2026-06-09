package com.project.BookStore.Promotion.Mapper;

import com.project.BookStore.Promotion.DTO.Request.PromotionRequest;
import com.project.BookStore.Promotion.DTO.Response.PromotionResponse;
import com.project.BookStore.Promotion.Entity.Promotion;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PromotionMapper {
    Promotion toEntity(PromotionRequest request);
    PromotionResponse toResponse(Promotion entity);
    void updateEntityFromRequest(PromotionRequest request, @MappingTarget Promotion entity);
}
