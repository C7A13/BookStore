package com.project.BookStore.Address.Repository;

import com.project.BookStore.Address.Entity.Address;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AddressRepository  extends JpaRepository<Address, Long> {
    @Query("""
    select a from Address a
    join fetch a.user
    where a.user.id = :userId
    and a.deletedAt is null
    """)
    List<Address> findByUserIdAndDeletedAtIsNull(Long userId);

    @Query("""
    select a
    from Address a
    where a.id = :id
    and a.deletedAt is null
""")
    Optional<Address> findByIdAndDeletedAtIsNull(Long id);

    Optional<Address> findByUserIdAndIsDefaultTrueAndDeletedAtIsNull(Long userId);

    @EntityGraph(attributePaths = {"user"})
    Page<Address> findAll(Pageable pageable);
}
