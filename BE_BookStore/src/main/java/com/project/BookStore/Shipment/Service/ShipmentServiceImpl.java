package com.project.BookStore.Shipment.Service;

import com.project.BookStore.Common.Enum.ErrorCode;
import com.project.BookStore.Common.Exception.AppException;
import com.project.BookStore.Common.Response.PageResponse;
import com.project.BookStore.Order.Entity.Order;
import com.project.BookStore.Order.Enum.OrderStatus;
import com.project.BookStore.Order.Repository.OrderRepository;
import com.project.BookStore.Shipment.DTO.Request.ShipmentRequest;
import com.project.BookStore.Shipment.DTO.Request.ShipmentStatusRequest;
import com.project.BookStore.Shipment.DTO.Response.ShipmentResponse;
import com.project.BookStore.Shipment.Entity.Shipment;
import com.project.BookStore.Shipment.Enum.ShipmentStatus;
import com.project.BookStore.Shipment.Mapper.ShipmentMapper;
import com.project.BookStore.Shipment.Repository.ShipmentRepository;
import com.project.BookStore.Auth.Security.UserContextService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ShipmentServiceImpl implements ShipmentService {

    ShipmentRepository shipmentRepository;
    OrderRepository orderRepository;
    ShipmentMapper shipmentMapper;
    UserContextService userContextService;

    @Override
    @Transactional
    public ShipmentResponse createShipment(ShipmentRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        if(order.getStatus() != OrderStatus.CONFIRMED ){
            throw new AppException(ErrorCode.ORDER_NOT_READY_FOR_SHIPPING);
        }
        if (shipmentRepository.findByOrderId(request.getOrderId()).isPresent()) {
            throw new AppException(ErrorCode.SHIPMENT_ALREADY_EXISTS);
        }

        Shipment shipment = shipmentMapper.toEntity(request);
        shipment.setOrder(order);
        shipment.setStatus(ShipmentStatus.READY_TO_PICK);

        return shipmentMapper.toResponse(shipmentRepository.save(shipment));
    }

    @Override
    @Transactional
    public ShipmentResponse updateShipment(Long id, ShipmentRequest request) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SHIPMENT_NOT_FOUND));

        shipmentMapper.updateEntity(shipment, request);
        return shipmentMapper.toResponse(shipmentRepository.save(shipment));
    }

    @Override
    @Transactional
    public ShipmentResponse updateStatus(Long id, ShipmentStatusRequest request) {

        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SHIPMENT_NOT_FOUND));


        ShipmentStatus newStatus = request.getStatus();
        validateTransition(shipment.getStatus(), newStatus);

        shipment.setStatus(newStatus);

        if (newStatus == ShipmentStatus.DELIVERING) {
            shipment.setShippedAt(LocalDateTime.now());
        } else if (newStatus == ShipmentStatus.DELIVERED) {
            shipment.setDeliveredAt(LocalDateTime.now());
        }

        Order order = shipment.getOrder();

        switch (newStatus) {

            case READY_TO_PICK -> order.setStatus(OrderStatus.CONFIRMED);

            case PICKING -> order.setStatus(OrderStatus.PACKING);

            case DELIVERING -> order.setStatus(OrderStatus.SHIPPED);

            case DELIVERED -> order.setStatus(OrderStatus.DELIVERED);

            case FAILED -> order.setStatus(OrderStatus.CONFIRMED);

            case RETURNED -> order.setStatus(OrderStatus.REFUNDED);
        }

        shipmentRepository.save(shipment);

        return shipmentMapper.toResponse(shipment);
    }

    @Override
    public ShipmentResponse getShipmentById(Long id) {
        return shipmentRepository.findById(id)
                .map(shipmentMapper::toResponse)
                .orElseThrow(() -> new AppException(ErrorCode.SHIPMENT_NOT_FOUND));
    }

    @Override
    @PostAuthorize("returnObject.order.user.id == authentication.principal.claims['id']")
    public ShipmentResponse getShipmentByOrderId(Long orderId) {
        return shipmentRepository.findByOrderId(orderId)
                .map(shipmentMapper::toResponse)
                .orElseThrow(() -> new AppException(ErrorCode.SHIPMENT_NOT_FOUND));
    }

    @Override
    public PageResponse<ShipmentResponse> getAllShipments(int page, int size, String status) {
        int pageNo = page > 0 ? page - 1 : 0;
        Pageable pageable = PageRequest.of(pageNo, size);

        Page<Shipment> shipmentPage = shipmentRepository.findAll(pageable);

        List<ShipmentResponse> data = shipmentPage.getContent().stream()
                .filter(s -> status == null || s.getStatus().name().equalsIgnoreCase(status))
                .map(shipmentMapper::toResponse)
                .collect(Collectors.toList());

        return PageResponse.<ShipmentResponse>builder()
                .data(data)
                .page(page)
                .size(size)
                .total(shipmentPage.getTotalElements())
                .totalPages(shipmentPage.getTotalPages())
                .build();
    }

    @Override
    public List<ShipmentResponse> getMyShipments() {
        Long userId = userContextService.getCurrentUserId();
        if (userId == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return shipmentRepository.findByOrder_UserId(userId).stream()
                .map(shipmentMapper::toResponse)
                .collect(Collectors.toList());
    }

    private void validateTransition(
            ShipmentStatus current,
            ShipmentStatus next
    ) {

        if (current == next) {
            throw new AppException(ErrorCode.INVALID_STATUS_TRANSITION);
        }

        switch (current) {

            case READY_TO_PICK -> {
                if (next != ShipmentStatus.PICKING) {
                    throw new AppException(ErrorCode.INVALID_STATUS_TRANSITION);
                }
            }

            case PICKING -> {
                if (next != ShipmentStatus.DELIVERING
                        && next != ShipmentStatus.FAILED) {
                    throw new AppException(ErrorCode.INVALID_STATUS_TRANSITION);
                }
            }

            case DELIVERING -> {
                if (next != ShipmentStatus.DELIVERED
                        && next != ShipmentStatus.FAILED
                        && next != ShipmentStatus.RETURNED) {
                    throw new AppException(ErrorCode.INVALID_STATUS_TRANSITION);
                }
            }

            case DELIVERED, RETURNED -> {
                throw new AppException(ErrorCode.SHIPMENT_FINAL_STATE);
            }

            case FAILED -> {
                if (next != ShipmentStatus.READY_TO_PICK) {
                    throw new AppException(ErrorCode.INVALID_STATUS_TRANSITION);
                }
            }
        }
    }
}
