package com.project.BookStore.User.Repository;

import com.project.BookStore.User.Entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository  extends JpaRepository<Customer, Long> {
}
