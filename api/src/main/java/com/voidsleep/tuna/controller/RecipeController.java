package com.voidsleep.tuna.controller;

import com.voidsleep.tuna.entity.CreateRecipeRequest;
import com.voidsleep.tuna.entity.RecipeEntity;
import com.voidsleep.tuna.entity.UpdateRecipeRequest;
import com.voidsleep.tuna.service.RecipeService;
import com.voidsleep.tuna.utils.SecurityUtils; // Assuming SecurityUtils.currentUserId() is available
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/datasets") // Base path as per frontend DatasetApi.ts (assuming /api prefix is global or handled by proxy)
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService recipeService;

    @GetMapping("/{datasetId}/items")
    public ResponseEntity<List<RecipeEntity>> getRecipesByDatasetId(@PathVariable String datasetId) {
        UUID datasetUuid = parseUuid(datasetId, "datasetId");
        List<RecipeEntity> recipes = recipeService.getRecipesByDatasetId(datasetUuid, SecurityUtils.currentUserId());
        return ResponseEntity.ok(recipes);
    }

    @PostMapping("/{datasetId}/items")
    public ResponseEntity<RecipeEntity> createRecipe(@PathVariable String datasetId,
                                                     @Valid @RequestBody CreateRecipeRequest request) {
        UUID datasetUuid = parseUuid(datasetId, "datasetId");
        RecipeEntity createdRecipe = recipeService.createRecipe(datasetUuid, request, SecurityUtils.currentUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdRecipe);
    }

    @PutMapping("/{datasetId}/items/{itemId}")
    public ResponseEntity<RecipeEntity> updateRecipe(@PathVariable String datasetId,
                                                     @PathVariable String itemId,
                                                     @Valid @RequestBody UpdateRecipeRequest request) {
        // datasetId is primarily for path consistency with REST principles, actual auth happens via itemId's recipe.datasetId in service
        parseUuid(datasetId, "datasetId"); // Validate format, though not directly used for lookup here if itemId is global
        UUID itemUuid = parseUuid(itemId, "itemId");
        RecipeEntity updatedRecipe = recipeService.updateRecipe(itemUuid, request, SecurityUtils.currentUserId());
        return ResponseEntity.ok(updatedRecipe);
    }

    @DeleteMapping("/{datasetId}/items/{itemId}")
    public ResponseEntity<Void> deleteRecipe(@PathVariable String datasetId,
                                             @PathVariable String itemId) {
        // datasetId is for path consistency
        parseUuid(datasetId, "datasetId");
        UUID itemUuid = parseUuid(itemId, "itemId");
        recipeService.deleteRecipe(itemUuid, SecurityUtils.currentUserId());
        return ResponseEntity.noContent().build();
    }

    // Helper method for parsing UUID to avoid repetition and handle potential errors
    private UUID parseUuid(String idString, String paramName) {
        try {
            return UUID.fromString(idString);
        } catch (IllegalArgumentException e) {
            // Consider using a custom exception that translates to a 400 Bad Request
            throw new IllegalArgumentException("Invalid " + paramName + " format: " + idString);
        }
    }
}
