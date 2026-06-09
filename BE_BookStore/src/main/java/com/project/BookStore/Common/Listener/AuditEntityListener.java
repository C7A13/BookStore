    package com.project.BookStore.Common.Listener;

    import com.project.BookStore.Common.Entity.BaseEntity;
    import jakarta.persistence.PrePersist;
    import jakarta.persistence.PreUpdate;
    import lombok.RequiredArgsConstructor;
    import org.springframework.security.core.Authentication;
    import org.springframework.security.core.context.SecurityContextHolder;
    import org.springframework.security.oauth2.jwt.Jwt;

    import java.time.LocalDateTime;

    @RequiredArgsConstructor
    public class AuditEntityListener {

//        @PrePersist
//        public void prePersist(Object entity){
//            if(entity instanceof BaseEntity base){
//                base.setCreatedAt(LocalDateTime.now());
//                base.setUpdatedAt(LocalDateTime.now());
//                base.setCreatedBy(getCurrentUserId());
//                base.setUpdatedBy(getCurrentUserId());
//            }
//        }
//
//        @PreUpdate
//        public void preUpdate(Object entity){
//            if(entity instanceof BaseEntity base){
//                if(base.getDeletedAt() == null && base.getDeletedBy() == null  ) {
//                    base.setUpdatedAt(LocalDateTime.now());
//                    base.setUpdatedBy(getCurrentUserId());
//                }
//            }
//        }
//
//        public Long getCurrentUserId() {
//            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//
//            if (auth == null || !auth.isAuthenticated()) {
//                return null;
//            }
//            Object principal = auth.getPrincipal();
//
//            if (principal instanceof Jwt jwt) {
//                return jwt.getClaim("id");
//            }
//            return null;
//        }

    }
