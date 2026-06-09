package com.project.BookStore.Common.Utils;

import com.project.BookStore.Common.Enum.IdentifierType;

public class IdentifierUtils {

    public static IdentifierType detect(String identifier) {
        if (identifier.contains("@")) return IdentifierType.EMAIL;
        if (identifier.matches("^0\\d{9}$")) return IdentifierType.PHONE;
        return IdentifierType.USERNAME;
    }
}