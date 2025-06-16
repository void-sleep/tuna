package com.voidsleep.tuna.entity;

import lombok.Data;
import java.util.List;

@Data
public class UpdateRecipeRequest {
    private String name; // Name can be optional for update, or enforce non-blank if needed
    private String description;
    private List<String> tags;
}
