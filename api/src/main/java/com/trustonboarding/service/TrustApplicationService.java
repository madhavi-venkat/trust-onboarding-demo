package com.trustonboarding.service;

import com.trustonboarding.dto.ApplicationSummaryDTO;
import com.trustonboarding.dto.ReviewRequest;
import com.trustonboarding.entity.Beneficiary;
import com.trustonboarding.entity.TrustApplication;
import com.trustonboarding.entity.TrustApplication.ApplicationStatus;
import com.trustonboarding.entity.Trustee;
import com.trustonboarding.repository.BeneficiaryRepository;
import com.trustonboarding.repository.TrustApplicationRepository;
import com.trustonboarding.repository.TrusteeRepository;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class TrustApplicationService {

    private static final Logger log = LoggerFactory.getLogger(TrustApplicationService.class);

    private final TrustApplicationRepository applicationRepo;
    private final TrusteeRepository trusteeRepo;
    private final BeneficiaryRepository beneficiaryRepo;

    public TrustApplicationService(TrustApplicationRepository applicationRepo,
                                   TrusteeRepository trusteeRepo,
                                   BeneficiaryRepository beneficiaryRepo) {
        this.applicationRepo = applicationRepo;
        this.trusteeRepo = trusteeRepo;
        this.beneficiaryRepo = beneficiaryRepo;
    }

    public List<ApplicationSummaryDTO> listAll() {
        log.debug("Listing all applications");
        return applicationRepo.findAll().stream()
                .map(a -> new ApplicationSummaryDTO(
                        a.getId(),
                        a.getApplicationRef(),
                        a.getTrustName(),
                        a.getTrustType(),
                        a.getStatus(),
                        a.getTrustees().size(),
                        a.getBeneficiaries().size(),
                        a.getAiRiskFlags(),
                        a.getCreatedAt()))
                .toList();
    }

    public TrustApplication getById(Integer id) {
        log.debug("Fetching application id={}", id);
        TrustApplication app = applicationRepo.findById(id)
                .orElseThrow(() -> {
                    log.warn("Application not found: id={}", id);
                    return new EntityNotFoundException("Application not found: " + id);
                });
        app.getTrustees().size();
        app.getBeneficiaries().size();
        return app;
    }

    @Transactional
    public TrustApplication create(TrustApplication application) {
        application.setApplicationRef(generateRef());
        if (application.getStatus() == null) {
            application.setStatus(TrustApplication.ApplicationStatus.SUBMITTED);
        }
        TrustApplication saved = applicationRepo.save(application);
        log.info("Created application id={} ref={} trust='{}'", saved.getId(), saved.getApplicationRef(), saved.getTrustName());
        return saved;
    }

    private String generateRef() {
        int year = LocalDate.now().getYear();
        long next = applicationRepo.count() + 1;
        return String.format("APP-%d-%03d", year, next);
    }

    @Transactional
    public TrustApplication update(Integer id, TrustApplication patch) {
        log.info("Updating application id={}", id);
        TrustApplication existing = getById(id);
        existing.setTrustName(patch.getTrustName());
        existing.setTrustType(patch.getTrustType());
        existing.setTrustAbn(patch.getTrustAbn());
        existing.setEstablishmentDate(patch.getEstablishmentDate());
        existing.setAiComplianceReport(patch.getAiComplianceReport());
        existing.setAiRiskFlags(patch.getAiRiskFlags());
        return applicationRepo.save(existing);
    }

    @Transactional
    public TrustApplication updateStatus(Integer id, ApplicationStatus status) {
        TrustApplication application = getById(id);
        application.setStatus(status);
        return applicationRepo.save(application);
    }

    @Transactional
    public void delete(Integer id) {
        log.info("Deleting application id={}", id);
        applicationRepo.deleteById(id);
    }

    @Transactional
    public TrustApplication review(Integer id, ReviewRequest request) {
        log.info("Review action='{}' on application id={} by '{}'", request.action(), id, request.reviewedBy());
        TrustApplication app = getById(id);
        String action = request.action() == null ? "" : request.action().toLowerCase();

        switch (action) {
            case "submit" -> {
                if (app.getStatus() != ApplicationStatus.DRAFT)
                    throw new IllegalStateException("Only DRAFT applications can be submitted.");
                app.setStatus(ApplicationStatus.SUBMITTED);
                log.info("Application id={} submitted for review", id);
            }
            case "start_review" -> {
                if (app.getStatus() != ApplicationStatus.SUBMITTED)
                    throw new IllegalStateException("Only SUBMITTED applications can be reviewed.");
                app.setStatus(ApplicationStatus.UNDER_REVIEW);
                app.setReviewedBy(request.reviewedBy());
                app.setReviewedAt(LocalDateTime.now());
                log.info("Application id={} moved to UNDER_REVIEW by '{}'", id, request.reviewedBy());
            }
            case "approve" -> {
                if (app.getStatus() != ApplicationStatus.UNDER_REVIEW)
                    throw new IllegalStateException("Only applications UNDER_REVIEW can be approved.");
                app.setStatus(ApplicationStatus.APPROVED);
                app.setReviewNotes(request.notes());
                app.setReviewedBy(request.reviewedBy());
                app.setReviewedAt(LocalDateTime.now());
                log.info("Application id={} APPROVED by '{}'", id, request.reviewedBy());
            }
            case "reject" -> {
                if (app.getStatus() != ApplicationStatus.UNDER_REVIEW)
                    throw new IllegalStateException("Only applications UNDER_REVIEW can be rejected.");
                app.setStatus(ApplicationStatus.REJECTED);
                app.setReviewNotes(request.notes());
                app.setReviewedBy(request.reviewedBy());
                app.setReviewedAt(LocalDateTime.now());
                log.info("Application id={} REJECTED by '{}'", id, request.reviewedBy());
            }
            default -> {
                log.warn("Unknown review action='{}' for application id={}", request.action(), id);
                throw new IllegalArgumentException("Unknown review action: " + request.action());
            }
        }

        return applicationRepo.save(app);
    }

    // ── Trustees ──────────────────────────────────────────────────────────────

    public List<Trustee> getTrustees(Integer applicationId) {
        return trusteeRepo.findByApplicationId(applicationId);
    }

    @Transactional
    public Trustee addTrustee(Integer applicationId, Trustee trustee) {
        log.info("Adding trustee to application id={}", applicationId);
        TrustApplication application = getById(applicationId);
        trustee.setApplication(application);
        return trusteeRepo.save(trustee);
    }

    @Transactional
    public Trustee updateTrustee(Integer trusteeId, Trustee patch) {
        Trustee existing = trusteeRepo.findById(trusteeId)
                .orElseThrow(() -> new EntityNotFoundException("Trustee not found: " + trusteeId));
        existing.setTrusteeType(patch.getTrusteeType());
        existing.setFullName(patch.getFullName());
        existing.setDateOfBirth(patch.getDateOfBirth());
        existing.setTaxFileNumber(patch.getTaxFileNumber());
        existing.setCompanyName(patch.getCompanyName());
        existing.setAcn(patch.getAcn());
        existing.setEmail(patch.getEmail());
        existing.setPhone(patch.getPhone());
        existing.setAddress(patch.getAddress());
        return trusteeRepo.save(existing);
    }

    @Transactional
    public void deleteTrustee(Integer trusteeId) {
        trusteeRepo.deleteById(trusteeId);
    }

    // ── Beneficiaries ─────────────────────────────────────────────────────────

    public List<Beneficiary> getBeneficiaries(Integer applicationId) {
        return beneficiaryRepo.findByApplicationId(applicationId);
    }

    @Transactional
    public Beneficiary addBeneficiary(Integer applicationId, Beneficiary beneficiary) {
        TrustApplication application = getById(applicationId);
        beneficiary.setApplication(application);
        return beneficiaryRepo.save(beneficiary);
    }

    @Transactional
    public Beneficiary updateBeneficiary(Integer beneficiaryId, Beneficiary patch) {
        Beneficiary existing = beneficiaryRepo.findById(beneficiaryId)
                .orElseThrow(() -> new EntityNotFoundException("Beneficiary not found: " + beneficiaryId));
        existing.setFullName(patch.getFullName());
        existing.setRelationship(patch.getRelationship());
        existing.setDateOfBirth(patch.getDateOfBirth());
        existing.setEntitlementPercentage(patch.getEntitlementPercentage());
        existing.setIsPrimary(patch.getIsPrimary());
        return beneficiaryRepo.save(existing);
    }

    @Transactional
    public void deleteBeneficiary(Integer beneficiaryId) {
        beneficiaryRepo.deleteById(beneficiaryId);
    }
}
