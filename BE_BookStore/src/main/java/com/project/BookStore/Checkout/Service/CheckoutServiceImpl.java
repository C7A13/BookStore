package com.project.BookStore.Checkout.Service;

import com.project.BookStore.Address.Entity.Address;
import com.project.BookStore.Address.Repository.AddressRepository;
import com.project.BookStore.Auth.Security.UserContextService;
import com.project.BookStore.Book.Entity.Book;
import com.project.BookStore.Book.Repository.BookRepository;
import com.project.BookStore.Cart.Entity.Cart;
import com.project.BookStore.Cart.Entity.CartItem;
import com.project.BookStore.Cart.Repository.CartItemRepository;
import com.project.BookStore.Cart.Repository.CartRepository;
import com.project.BookStore.Checkout.DTO.Request.CheckoutRequest;
import com.project.BookStore.Checkout.DTO.Response.CheckoutPreviewResponse;
import com.project.BookStore.Common.Enum.ErrorCode;
import com.project.BookStore.Common.Exception.AppException;
import com.project.BookStore.Inventory.Service.InventoryService;
import com.project.BookStore.Order.DTO.Response.OrderResponse;
import com.project.BookStore.Order.Entity.Order;
import com.project.BookStore.Order.Entity.OrderItem;
import com.project.BookStore.Order.Enum.OrderStatus;
import com.project.BookStore.Order.Mapper.OrderMapper;
import com.project.BookStore.Order.Repository.OrderRepository;
import com.project.BookStore.Promotion.DTO.Response.PromotionCalculationResult;
import com.project.BookStore.Promotion.Entity.Promotion;
import com.project.BookStore.Promotion.Entity.PromotionUsage;
import com.project.BookStore.Promotion.Enum.PromotionType;
import com.project.BookStore.Promotion.Repository.PromotionRepository;
import com.project.BookStore.Promotion.Repository.PromotionUsageRepository;
import com.project.BookStore.Promotion.Service.PromotionService;
import com.project.BookStore.User.Entity.User;
import com.project.BookStore.User.Repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CheckoutServiceImpl implements CheckoutService {

    private static final BigDecimal DEFAULT_SHIPPING_FEE = BigDecimal.valueOf(30000);

    UserRepository userRepository;
    CartRepository cartRepository;
    CartItemRepository cartItemRepository;
    AddressRepository addressRepository;
    BookRepository bookRepository;
    OrderRepository orderRepository;
    PromotionService promotionService;
    PromotionRepository promotionRepository;
    PromotionUsageRepository promotionUsageRepository;
    UserContextService userContextService;
    OrderMapper orderMapper;
    InventoryService inventoryService;

    @Override
    @Transactional
    public OrderResponse checkout(CheckoutRequest request) {
        Long userId = userContextService.getRequiredUserId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Address address = getOwnedAddress(request.getAddressId(), userId);

        Order order = buildPendingOrder(request, user, address);
        BigDecimal subtotal;
        List<CartItem> selectedItems = null;

        if (request.getBuyNowItem() != null) {
            CheckoutRequest.BuyNowItem buyNowItem = request.getBuyNowItem();
            Book book = bookRepository.findById(buyNowItem.getBookId())
                    .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));
            subtotal = createOrderItemsFromBuyNow(order, book, buyNowItem.getQuantity());
        } else {
            if (request.getCartItemIds() == null || request.getCartItemIds().isEmpty()) {
                throw new AppException(ErrorCode.CART_ITEM_IS_EMPTY);
            }
            Cart cart = getCurrentUserCart(userId);
            selectedItems = getSelectedCartItems(cart, request.getCartItemIds());
            subtotal = createOrderItemsAndDecreaseStock(order, selectedItems);
        }
        order.setSubtotal(subtotal);

        PromotionCalculationResult promotionResult = applyPromotions(request, subtotal, order.getShippingFee(), userId);
        order.setDiscountAmount(promotionResult.getTotalDiscount());
        order.setTotalAmount(calculateTotal(subtotal, order.getShippingFee(), promotionResult.getTotalDiscount()));

        Order savedOrder = orderRepository.save(order);
        inventoryService.recordSale(savedOrder);
        savePromotionUsages(promotionResult.getAppliedPromotions(), user, savedOrder, subtotal, order.getShippingFee());

        if (selectedItems != null) {
            List<Long> selectedIds = selectedItems.stream().map(CartItem::getId).toList();
            cartItemRepository.deleteAllByIdIn(selectedIds);
        }

        return orderMapper.toResponse(savedOrder);
    }

    @Override
    public CheckoutPreviewResponse preview(CheckoutRequest request) {
        Long userId = userContextService.getRequiredUserId();

        // 1. Lấy danh sách địa chỉ của user
        List<Address> userAddresses = addressRepository.findByUserIdAndDeletedAtIsNull(userId);
        List<CheckoutPreviewResponse.AddressResponse> addressResponses = userAddresses.stream()
                .map(this::mapToAddressResponse)
                .toList();

        // 2. Lấy items tùy theo loại Checkout
        List<CheckoutPreviewResponse.CartItemResponse> cartItemResponses;
        BigDecimal subtotal;
        int totalQuantity;

        if (request.getBuyNowItem() != null) {
            CheckoutRequest.BuyNowItem buyNowItem = request.getBuyNowItem();
            Book book = bookRepository.findById(buyNowItem.getBookId())
                    .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

            BigDecimal effectivePrice = book.getEffectivePrice();
            BigDecimal lineTotal = effectivePrice.multiply(BigDecimal.valueOf(buyNowItem.getQuantity()));

            CheckoutPreviewResponse.CartItemResponse bookItemResponse = CheckoutPreviewResponse.CartItemResponse.builder()
                    .cartItemId(null)
                    .bookId(book.getId())
                    .title(book.getTitle())
                    .price(effectivePrice)
                    .quantity(buyNowItem.getQuantity())
                    .img(book.getCoverImage())
                    .lineTotal(lineTotal)
                    .build();

            cartItemResponses = List.of(bookItemResponse);
            subtotal = lineTotal;
            totalQuantity = buyNowItem.getQuantity();
        } else {
            if (request.getCartItemIds() == null || request.getCartItemIds().isEmpty()) {
                throw new AppException(ErrorCode.CART_ITEM_IS_EMPTY);
            }
            Cart cart = getCurrentUserCart(userId);
            List<CartItem> selectedItems = getSelectedCartItems(cart, request.getCartItemIds());
            cartItemResponses = selectedItems.stream()
                    .map(this::mapToCartItemResponse)
                    .toList();

            // 3. Tính subtotal và totalQuantity
            subtotal = selectedItems.stream()
                    .map(this::calculateCartItemSubtotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            totalQuantity = selectedItems.stream()
                    .mapToInt(CartItem::getQuantity)
                    .sum();
        }

        // 4. Lấy tất cả promotion đang active và kiểm tra điều kiện (Batch check N+1)
        List<Promotion> activePromotions = promotionRepository.findActivePromotions(LocalDateTime.now());
        
        java.util.Map<Long, Long> usageCounts = new java.util.HashMap<>();
        if (userId != null && !activePromotions.isEmpty()) {
            List<Long> promoIds = activePromotions.stream().map(Promotion::getId).toList();
            List<Object[]> counts = promotionUsageRepository.countByUserIdAndPromotionIdsIn(userId, promoIds);
            for (Object[] row : counts) {
                usageCounts.put((Long) row[0], (Long) row[1]);
            }
        }

        List<CheckoutPreviewResponse.PromotionUsageResponse> promotionResponses = activePromotions.stream()
                .map(promo -> mapToPromotionUsageResponse(promo, subtotal, userId, usageCounts))
                .toList();

        // 5. Tính toán giảm giá từ các mã promotion đã chọn (nếu có)
        BigDecimal shippingDiscount = BigDecimal.ZERO;
        BigDecimal orderDiscount = BigDecimal.ZERO;
        String appliedDiscountCode = null;
        String appliedShippingCode = null;

        if (request.getPromotionCodes() != null && !request.getPromotionCodes().isEmpty()) {
            PromotionCalculationResult promotionResult = previewPromotions(request, subtotal, DEFAULT_SHIPPING_FEE, userId);

            for (Promotion promo : promotionResult.getAppliedPromotions()) {
                BigDecimal discount = promo.calculateDiscount(subtotal, DEFAULT_SHIPPING_FEE);
                if (promo.getType() == PromotionType.FREE_SHIPPING) {
                    shippingDiscount = shippingDiscount.add(discount);
                    appliedShippingCode = promo.getCode();
                } else {
                    orderDiscount = orderDiscount.add(discount);
                    appliedDiscountCode = promo.getCode();
                }
            }
        }

        BigDecimal totalDiscount = shippingDiscount.add(orderDiscount);
        BigDecimal totalAmount = calculateTotal(subtotal, DEFAULT_SHIPPING_FEE, totalDiscount);

        // 6. Build CalculationResponse
        CheckoutPreviewResponse.CalculationResponse calculation = CheckoutPreviewResponse.CalculationResponse.builder()
                .totalQuantity(totalQuantity)
                .subtotal(subtotal)
                .shippingFee(DEFAULT_SHIPPING_FEE)
                .shippingDiscount(shippingDiscount)
                .orderDiscount(orderDiscount)
                .totalAmount(totalAmount)
                .appliedDiscountCode(appliedDiscountCode)
                .appliedShippingCode(appliedShippingCode)
                .build();

        // 7. Build response chính
        return CheckoutPreviewResponse.builder()
                .addresses(addressResponses)
                .cartItems(cartItemResponses)
                .availablePromotions(promotionResponses)
                .calculation(calculation)
                .build();
    }



    private CheckoutPreviewResponse.AddressResponse mapToAddressResponse(Address address) {
        return CheckoutPreviewResponse.AddressResponse.builder()
                .id(address.getId())
                .recipientName(address.getRecipientName())
                .recipientPhone(address.getRecipientPhone())
                .province(address.getProvince())
                .ward(address.getWard())
                .detailAddress(address.getDetailAddress())
                .isDefault(Boolean.TRUE.equals(address.getIsDefault()))
                .build();
    }

    private CheckoutPreviewResponse.CartItemResponse mapToCartItemResponse(CartItem cartItem) {
        Book book = cartItem.getBook();
        BigDecimal effectivePrice = book.getEffectivePrice();
        BigDecimal lineTotal = effectivePrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));

        return CheckoutPreviewResponse.CartItemResponse.builder()
                .cartItemId(cartItem.getId())
                .bookId(book.getId())
                .title(book.getTitle())
                .price(effectivePrice)
                .quantity(cartItem.getQuantity())
                .img(book.getCoverImage())
                .lineTotal(lineTotal)
                .build();
    }

    private CheckoutPreviewResponse.PromotionUsageResponse mapToPromotionUsageResponse(
            Promotion promotion, BigDecimal subtotal, Long userId, java.util.Map<Long, Long> usageCounts) {

        boolean isEligible = true;
        String reason = null;


        if (promotion.getMinOrderValue().compareTo(subtotal) > 0) {
            isEligible = false;
            reason = "Đơn hàng chưa đạt giá trị tối thiểu " + promotion.getMinOrderValue() + "đ";
        }

        if (isEligible && userId != null) {
            long usedByUser = usageCounts.getOrDefault(promotion.getId(), 0L);
            if (usedByUser >= promotion.getUsagePerCustomer()) {
                isEligible = false;
                reason = "Bạn đã sử dụng hết lượt dùng mã này";
            }
        }

        if (isEligible && promotion.getUsageLimit() != null
                && promotion.getUsedCount() >= promotion.getUsageLimit()) {
            isEligible = false;
            reason = "Mã giảm giá đã hết lượt sử dụng";
        }

        return CheckoutPreviewResponse.PromotionUsageResponse.builder()
                .id(promotion.getId())
                .code(promotion.getCode())
                .description(promotion.getName())
                .type(promotion.getType().name())
                .isEligible(isEligible)
                .reason(reason)
                .build();
    }


    private Cart getCurrentUserCart(Long userId) {
        Cart cart = cartRepository.findByUserIdWithItems(userId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));

        if (cart.getCartItems().isEmpty()) {
            throw new AppException(ErrorCode.CART_ITEM_IS_EMPTY);
        }

        return cart;
    }

    private Address getOwnedAddress(Long addressId, Long userId) {
        Address address = addressRepository.findByIdAndDeletedAtIsNull(addressId)
                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUNT));

        if (!address.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        return address;
    }

    private List<CartItem> getSelectedCartItems(Cart cart, List<Long> cartItemIds) {
        Set<Long> requestedIds = new LinkedHashSet<>(cartItemIds);
        List<CartItem> selectedItems = cart.getCartItems().stream()
                .filter(item -> requestedIds.contains(item.getId()))
                .toList();

        if (selectedItems.isEmpty() || selectedItems.size() != requestedIds.size()) {
            throw new AppException(ErrorCode.CART_ITEM_NOT_FOUND);
        }

        return selectedItems;
    }

    private Order buildPendingOrder(CheckoutRequest request, User user, Address address) {
        return Order.builder()
                .code("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .user(user)
                .address(address)
                .status(OrderStatus.PENDING)
                .promotionCode(toPromotionCodeString(request.getPromotionCodes()))
                .note(request.getNote())
                .paymentMethod(request.getPaymentMethod())
                .source("web")
                .shippingFee(DEFAULT_SHIPPING_FEE)
                .discountAmount(BigDecimal.ZERO)
                .orderItems(new ArrayList<>())
                .build();
    }

    private BigDecimal createOrderItemsAndDecreaseStock(Order order, List<CartItem> selectedItems) {
        BigDecimal subtotal = BigDecimal.ZERO;

        for (CartItem cartItem : selectedItems) {
            Book book = cartItem.getBook();
            int updatedRows = bookRepository.decreaseStockIfAvailable(book.getId(), cartItem.getQuantity());
            if (updatedRows == 0) {
                throw new AppException(ErrorCode.OUT_OF_STOCK);
            }

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .book(book)
                    .quantity(cartItem.getQuantity())
                    .unitPrice(book.getEffectivePrice())
                    .subtotal(calculateCartItemSubtotal(cartItem))
                    .build();

            subtotal = subtotal.add(orderItem.getSubtotal());
            order.getOrderItems().add(orderItem);
        }

        return subtotal;
    }

    private BigDecimal createOrderItemsFromBuyNow(Order order, Book book, int quantity) {
        int updatedRows = bookRepository.decreaseStockIfAvailable(book.getId(), quantity);
        if (updatedRows == 0) {
            throw new AppException(ErrorCode.OUT_OF_STOCK);
        }

        BigDecimal effectivePrice = book.getEffectivePrice();
        BigDecimal subtotal = effectivePrice.multiply(BigDecimal.valueOf(quantity));

        OrderItem orderItem = OrderItem.builder()
                .order(order)
                .book(book)
                .quantity(quantity)
                .unitPrice(effectivePrice)
                .subtotal(subtotal)
                .build();

        order.getOrderItems().add(orderItem);
        return subtotal;
    }

    private PromotionCalculationResult applyPromotions(
            CheckoutRequest request,
            BigDecimal subtotal,
            BigDecimal shippingFee,
            Long userId) {
        if (request.getPromotionCodes() == null || request.getPromotionCodes().isEmpty()) {
            return new PromotionCalculationResult(BigDecimal.ZERO, new ArrayList<>());
        }

        return promotionService.calculateAndApplyPromotions(
                request.getPromotionCodes(),
                subtotal,
                shippingFee,
                userId);
    }

    private PromotionCalculationResult previewPromotions(
            CheckoutRequest request,
            BigDecimal subtotal,
            BigDecimal shippingFee,
            Long userId) {
        if (request.getPromotionCodes() == null || request.getPromotionCodes().isEmpty()) {
            return new PromotionCalculationResult(BigDecimal.ZERO, new ArrayList<>());
        }

        return promotionService.previewPromotions(
                request.getPromotionCodes(),
                subtotal,
                shippingFee,
                userId);
    }

    private void savePromotionUsages(
            List<Promotion> appliedPromotions,
            User user,
            Order order,
            BigDecimal subtotal,
            BigDecimal shippingFee) {
        for (Promotion promotion : appliedPromotions) {
            PromotionUsage usage = PromotionUsage.builder()
                    .promotion(promotion)
                    .user(user)
                    .order(order)
                    .discountAmount(promotion.calculateDiscount(subtotal, shippingFee))
                    .isCancelled(false)
                    .build();
            promotionUsageRepository.save(usage);
        }
    }

    private BigDecimal calculateCartItemSubtotal(CartItem cartItem) {
        return cartItem.getBook()
                .getEffectivePrice()
                .multiply(BigDecimal.valueOf(cartItem.getQuantity()));
    }

    private BigDecimal calculateTotal(BigDecimal subtotal, BigDecimal shippingFee, BigDecimal discountAmount) {
        BigDecimal total = subtotal.add(shippingFee).subtract(discountAmount);
        return total.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : total;
    }

    private String toPromotionCodeString(List<String> promotionCodes) {
        if (promotionCodes == null || promotionCodes.isEmpty()) {
            return null;
        }

        return String.join(",", promotionCodes);
    }
}
