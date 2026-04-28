package com.trustonboarding.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "trust_applications")
public class TrustApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "application_ref", unique = true, nullable = false, length = 20)
    private String applicationRef;

    @Enumerated(EnumType.STRING)
    @Column(name = "trust_type", nullable = false, length = 30)
    private TrustType trustType;

    @Column(name = "trust_name", nullable = false)
    private String trustName;

    @Column(name = "trust_abn", length = 20)
    private String trustAbn;

    @Column(name = "establishment_date")
    private LocalDate establishmentDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApplicationStatus status = ApplicationStatus.DRAFT;

    @Column(name = "ai_compliance_report", columnDefinition = "TEXT")
    private String aiComplianceReport;

    @Column(name = "ai_risk_flags", columnDefinition = "TEXT")
    private String aiRiskFlags;

    @Column(name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes;

    @Column(name = "reviewed_by", length = 255)
    private String reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Trustee> trustees = new ArrayList<>();

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Beneficiary> beneficiaries = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TrustDocument> documents = new ArrayList<>();

    @JsonIgnore
    @OneToOne(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private CharitableTrustDetails charitableDetails;

    @JsonIgnore
    @OneToOne(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private SuperTrustDetails superDetails;

    @PrePersist
    void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getApplicationRef() { return applicationRef; }
    public void setApplicationRef(String applicationRef) { this.applicationRef = applicationRef; }

    public TrustType getTrustType() { return trustType; }
    public void setTrustType(TrustType trustType) { this.trustType = trustType; }

    public String getTrustName() { return trustName; }
    public void setTrustName(String trustName) { this.trustName = trustName; }

    public String getTrustAbn() { return trustAbn; }
    public void setTrustAbn(String trustAbn) { this.trustAbn = trustAbn; }

    public LocalDate getEstablishmentDate() { return establishmentDate; }
    public void setEstablishmentDate(LocalDate establishmentDate) { this.establishmentDate = establishmentDate; }

    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }

    public String getAiComplianceReport() { return aiComplianceReport; }
    public void setAiComplianceReport(String aiComplianceReport) { this.aiComplianceReport = aiComplianceReport; }

    public String getAiRiskFlags() { return aiRiskFlags; }
    public void setAiRiskFlags(String aiRiskFlags) { this.aiRiskFlags = aiRiskFlags; }

    public String getReviewNotes() { return reviewNotes; }
    public void setReviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; }

    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<Trustee> getTrustees() { return trustees; }
    public void setTrustees(List<Trustee> trustees) { this.trustees = trustees; }

    public List<Beneficiary> getBeneficiaries() { return beneficiaries; }
    public void setBeneficiaries(List<Beneficiary> beneficiaries) { this.beneficiaries = beneficiaries; }

    public List<TrustDocument> getDocuments() { return documents; }

    public CharitableTrustDetails getCharitableDetails() { return charitableDetails; }
    public void setCharitableDetails(CharitableTrustDetails charitableDetails) { this.charitableDetails = charitableDetails; }

    public SuperTrustDetails getSuperDetails() { return superDetails; }
    public void setSuperDetails(SuperTrustDetails superDetails) { this.superDetails = superDetails; }

    public enum TrustType { INDIVIDUAL_FAMILY, CHARITABLE, SUPERANNUATION }
    public enum ApplicationStatus { DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED }
}
