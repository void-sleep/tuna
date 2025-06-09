package com.voidsleep.tuna.service;

import com.voidsleep.tuna.entity.DataItem;
import com.voidsleep.tuna.entity.User;
import com.voidsleep.tuna.repository.DataItemRepository;
import com.voidsleep.tuna.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class DataItemService {

    private final DataItemRepository dataItemRepository;
    private final UserRepository userRepository;

    public DataItemService(DataItemRepository dataItemRepository, UserRepository userRepository) {
        this.dataItemRepository = dataItemRepository;
        this.userRepository = userRepository;
    }

    public DataItem createDataItem(DataItem dataItem, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username: " + username));
        dataItem.setOwner(user);
        return dataItemRepository.save(dataItem);
    }

    public List<DataItem> getDataItemsByUsername(String username) {
        return dataItemRepository.findByOwnerUsername(username);
    }

    public Optional<DataItem> getDataItemById(Long id, String username) {
        return dataItemRepository.findById(id)
                .filter(dataItem -> dataItem.getOwner().getUsername().equals(username));
    }

    public DataItem updateDataItem(Long id, DataItem updatedItem, String username) {
        DataItem existingItem = dataItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("DataItem not found with id: " + id));

        if (!existingItem.getOwner().getUsername().equals(username)) {
            throw new IllegalArgumentException("User not authorized to update this DataItem");
        }

        existingItem.setName(updatedItem.getName());
        existingItem.setDescription(updatedItem.getDescription());
        // Owner and timestamps should not be updated here directly by user input
        return dataItemRepository.save(existingItem);
    }

    public void deleteDataItem(Long id, String username) {
        DataItem dataItem = dataItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("DataItem not found with id: " + id));

        if (!dataItem.getOwner().getUsername().equals(username)) {
            throw new IllegalArgumentException("User not authorized to delete this DataItem");
        }
        dataItemRepository.delete(dataItem);
    }
}
