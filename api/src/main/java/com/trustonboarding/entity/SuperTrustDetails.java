package com.trustonboarding.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "super_trust_details")
public class SuperTrustDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    @JsonIgnore
    private TrustApplication application;

    @Column(name = "fund_abn", length = 20)
    private String fundAbn;

    @Enumerated(EnumType.STRING)
    @Column(name = "trustee_type", nullable = false, length = 15)
    private Trustee.TrusteeType trusteeType;

    @Column(name = "member_count")
    private Integer memberCount;

    @Column(name = "fund_registration_date")
    private LocalDate fundRegistrationDate;

    @Column(name = "investment_strategy", columnDefinition = "TEXT")
    private String investmentStrategy;

    public SuperTrustDetails() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public TrustApplication getApplication() { return application; }
    public void setApplication(TrustApplication application) { this.application = application; }

    public String getFundAbn() { return fundAbn; }
    public void setFundAbn(String fundAbn) { this.fundAbn = fundAbn; }

    public Trustee.TrusteeType getTrusteeType() { return trusteeType; }
    public void setTrusteeType(Trustee.TrusteeType trusteeType) { this.trusteeType = trusteeType; }

    public Integer getMemberCount() { return memberCount; }
    public void setMemberCount(Integer memberCount) { this.memberCount = memberCount; }

    public LocalDate getFundRegistrationDate() { return fundRegistrationDate; }
    public void setFundRegistrationDate(LocalDate fundRegistrationDate) { this.fundRegistrationDate = fundRegistrationDate; }

    public String getInvestmentStrategy() { return investmentStrategy; }
    public void setInvestmentStrategy(String investmentStrategy) { this.investmentStrategy = investmentStrategy; }
}
