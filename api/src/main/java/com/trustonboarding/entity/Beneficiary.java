package com.trustonboarding.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "beneficiaries")
public class Beneficiary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    @JsonIgnore
    private TrustApplication application;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(length = 100)
    private String relationship;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "entitlement_percentage", precision = 5, scale = 2)
    private BigDecimal entitlementPercentage;

    @Column(name = "is_primary")
    private Boolean isPrimary = false;

    public Beneficiary() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public TrustApplication getApplication() { return application; }
    public void setApplication(TrustApplication application) { this.application = application; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRelationship() { return relationship; }
    public void setRelationship(String relationship) { this.relationship = relationship; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public BigDecimal getEntitlementPercentage() { return entitlementPercentage; }
    public void setEntitlementPercentage(BigDecimal entitlementPercentage) { this.entitlementPercentage = entitlementPercentage; }

    public Boolean getIsPrimary() { return isPrimary; }
    public void setIsPrimary(Boolean isPrimary) { this.isPrimary = isPrimary; }
}
