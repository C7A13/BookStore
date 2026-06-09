package com.project.BookStore.Cart.Service;

import com.project.BookStore.Book.Entity.Book;
import com.project.BookStore.Book.Repository.BookRepository;
import com.project.BookStore.Cart.DTO.Request.CartItemRequest;
import com.project.BookStore.Cart.DTO.Response.CartResponse;
import com.project.BookStore.Cart.Entity.Cart;
import com.project.BookStore.Cart.Entity.CartItem;
import com.project.BookStore.Cart.Mapper.CartMapper;
import com.project.BookStore.Cart.Repository.CartItemRepository;
import com.project.BookStore.Cart.Repository.CartRepository;
import com.project.BookStore.Common.Enum.ErrorCode;
import com.project.BookStore.Common.Exception.AppException;
import com.project.BookStore.User.Entity.User;
import com.project.BookStore.User.Repository.UserRepository;
import com.project.BookStore.Auth.Security.UserContextService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CartServiceImpl implements CartService {

    CartRepository cartRepository;
    CartItemRepository cartItemRepository;
    BookRepository bookRepository;
    UserRepository userRepository;
    UserContextService userContextService;
    CartMapper cartMapper;

    @Override
    public CartResponse getCart(String sessionToken) {
        Long userId = userContextService.getRequiredUserId();
        Cart cart = getOrCreateCart(userId, sessionToken);
        return cartMapper.toResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addToCart(CartItemRequest request, String sessionToken) {
        Long userId = userContextService.getRequiredUserId();
        Cart cart = getOrCreateCart(userId, sessionToken);


        Optional<CartItem> existingItem = cart.getCartItems().stream()
                .filter(item -> item.getBook().getId().equals(request.getBookId()))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            item.setUnitPrice(item.getBook().getEffectivePrice());
        } else {
            Book book = bookRepository.findByIdAndDeletedAtIsNull(request.getBookId())
                    .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .book(book)
                    .quantity(request.getQuantity())
                    .unitPrice(book.getEffectivePrice())
                    .build();
            cart.getCartItems().add(newItem);
        }
        Cart savedCart = cartRepository.save(cart);
        return cartMapper.toResponse(savedCart);
    }

    @Override
    @Transactional
    public CartResponse updateQuantity(Long cartItemId, Integer quantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));

        cartItem.setQuantity(quantity);
        
        // Refresh and fetch with items to avoid N+1 in mapper
        Cart cart = cartRepository.findCartWithItems(cartItem.getCart().getId())
                .orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));

        return cartMapper.toResponse(cart);
    }

    @Override
    @Transactional
    public void removeItem(Long cartItemId) {
        if (!cartItemRepository.existsById(cartItemId)) {
            throw new AppException(ErrorCode.CART_ITEM_NOT_FOUND);
        }
        cartItemRepository.deleteById(cartItemId);
    }

    @Override
    @Transactional
    public void clearCart(String sessionToken) {
        Long userId = userContextService.getRequiredUserId();
        Cart cart = (userId != null)
                ? cartRepository.findByUserIdWithItems(userId).orElse(null)
                : (sessionToken != null ? cartRepository.findBySessionTokenWithItems(sessionToken).orElse(null) : null);

        if (cart != null) {
            cart.getCartItems().clear();
            cartRepository.save(cart);
        }
    }

    @Override
    @Transactional
    public CartResponse mergeCart(String sessionToken) {
        Long userId = userContextService.getRequiredUserId();
        
        Cart guestCart = cartRepository.findBySessionTokenWithItems(sessionToken).orElse(null);
        if (guestCart == null) {
            return getCart(null);
        }

        Cart userCart = getOrCreateCart(userId, null);

        // Use existing items from userCart
        Map<Long, CartItem> userItemMap = userCart.getCartItems().stream()
                .collect(Collectors.toMap(i -> i.getBook().getId(), i -> i));

        List<CartItem> guestItems = new ArrayList<>(guestCart.getCartItems());
        for (CartItem guestItem : guestItems) {
            Long bookId = guestItem.getBook().getId();
            CartItem userItem = userItemMap.get(bookId);

            if (userItem != null) {
                userItem.setQuantity(userItem.getQuantity() + guestItem.getQuantity());
            } else {
                guestItem.setCart(userCart);
                userCart.getCartItems().add(guestItem);
            }
        }

        // Clear guest items before deleting guest cart to avoid issues with managed collection
        guestCart.getCartItems().clear();
        cartRepository.delete(guestCart);

        return cartMapper.toResponse(userCart);
    }
    private Cart getOrCreateCart(Long userId, String sessionToken) {
        if (userId != null) {
            return cartRepository.findByUserIdWithItems(userId)
                    .orElseGet(() -> {
                        User user = userRepository.findById(userId)
                                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
                        return cartRepository.save(Cart.builder().user(user).build());
                    });
        } else if (sessionToken != null) {
            return cartRepository.findBySessionTokenWithItems(sessionToken)
                    .orElseGet(() -> cartRepository.save(Cart.builder().sessionToken(sessionToken).build()));
        }
        throw new AppException(ErrorCode.INVALID_KEY);
    }
}
