package com.voidsleep.tuna.entity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

/**
 * Create application request DTO
 */
@Data
public class CreateApplicationRequest {

  @NotBlank
  @Size(max = 255)
  private String name;

  @Size(max = 1000)
  private String description;

  private String logo;

  private List<String> tags;

  private String datasetId;

  private String policyId;
}
