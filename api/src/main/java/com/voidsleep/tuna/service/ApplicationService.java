package com.voidsleep.tuna.service;

import com.voidsleep.tuna.entity.CreateApplicationRequest;
import com.voidsleep.tuna.entity.UpdateApplicationRequest;
import com.voidsleep.tuna.entity.ApplicationEntity;
import com.voidsleep.tuna.exception.AppException;
import com.voidsleep.tuna.repository.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Application service
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;

    /**
     * Get current user applications
     *
     * @param userId current user ID
     * @return list of applications
     */
    public List<ApplicationEntity> getCurrentUserApplications(String userId) {
        log.debug("Getting applications for user: {}", userId);
        
        return applicationRepository.findByCreatedByOrderByCreatedAtDesc(userId);
    }

    /**
     * Get application by ID
     *
     * @param applicationId application ID
     * @param userId        current user ID
     * @return application entity
     */
    public ApplicationEntity getApplicationById(String applicationId, String userId) {
        log.debug("Getting application {} for user: {}", applicationId, userId);
        
        UUID id;
        try {
            id = UUID.fromString(applicationId);
        } catch (IllegalArgumentException e) {
            throw new AppException("Invalid application ID format", HttpStatus.BAD_REQUEST);
        }
        
        ApplicationEntity application = applicationRepository.findById(id)
                .orElseThrow(() -> new AppException("Application not found", HttpStatus.NOT_FOUND));
        
        // Check if user owns this application
        if (!application.getCreatedBy().equals(userId)) {
            throw new AppException("Access denied", HttpStatus.FORBIDDEN);
        }
        
        return application;
    }

    /**
     * Create new application
     *
     * @param request create request
     * @param userId  current user ID
     * @return created application entity
     */
    @Transactional
    public ApplicationEntity createApplication(CreateApplicationRequest request, String userId) {
        log.debug("Creating application for user: {}", userId);
        
        ApplicationEntity application = new ApplicationEntity();
        application.setName(request.getName());
        application.setDescription(request.getDescription());
        application.setLogo(request.getLogo());
        application.setTags(request.getTags());
        application.setCreatedBy(userId);
        
        // Convert string IDs to UUID if provided
        if (request.getDatasetId() != null && !request.getDatasetId().trim().isEmpty()) {
            try {
                application.setDatasetId(UUID.fromString(request.getDatasetId()));
            } catch (IllegalArgumentException e) {
                log.warn("Invalid dataset ID format: {}", request.getDatasetId());
            }
        }
        
        if (request.getPolicyId() != null && !request.getPolicyId().trim().isEmpty()) {
            try {
                application.setPolicyId(UUID.fromString(request.getPolicyId()));
            } catch (IllegalArgumentException e) {
                log.warn("Invalid policy ID format: {}", request.getPolicyId());
            }
        }
        
        ApplicationEntity savedApplication = applicationRepository.save(application);
        log.info("Created application {} for user: {}", savedApplication.getId(), userId);
        
        return savedApplication;
    }

    /**
     * Update application
     *
     * @param applicationId application ID
     * @param request       update request
     * @param userId        current user ID
     * @return updated application entity
     */
    @Transactional
    public ApplicationEntity updateApplication(String applicationId, UpdateApplicationRequest request, String userId) {
        log.debug("Updating application {} for user: {}", applicationId, userId);
        
        UUID id;
        try {
            id = UUID.fromString(applicationId);
        } catch (IllegalArgumentException e) {
            throw new AppException("Invalid application ID format", HttpStatus.BAD_REQUEST);
        }
        
        ApplicationEntity application = applicationRepository.findById(id)
                .orElseThrow(() -> new AppException("Application not found", HttpStatus.NOT_FOUND));
        
        // Check if user owns this application
        if (!application.getCreatedBy().equals(userId)) {
            throw new AppException("Access denied", HttpStatus.FORBIDDEN);
        }
        
        // Update fields
        application.setName(request.getName());
        application.setDescription(request.getDescription());
        application.setLogo(request.getLogo());
        application.setTags(request.getTags());
        
        // Convert string IDs to UUID if provided
        if (request.getDatasetId() != null && !request.getDatasetId().trim().isEmpty()) {
            try {
                application.setDatasetId(UUID.fromString(request.getDatasetId()));
            } catch (IllegalArgumentException e) {
                log.warn("Invalid dataset ID format: {}", request.getDatasetId());
                application.setDatasetId(null);
            }
        } else {
            application.setDatasetId(null);
        }
        
        if (request.getPolicyId() != null && !request.getPolicyId().trim().isEmpty()) {
            try {
                application.setPolicyId(UUID.fromString(request.getPolicyId()));
            } catch (IllegalArgumentException e) {
                log.warn("Invalid policy ID format: {}", request.getPolicyId());
                application.setPolicyId(null);
            }
        } else {
            application.setPolicyId(null);
        }
        
        ApplicationEntity savedApplication = applicationRepository.save(application);
        log.info("Updated application {} for user: {}", savedApplication.getId(), userId);
        
        return savedApplication;
    }

    /**
     * Delete application
     *
     * @param applicationId application ID
     * @param userId        current user ID
     */
    @Transactional
    public void deleteApplication(String applicationId, String userId) {
        log.debug("Deleting application {} for user: {}", applicationId, userId);
        
        UUID id;
        try {
            id = UUID.fromString(applicationId);
        } catch (IllegalArgumentException e) {
            throw new AppException("Invalid application ID format", HttpStatus.BAD_REQUEST);
        }
        
        ApplicationEntity application = applicationRepository.findById(id)
                .orElseThrow(() -> new AppException("Application not found", HttpStatus.NOT_FOUND));
        
        // Check if user owns this application
        if (!application.getCreatedBy().equals(userId)) {
            throw new AppException("Access denied", HttpStatus.FORBIDDEN);
        }
        
        applicationRepository.delete(application);
        log.info("Deleted application {} for user: {}", applicationId, userId);
    }
}
