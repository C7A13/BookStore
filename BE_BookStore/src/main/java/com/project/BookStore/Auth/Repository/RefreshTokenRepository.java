package com.project.BookStore.Auth.Repository;

import com.project.BookStore.Auth.Entity.RefreshToken;
import org.springframework.data.repository.CrudRepository;

public interface RefreshTokenRepository extends CrudRepository<RefreshToken,String > {
}
