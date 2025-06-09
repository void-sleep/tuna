package com.voidsleep.tuna.repository;

import com.voidsleep.tuna.entity.DataItem;
import com.voidsleep.tuna.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DataItemRepository extends JpaRepository<DataItem, Long> {
    List<DataItem> findByOwner(User owner);
    List<DataItem> findByOwnerUsername(String username);
}
