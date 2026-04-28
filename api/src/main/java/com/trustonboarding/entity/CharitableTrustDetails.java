package com.trustonboarding.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "charitable_trust_details")
public class CharitableTrustDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    @JsonIgnore
    private TrustApplication application;

    @Column(name = "acnc_registration_number", length = 50)
    private String acncRegistrationNumber;

    @Column(name = "charitable_purpose", columnDefinition = "TEXT")
    private String charitablePurpose;

    @Column(name = "operating_state", length = 50)
    private String operatingState;

    @Column(name = "annual_turnover", precision = 15, scale = 2)
    private BigDecimal annualTurnover;

    public CharitableTrustDetails() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public TrustApplication getApplication() { return application; }
    public void setApplication(TrustApplication application) { this.application = application; }

    public String getAcncRegistrationNumber() { return acncRegistrationNumber; }
    public void setAcncRegistrationNumber(String acncRegistrationNumber) { this.acncRegistrationNumber = acncRegistrationNumber; }

    public String getCharitablePurpose() { return charitablePurpose; }
    public void setCharitablePurpose(String charitablePurpose) { this.charitablePurpose = charitablePurpose; }

    public String getOperatingState() { return operatingState; }
    public void setOperatingState(String operatingState) { this.operatingState = operatingState; }

    public BigDecimal getAnnualTurnover() { return annualTurnover; }
    public void setAnnualTurnover(BigDecimal annualTurnover) { this.annualTurnover = annualTurnover; }
}
