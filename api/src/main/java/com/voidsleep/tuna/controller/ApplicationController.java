package com.voidsleep.tuna.controller;

import com.voidsleep.tuna.entity.ApplicationDto;
import com.voidsleep.tuna.entity.CreateApplicationRequest;
import com.voidsleep.tuna.entity.UpdateApplicationRequest;
import com.voidsleep.tuna.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static com.voidsleep.tuna.utils.SecurityUtils.currentUserId;

/**
 * Application controller
 */
@Slf4j
@RestController
@RequestMapping("/applications")
@RequiredArgsConstructor
public class ApplicationController {

  private final ApplicationService applicationService;

  /**
   * Get current user applications
   *
   * @return list of applications
   */
  @GetMapping
  public ResponseEntity<List<ApplicationDto>> getCurrentUserApplications() {
    List<ApplicationDto> applications = applicationService.getCurrentUserApplications(currentUserId());
    return ResponseEntity.ok(applications);
  }

  /**
   * Get application by ID
   *
   * @param id application ID
   * @return application DTO
   */
  @GetMapping("/{id}")
  public ResponseEntity<ApplicationDto> getApplicationById(@PathVariable String id) {
    ApplicationDto application = applicationService.getApplicationById(id, currentUserId());
    return ResponseEntity.ok(application);
  }

  @PostMapping
  public ResponseEntity<ApplicationDto> createApplication(@Valid @RequestBody CreateApplicationRequest request) {
    ApplicationDto application = applicationService.createApplication(request, currentUserId());
    return ResponseEntity.status(HttpStatus.CREATED).body(application);
  }

  @PutMapping("/{id}")
  public ResponseEntity<ApplicationDto> updateApplication(@PathVariable String id, @Valid @RequestBody UpdateApplicationRequest request) {
    ApplicationDto application = applicationService.updateApplication(id, request, currentUserId());
    return ResponseEntity.ok(application);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteApplication(@PathVariable String id) {
    applicationService.deleteApplication(id, currentUserId());
    return ResponseEntity.noContent().build();
  }

}
