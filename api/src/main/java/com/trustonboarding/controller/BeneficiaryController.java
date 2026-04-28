package com.trustonboarding.controller;

import com.trustonboarding.entity.Beneficiary;
import com.trustonboarding.service.TrustApplicationService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class BeneficiaryController {

    private final TrustApplicationService service;

    public BeneficiaryController(TrustApplicationService service) {
        this.service = service;
    }

    @GetMapping("/api/applications/{applicationId}/beneficiaries")
    public List<Beneficiary> list(@PathVariable Integer applicationId) {
        return service.getBeneficiaries(applicationId);
    }

    @PostMapping("/api/applications/{applicationId}/beneficiaries")
    @ResponseStatus(HttpStatus.CREATED)
    public Beneficiary add(@PathVariable Integer applicationId, @RequestBody Beneficiary beneficiary) {
        return service.addBeneficiary(applicationId, beneficiary);
    }

    @PutMapping("/api/beneficiaries/{id}")
    public ResponseEntity<Beneficiary> update(@PathVariable Integer id, @RequestBody Beneficiary patch) {
        try {
            return ResponseEntity.ok(service.updateBeneficiary(id, patch));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/api/beneficiaries/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        service.deleteBeneficiary(id);
    }
}
