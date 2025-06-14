package com.voidsleep.tuna.service;

import com.voidsleep.tuna.entity.CreateApplicationRequest;
import com.voidsleep.tuna.entity.UpdateApplicationRequest;
import com.voidsleep.tuna.entity.ApplicationEntity;
import com.voidsleep.tuna.entity.DatasetEntity;
import com.voidsleep.tuna.entity.PolicyEntity;
import com.voidsleep.tuna.exception.AppException;
import com.voidsleep.tuna.repository.ApplicationRepository;
import com.voidsleep.tuna.repository.DatasetRepository;
import com.voidsleep.tuna.repository.PolicyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
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
    private final DatasetRepository datasetRepository;
    private final PolicyRepository policyRepository;

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
        
        // Create default dataset first
        DatasetEntity defaultDataset = createDefaultDataset(request.getName(), userId);
        DatasetEntity savedDataset = datasetRepository.save(defaultDataset);
        log.debug("Created default dataset {} for application", savedDataset.getId());

        // Create default policy
        PolicyEntity defaultPolicy = createDefaultPolicy(request.getName(), userId);
        PolicyEntity savedPolicy = policyRepository.save(defaultPolicy);
        log.debug("Created default policy {} for application", savedPolicy.getId());

        // Create application with default dataset and policy
        ApplicationEntity application = new ApplicationEntity();
        application.setName(request.getName());
        application.setDescription(request.getDescription());
        application.setLogo(request.getLogo());
        application.setTags(request.getTags());
        application.setCreatedBy(userId);
        application.setDatasetId(savedDataset.getId());
        application.setPolicyId(savedPolicy.getId());
        
        ApplicationEntity savedApplication = applicationRepository.save(application);
        log.info("Created application {} with default dataset {} and policy {} for user: {}",
                savedApplication.getId(), savedDataset.getId(), savedPolicy.getId(), userId);

        return savedApplication;
    }

    /**
     * Create default dataset for application
     *
     * @param applicationName application name
     * @param userId          user ID
     * @return default dataset entity
     */
    private DatasetEntity createDefaultDataset(String applicationName, String userId) {
        DatasetEntity dataset = new DatasetEntity();
        dataset.setName(applicationName + " - 默认数据集");
        dataset.setDescription("自动为应用 \"" + applicationName + "\" 创建的默认数据集");
        dataset.setTags(Arrays.asList("默认", "系统创建"));
        dataset.setCreatedBy(userId);
        return dataset;
    }

    /**
     * Create default policy for application
     *
     * @param applicationName application name
     * @param userId          user ID
     * @return default policy entity
     */
    private PolicyEntity createDefaultPolicy(String applicationName, String userId) {
        PolicyEntity policy = new PolicyEntity();
        policy.setName(applicationName + " - 默认策略");
        policy.setDescription("自动为应用 \"" + applicationName + "\" 创建的默认随机选择策略");
        policy.setTags(Arrays.asList("默认", "随机选择", "系统创建"));
        policy.setCreatedBy(userId);
        return policy;
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
