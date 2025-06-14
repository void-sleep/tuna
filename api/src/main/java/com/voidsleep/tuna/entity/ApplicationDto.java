package com.voidsleep.tuna.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Application DTO
 */
@Data
public class ApplicationDto {

    private String id;

    private String name;

    private String description;

    private String logo;

    private List<String> tags;

    private String datasetId;

    private String policyId;

    private String createdBy;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
}
