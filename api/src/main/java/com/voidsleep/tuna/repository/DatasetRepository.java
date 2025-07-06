package com.voidsleep.tuna.repository;

import com.voidsleep.tuna.entity.DatasetEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Dataset repository
 */
@Repository
public interface DatasetRepository extends JpaRepository<DatasetEntity, UUID> {

  /**
   * Find datasets by created by user ID, ordered by created at desc
   *
   * @param createdBy the user ID who created the datasets
   * @return list of datasets
   */
  List<DatasetEntity> findByCreatedByOrderByCreatedAtDesc(String createdBy);

  /**
   * Find datasets by created by user ID and name containing ignore case
   *
   * @param createdBy the user ID who created the datasets
   * @param name      the name to search for
   * @return list of datasets
   */
  @Query("SELECT d FROM DatasetEntity d WHERE d.createdBy = :createdBy AND LOWER(d.name) LIKE LOWER(CONCAT('%', :name, '%')) ORDER BY d.createdAt DESC")
  List<DatasetEntity> findByCreatedByAndNameContainingIgnoreCase(@Param("createdBy") String createdBy,
      @Param("name") String name);
}