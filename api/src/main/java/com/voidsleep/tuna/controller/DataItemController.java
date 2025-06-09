package com.voidsleep.tuna.controller;

import com.voidsleep.tuna.entity.DataItem;
import com.voidsleep.tuna.service.DataItemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/{username}/items")
public class DataItemController {

    private final DataItemService dataItemService;

    public DataItemController(DataItemService dataItemService) {
        this.dataItemService = dataItemService;
    }

    @PostMapping("/")
    public ResponseEntity<DataItem> createDataItem(@PathVariable String username, @RequestBody DataItem dataItem) {
        try {
            DataItem createdItem = dataItemService.createDataItem(dataItem, username);
            return new ResponseEntity<>(createdItem, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/")
    public ResponseEntity<List<DataItem>> getDataItemsByUsername(@PathVariable String username) {
        List<DataItem> items = dataItemService.getDataItemsByUsername(username);
        return new ResponseEntity<>(items, HttpStatus.OK);
    }

    @GetMapping("/{itemId}")
    public ResponseEntity<DataItem> getDataItemById(@PathVariable String username, @PathVariable Long itemId) {
        return dataItemService.getDataItemById(itemId, username)
                .map(item -> new ResponseEntity<>(item, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<DataItem> updateDataItem(@PathVariable String username, @PathVariable Long itemId, @RequestBody DataItem dataItem) {
        try {
            DataItem updatedItem = dataItemService.updateDataItem(itemId, dataItem, username);
            return new ResponseEntity<>(updatedItem, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            // This could be more granular, e.g., distinguish between NOT_FOUND and UNAUTHORIZED
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteDataItem(@PathVariable String username, @PathVariable Long itemId) {
        try {
            dataItemService.deleteDataItem(itemId, username);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (IllegalArgumentException e) {
            // This could be more granular
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
