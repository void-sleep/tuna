package com.voidsleep.tuna.entity;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class CreateRecipeRequest {
    @NotBlank(message = "Recipe name cannot be blank")
    private String name;
    private String description;
    private List<String> tags;
}
