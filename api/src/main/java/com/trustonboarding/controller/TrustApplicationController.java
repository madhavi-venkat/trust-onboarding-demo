package com.trustonboarding.controller;

import com.trustonboarding.dto.ApplicationSummaryDTO;
import com.trustonboarding.dto.ReviewRequest;
import com.trustonboarding.entity.TrustApplication;
import com.trustonboarding.entity.TrustApplication.ApplicationStatus;
import com.trustonboarding.service.TrustApplicationService;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
public class TrustApplicationController {

    private static final Logger log = LoggerFactory.getLogger(TrustApplicationController.class);

    private final TrustApplicationService service;

    public TrustApplicationController(TrustApplicationService service) {
        this.service = service;
    }

    @GetMapping
    public List<ApplicationSummaryDTO> list() {
        log.debug("GET /api/applications");
        return service.listAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrustApplication> get(@PathVariable Integer id) {
        log.debug("GET /api/applications/{}", id);
        try {
            return ResponseEntity.ok(service.getById(id));
        } catch (EntityNotFoundException e) {
            log.warn("Application not found: id={}", id);
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TrustApplication create(@RequestBody TrustApplication application) {
        log.info("POST /api/applications trust='{}'", application.getTrustName());
        return service.create(application);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrustApplication> update(
            @PathVariable Integer id,
            @RequestBody TrustApplication patch) {
        log.info("PUT /api/applications/{}", id);
        try {
            return ResponseEntity.ok(service.update(id, patch));
        } catch (EntityNotFoundException e) {
            log.warn("Update failed — application not found: id={}", id);
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TrustApplication> updateStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        log.info("PATCH /api/applications/{}/status status={}", id, body.get("status"));
        try {
            ApplicationStatus status = ApplicationStatus.valueOf(body.get("status").toUpperCase());
            return ResponseEntity.ok(service.updateStatus(id, status));
        } catch (EntityNotFoundException e) {
            log.warn("Status update failed — application not found: id={}", id);
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            log.warn("Invalid status value: {}", body.get("status"));
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<TrustApplication> review(
            @PathVariable Integer id,
            @RequestBody ReviewRequest request) {
        log.info("POST /api/applications/{}/review action={}", id, request.action());
        try {
            return ResponseEntity.ok(service.review(id, request));
        } catch (EntityNotFoundException e) {
            log.warn("Review failed — application not found: id={}", id);
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException | IllegalArgumentException e) {
            log.warn("Review rejected: id={} reason={}", id, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        log.info("DELETE /api/applications/{}", id);
        service.delete(id);
    }
}
