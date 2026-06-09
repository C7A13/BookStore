package com.project.BookStore.Common.Enum;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    // ====Auth====
    UNCATEGORIZED_EXCEPTION(1000, "Uncategorized Error", HttpStatus.INTERNAL_SERVER_ERROR),
    UNAUTHENTICATED(666, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(777, "I haven't permission", HttpStatus.FORBIDDEN),
    INVALID_TOKEN(601, "Access Token Invalid", HttpStatus.UNAUTHORIZED),
    TOKEN_EXPIRED(602, "Token Expired", HttpStatus.UNAUTHORIZED),
    REFRESH_TOKEN_NOT_EXIST(501, "Refresh Token Not Exist", HttpStatus.UNAUTHORIZED),
    INVALID_CREDENTIALS(1001, "Invalid account or password", HttpStatus.BAD_REQUEST),
    INVALID_KEY(1001, "Invalid Key ", HttpStatus.BAD_REQUEST),
    PERMISSION_EXISTED(801, "Permission Existed", HttpStatus.BAD_REQUEST),
    ROLE_NOT_FOUND(303, "Role Not Found", HttpStatus.NOT_FOUND),
    ROLE_EXISTED(301, "Role Existed", HttpStatus.BAD_REQUEST),
    PERMISSION_NOT_FOUND(305, "Permission Not Existed", HttpStatus.NOT_FOUND),
    USER_NOT_VERIFIED(778,"Your account has not been verified with an email address. Please check your inbox!", HttpStatus.FORBIDDEN),
    INVALID_LOGIN_TYPE(1009, "Invalid or unsupported social network login method.", HttpStatus.BAD_REQUEST),
    // ====User====
    USER_NOT_FOUND(304, "User Not Found", HttpStatus.NOT_FOUND),
    UPLOAD_SIZE_ERROR(901, "Can't upload multiple images", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(902,
            "Username must be between {min} and {max} characters and may contain only letters, digits, and underscores (_)",
            HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID(903, "Password must be at least {min} characters long and must not contain spaces",
            HttpStatus.BAD_REQUEST),
    PASSWORD_NOT_MATCHES(904, "Password confirm not match", HttpStatus.BAD_REQUEST),
    BIRTHDAY_INVALID(904, "Must be at least 15 years old and not in the future", HttpStatus.BAD_REQUEST),
    USER_EXISTED(302, "User Existed", HttpStatus.BAD_REQUEST),
    USERNAME_EXISTED(501, "UserName Existed", HttpStatus.BAD_REQUEST),
    EMAIL_EXISTED(502, "Email Existed", HttpStatus.BAD_REQUEST),
    PHONE_EXISTED(503, "Phone Existed", HttpStatus.BAD_REQUEST),
    USER_ALREADY_DELETED(201, "User Already deleted", HttpStatus.CONFLICT),
    USER_NOT_DELETED(202, "User Not Deleted", HttpStatus.CONFLICT),
    OLD_PASSWORD_INCORRECT(1001, "Old Password Incorrect ", HttpStatus.BAD_REQUEST),
    DUPLICATE_OLE_PASSWORD(1002, "Duplicate Old Password", HttpStatus.BAD_REQUEST),

    // ====Address====
    NO_DEFAULT_ADDRESS(802, "No Default Address", HttpStatus.CONFLICT),
    ADDRESS_NOT_FOUNT(801, "Address Not Fount", HttpStatus.NOT_FOUND),

    // ====Category====
    CANNOT_SET_ITSELF_PARENT(1102, "Cannot set itself as parents", HttpStatus.CONFLICT),
    CYCLIC_CATEGORY(1103, "Cyclic category", HttpStatus.CONFLICT),
    CATEGORY_NOT_FOUNT(1101, "Category Not Fount", HttpStatus.NOT_FOUND),
    PARENT_NOT_FOUNT(1102, "Paren Not Fount", HttpStatus.NOT_FOUND),

    // ====Publisher====
    PUBLISHER_NOT_FOUND(1201, "Publisher Not Found", HttpStatus.NOT_FOUND),
    PUBLISHER_NAME_EXISTED(1202, "Publisher Name Already Existed", HttpStatus.BAD_REQUEST),
    // ===Author===
    AUTHOR_NOT_FOUND(1301, "Author Not Found", HttpStatus.NOT_FOUND),
    AUTHOR_ALREADY_EXISTS(1302, "Author Already Existed", HttpStatus.BAD_REQUEST),
    // ===Book===
    BOOK_NOT_FOUND(1401, "Book Not Found", HttpStatus.NOT_FOUND),
    ISBN_ALREADY_EXISTS(1402, "ISBN Already Existed", HttpStatus.BAD_REQUEST),
    // OUT_OF_STOCK(1403 , "Only {stockQuantity} copies left for
    // {title}",HttpStatus.BAD_REQUEST),
    // ===BookAuthor==
    BOOK_AUTHOR_ALREADY_EXISTS(1502, "Author Already Add To Book", HttpStatus.BAD_REQUEST),
    BOOK_AUTHOR_NOT_FOUND(1501, "Book Author Not Found", HttpStatus.NOT_FOUND),
    // ===BoolImage==
    FILE_UPLOAD_ERROR(802, "File Upload Error", HttpStatus.BAD_REQUEST),
    IMAGE_NOT_FOUND(805, "Image Not Found", HttpStatus.NOT_FOUND),
    FILE_DELETE_ERROR(803, "File Delete Error", HttpStatus.BAD_REQUEST),
    // ===CARD==
    CART_NOT_FOUND(1602, "Cart Not Found", HttpStatus.NOT_FOUND),
    CART_ITEM_NOT_FOUND(1601, "Cart Item Not Found", HttpStatus.NOT_FOUND),
    CART_ITEM_IS_EMPTY(1603, "Cart Item Empty", HttpStatus.BAD_REQUEST),
    // ====Order====
    ORDER_NOT_FOUND(1701, "Order Not Found", HttpStatus.NOT_FOUND),
    ORDER_CANNOT_CANCEL(1702, "Order cannot be cancelled in its current state", HttpStatus.BAD_REQUEST),
    OUT_OF_STOCK(1703, "Product is out of stock", HttpStatus.BAD_REQUEST),
    INVALID_INVENTORY_QUANTITY(1704, "Inventory quantity must be different from zero", HttpStatus.BAD_REQUEST),

    // ====Payment====
    PAYMENT_NOT_FOUND(1801, "Payment Not Found", HttpStatus.NOT_FOUND),
    PAYMENT_ALREADY_SUCCESS(1802, "Payment already completed successfully", HttpStatus.CONFLICT),
    PAYMENT_CANNOT_REFUND(1803, "Only completed payments can be refunded", HttpStatus.BAD_REQUEST),
    VNPAY_INVALID_SIGNATURE(1804, "VNPay invalid secure hash", HttpStatus.BAD_REQUEST),
    INVALID_PAYMENT_METHOD(1805, "Invalid payment method", HttpStatus.BAD_REQUEST),
    // ===Shipment===
    ORDER_NOT_READY_FOR_SHIPPING(1902, "Order Not Ready For Shipping", HttpStatus.CONFLICT),
    INVALID_STATUS_TRANSITION(1903, "Invalid Shipment Status Transition", HttpStatus.CONFLICT),
    SHIPMENT_FINAL_STATE(1904, "Shipment Is Already In Final State", HttpStatus.CONFLICT),
    SHIPMENT_SAME_STATUS(1905, "Shipment Already Has This Status", HttpStatus.BAD_REQUEST),
    SHIPMENT_NOT_READY_TO_PICK(1906, "Shipment Is Not Ready To Pick", HttpStatus.CONFLICT),
    SHIPMENT_NOT_PICKING(1907, "Shipment Is Not In Picking State", HttpStatus.CONFLICT),
    SHIPMENT_NOT_DELIVERING(1908, "Shipment Is Not In Delivering State", HttpStatus.CONFLICT),
    SHIPMENT_CANNOT_RETRY(1909, "Shipment Cannot Retry From Current State", HttpStatus.CONFLICT),
    SHIPMENT_ALREADY_EXISTS(1902, "Shipment Already Exists", HttpStatus.BAD_REQUEST),
    SHIPMENT_NOT_FOUND(1901, "Shipment Not Found", HttpStatus.NOT_FOUND),

    // ====Promotion====
    PROMOTION_NOT_FOUND(2001, "Promotion Not Found", HttpStatus.NOT_FOUND),
    PROMOTION_CODE_EXISTS(2002, "Promotion Code Already Exists", HttpStatus.BAD_REQUEST),
    PROMOTION_EXPIRED(2003, "Promotion Expired Or Not Active", HttpStatus.BAD_REQUEST),
    PROMOTION_MIN_ORDER_NOT_MET(2004, "Order Value Does Not Meet Promotion Minimum Requirement", HttpStatus.BAD_REQUEST),
    PROMOTION_USAGE_LIMIT_EXCEEDED(2005, "Promotion Usage Limit Exceeded", HttpStatus.BAD_REQUEST),
    PROMOTION_CUSTOMER_LIMIT_EXCEEDED(2006, "Promotion Customer Usage Limit Exceeded", HttpStatus.BAD_REQUEST),

    // ====Review====
    REVIEW_NOT_FOUND(2101, "Review Not Found", HttpStatus.NOT_FOUND),
    REVIEW_ALREADY_EXISTS(2102, "You have already reviewed this book for this order", HttpStatus.CONFLICT),
    ORDER_NOT_DELIVERED(2103, "Order must be delivered before reviewing", HttpStatus.BAD_REQUEST),
    BOOK_NOT_IN_ORDER(2104, "This book is not in the specified order", HttpStatus.BAD_REQUEST),
    REVIEW_NOT_OWNER(2105, "You can only modify your own review", HttpStatus.FORBIDDEN),

    // ====Comment====
    COMMENT_NOT_FOUND(2201, "Comment Not Found", HttpStatus.NOT_FOUND),
    COMMENT_NOT_OWNER(2202, "You can only modify or delete your own comment", HttpStatus.FORBIDDEN),
    PARENT_COMMENT_NOT_FOUND(2203, "Parent comment not found", HttpStatus.NOT_FOUND),
    PARENT_COMMENT_DIFFERENT_BOOK(2204, "Parent comment belongs to a different book", HttpStatus.BAD_REQUEST);

    ErrorCode(int code, String message, HttpStatus statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private int code;

    private String message;

    private HttpStatus statusCode;

}
