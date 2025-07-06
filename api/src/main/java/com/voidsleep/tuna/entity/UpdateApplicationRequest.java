package com.voidsleep.tuna.entity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

/**
 * Update application request DTO
 */
@Data
public class UpdateApplicationRequest {

    @NotBlank(message = "应用名称不能为空")
    @Size(max = 255, message = "应用名称长度不能超过255个字符")
    private String name;

    @Size(max = 1000, message = "应用描述长度不能超过1000个字符")
    private String description;

    private String logo;

    private List<String> tags;

    private String datasetId;

    private String policyId;
}
