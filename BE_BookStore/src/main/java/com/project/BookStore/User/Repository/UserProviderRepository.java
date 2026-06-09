package com.project.BookStore.User.Repository;


import com.project.BookStore.User.Entity.UserProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserProviderRepository extends JpaRepository<UserProvider, Long> {
    Optional<UserProvider> findByProviderAndProviderId(String provider, String providerId);
}