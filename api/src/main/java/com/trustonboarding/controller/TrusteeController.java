package com.trustonboarding.controller;

import com.trustonboarding.entity.Trustee;
import com.trustonboarding.service.TrustApplicationService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class TrusteeController {

    private final TrustApplicationService service;

    public TrusteeController(TrustApplicationService service) {
        this.service = service;
    }

    @GetMapping("/api/applications/{applicationId}/trustees")
    public List<Trustee> list(@PathVariable Integer applicationId) {
        return service.getTrustees(applicationId);
    }

    @PostMapping("/api/applications/{applicationId}/trustees")
    @ResponseStatus(HttpStatus.CREATED)
    public Trustee add(@PathVariable Integer applicationId, @RequestBody Trustee trustee) {
        return service.addTrustee(applicationId, trustee);
    }

    @PutMapping("/api/trustees/{id}")
    public ResponseEntity<Trustee> update(@PathVariable Integer id, @RequestBody Trustee patch) {
        try {
            return ResponseEntity.ok(service.updateTrustee(id, patch));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/api/trustees/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        service.deleteTrustee(id);
    }
}
