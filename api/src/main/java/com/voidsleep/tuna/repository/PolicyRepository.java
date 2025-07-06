package com.voidsleep.tuna.repository;

import com.voidsleep.tuna.entity.PolicyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Policy repository
 */
@Repository
public interface PolicyRepository extends JpaRepository<PolicyEntity, UUID> {

  /**
   * Find policies by created by user ID, ordered by created at desc
   *
   * @param createdBy the user ID who created the policies
   * @return list of policies
   */
  List<PolicyEntity> findByCreatedByOrderByCreatedAtDesc(String createdBy);

  /**
   * Find policies by created by user ID and name containing ignore case
   *
   * @param createdBy the user ID who created the policies
   * @param name      the name to search for
   * @return list of policies
   */
  @Query("SELECT p FROM PolicyEntity p WHERE p.createdBy = :createdBy AND LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%')) ORDER BY p.createdAt DESC")
  List<PolicyEntity> findByCreatedByAndNameContainingIgnoreCase(@Param("createdBy") String createdBy,
      @Param("name") String name);
}