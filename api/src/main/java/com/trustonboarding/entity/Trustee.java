package com.trustonboarding.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "trustees")
public class Trustee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    @JsonIgnore
    private TrustApplication application;

    @Enumerated(EnumType.STRING)
    @Column(name = "trustee_type", nullable = false, length = 15)
    private TrusteeType trusteeType;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "tax_file_number", length = 20)
    private String taxFileNumber;

    @Column(name = "company_name")
    private String companyName;

    @Column(length = 20)
    private String acn;

    private String email;

    @Column(length = 20)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String address;

    public Trustee() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public TrustApplication getApplication() { return application; }
    public void setApplication(TrustApplication application) { this.application = application; }

    public TrusteeType getTrusteeType() { return trusteeType; }
    public void setTrusteeType(TrusteeType trusteeType) { this.trusteeType = trusteeType; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getTaxFileNumber() { return taxFileNumber; }
    public void setTaxFileNumber(String taxFileNumber) { this.taxFileNumber = taxFileNumber; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getAcn() { return acn; }
    public void setAcn(String acn) { this.acn = acn; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public enum TrusteeType { INDIVIDUAL, CORPORATE }
}
