package com.voidsleep.tuna.service;

import com.voidsleep.tuna.entity.CreateRecipeRequest;
import com.voidsleep.tuna.entity.DatasetEntity;
import com.voidsleep.tuna.entity.RecipeEntity;
import com.voidsleep.tuna.entity.UpdateRecipeRequest;
import com.voidsleep.tuna.exception.AppException;
import com.voidsleep.tuna.repository.DatasetRepository;
import com.voidsleep.tuna.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final DatasetRepository datasetRepository;

    // Helper method to check dataset access
    private DatasetEntity findDatasetAndVerifyAccess(UUID datasetId, String userId) {
        DatasetEntity dataset = datasetRepository.findById(datasetId)
                .orElseThrow(() -> new AppException("Dataset not found with ID: " + datasetId, HttpStatus.NOT_FOUND));
        if (!dataset.getCreatedBy().equals(userId)) {
            log.warn("User {} attempted to access dataset {} owned by {}", userId, datasetId, dataset.getCreatedBy());
            throw new AppException("Access denied to dataset with ID: " + datasetId, HttpStatus.FORBIDDEN);
        }
        return dataset;
    }

    public List<RecipeEntity> getRecipesByDatasetId(UUID datasetId, String userId) {
        log.debug("Fetching recipes for dataset ID: {} by user ID: {}", datasetId, userId);
        findDatasetAndVerifyAccess(datasetId, userId); // Verify access
        return recipeRepository.findByDatasetId(datasetId);
    }

    @Transactional
    public RecipeEntity createRecipe(UUID datasetId, CreateRecipeRequest request, String userId) {
        log.debug("Creating recipe in dataset ID: {} for user ID: {}", datasetId, userId);
        DatasetEntity dataset = findDatasetAndVerifyAccess(datasetId, userId); // Verify access

        RecipeEntity recipe = new RecipeEntity();
        recipe.setName(request.getName());
        recipe.setDescription(request.getDescription());
        recipe.setTags(request.getTags());
        recipe.setDatasetId(dataset.getId());
        // createdBy is not on RecipeEntity, access is via Dataset

        RecipeEntity savedRecipe = recipeRepository.save(recipe);
        log.info("Recipe {} created in dataset {} by user {}", savedRecipe.getId(), datasetId, userId);
        return savedRecipe;
    }

    @Transactional
    public RecipeEntity updateRecipe(UUID recipeId, UpdateRecipeRequest request, String userId) {
        log.debug("Updating recipe ID: {} by user ID: {}", recipeId, userId);
        RecipeEntity recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new AppException("Recipe not found with ID: " + recipeId, HttpStatus.NOT_FOUND));

        findDatasetAndVerifyAccess(recipe.getDatasetId(), userId); // Verify access via parent dataset

        if (request.getName() != null && !request.getName().isBlank()) {
            recipe.setName(request.getName());
        }
        if (request.getDescription() != null) {
            recipe.setDescription(request.getDescription());
        }
        if (request.getTags() != null) {
            recipe.setTags(request.getTags());
        }

        RecipeEntity updatedRecipe = recipeRepository.save(recipe);
        log.info("Recipe {} updated by user {}", updatedRecipe.getId(), userId);
        return updatedRecipe;
    }

    @Transactional
    public void deleteRecipe(UUID recipeId, String userId) {
        log.debug("Deleting recipe ID: {} by user ID: {}", recipeId, userId);
        RecipeEntity recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new AppException("Recipe not found with ID: " + recipeId, HttpStatus.NOT_FOUND));

        findDatasetAndVerifyAccess(recipe.getDatasetId(), userId); // Verify access via parent dataset

        recipeRepository.delete(recipe);
        log.info("Recipe {} deleted by user {}", recipeId, userId);
    }
}
