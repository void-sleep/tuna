package com.voidsleep.tuna.repository;

import com.voidsleep.tuna.entity.ApplicationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Application repository
 */
@Repository
public interface ApplicationRepository extends JpaRepository<ApplicationEntity, UUID> {

    /**
     * Find applications by created by user ID
     *
     * @param createdBy user ID
     * @return list of applications
     */
    List<ApplicationEntity> findByCreatedByOrderByCreatedAtDesc(String createdBy);

    /**
     * Find applications by created by user ID and name containing
     *
     * @param createdBy user ID
     * @param name      name to search
     * @return list of applications
     */
    @Query("SELECT a FROM ApplicationEntity a WHERE a.createdBy = :createdBy AND LOWER(a.name) LIKE LOWER(CONCAT('%', :name, '%')) ORDER BY a.createdAt DESC")
    List<ApplicationEntity> findByCreatedByAndNameContainingIgnoreCase(@Param("createdBy") String createdBy, @Param("name") String name);

    /**
     * Check if application exists by ID and created by user ID
     *
     * @param id        application ID
     * @param createdBy user ID
     * @return true if exists
     */
    boolean existsByIdAndCreatedBy(UUID id, String createdBy);
}
