package com.trustonboarding;

import com.trustonboarding.entity.*;
import com.trustonboarding.entity.TrustApplication.ApplicationStatus;
import com.trustonboarding.entity.TrustApplication.TrustType;
import com.trustonboarding.entity.Trustee.TrusteeType;
import com.trustonboarding.repository.TrustApplicationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final TrustApplicationRepository repo;

    public DataInitializer(TrustApplicationRepository repo) {
        this.repo = repo;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (repo.count() > 0) {
            log.info("Sample data already present, skipping initialisation.");
            return;
        }

        // ── 1. Individual/Family Trust (Approved) ─────────────────────────────
        TrustApplication chenFamily = new TrustApplication();
        chenFamily.setApplicationRef("APP-2026-001");
        chenFamily.setTrustType(TrustType.INDIVIDUAL_FAMILY);
        chenFamily.setTrustName("Chen Family Trust");
        chenFamily.setTrustAbn("12 345 678 901");
        chenFamily.setEstablishmentDate(LocalDate.of(2020, 3, 15));
        chenFamily.setStatus(ApplicationStatus.APPROVED);
        chenFamily.setAiComplianceReport("All checks passed. Identity verified, no sanctions or adverse media detected.");
        chenFamily.setAiRiskFlags("[]");

        Trustee sarahChen = new Trustee();
        sarahChen.setApplication(chenFamily);
        sarahChen.setTrusteeType(TrusteeType.INDIVIDUAL);
        sarahChen.setFullName("Sarah Chen");
        sarahChen.setDateOfBirth(LocalDate.of(1985, 4, 22));
        sarahChen.setTaxFileNumber("123 456 789");
        sarahChen.setEmail("sarah.chen@example.com");
        sarahChen.setPhone("+61 412 345 678");
        sarahChen.setAddress("42 Harbour View Rd, Mosman NSW 2088");
        chenFamily.getTrustees().add(sarahChen);

        Beneficiary jamesChen = new Beneficiary();
        jamesChen.setApplication(chenFamily);
        jamesChen.setFullName("James Chen");
        jamesChen.setRelationship("Spouse");
        jamesChen.setDateOfBirth(LocalDate.of(1983, 9, 10));
        jamesChen.setEntitlementPercentage(new BigDecimal("50.00"));
        jamesChen.setIsPrimary(true);
        chenFamily.getBeneficiaries().add(jamesChen);

        Beneficiary lilyChen = new Beneficiary();
        lilyChen.setApplication(chenFamily);
        lilyChen.setFullName("Lily Chen");
        lilyChen.setRelationship("Child");
        lilyChen.setDateOfBirth(LocalDate.of(2012, 2, 14));
        lilyChen.setEntitlementPercentage(new BigDecimal("50.00"));
        lilyChen.setIsPrimary(false);
        chenFamily.getBeneficiaries().add(lilyChen);

        repo.save(chenFamily);

        // ── 2. Charitable Trust (Under Review) ────────────────────────────────
        TrustApplication greenHope = new TrustApplication();
        greenHope.setApplicationRef("APP-2026-002");
        greenHope.setTrustType(TrustType.CHARITABLE);
        greenHope.setTrustName("Green Hope Foundation");
        greenHope.setTrustAbn("98 765 432 109");
        greenHope.setEstablishmentDate(LocalDate.of(2018, 6, 1));
        greenHope.setStatus(ApplicationStatus.UNDER_REVIEW);
        greenHope.setAiComplianceReport("Annual turnover exceeds AUD 5M threshold. Enhanced due diligence required.");
        greenHope.setAiRiskFlags("[{\"flag\":\"high_turnover\",\"severity\":\"medium\",\"confidence\":90}]");

        Trustee greenHopeTrustee = new Trustee();
        greenHopeTrustee.setApplication(greenHope);
        greenHopeTrustee.setTrusteeType(TrusteeType.CORPORATE);
        greenHopeTrustee.setCompanyName("Green Hope Pty Ltd");
        greenHopeTrustee.setAcn("001 234 567");
        greenHopeTrustee.setEmail("admin@greenhope.org.au");
        greenHopeTrustee.setPhone("+61 2 9876 5432");
        greenHopeTrustee.setAddress("Level 5, 100 Market St, Sydney NSW 2000");
        greenHope.getTrustees().add(greenHopeTrustee);

        Beneficiary envCommunity = new Beneficiary();
        envCommunity.setApplication(greenHope);
        envCommunity.setFullName("Australian Environmental Community");
        envCommunity.setRelationship("Charitable Object");
        envCommunity.setEntitlementPercentage(new BigDecimal("100.00"));
        envCommunity.setIsPrimary(true);
        greenHope.getBeneficiaries().add(envCommunity);

        CharitableTrustDetails charitableDetails = new CharitableTrustDetails();
        charitableDetails.setApplication(greenHope);
        charitableDetails.setAcncRegistrationNumber("CH-2018-00445");
        charitableDetails.setCharitablePurpose("Environmental conservation and sustainability education");
        charitableDetails.setOperatingState("NSW");
        charitableDetails.setAnnualTurnover(new BigDecimal("5800000.00"));
        greenHope.setCharitableDetails(charitableDetails);

        repo.save(greenHope);

        // ── 3. Superannuation Trust (Approved) ────────────────────────────────
        TrustApplication rioSurf = new TrustApplication();
        rioSurf.setApplicationRef("APP-2026-003");
        rioSurf.setTrustType(TrustType.SUPERANNUATION);
        rioSurf.setTrustName("Rio Surf SMSF");
        rioSurf.setTrustAbn("11 223 344 556");
        rioSurf.setEstablishmentDate(LocalDate.of(2015, 7, 1));
        rioSurf.setStatus(ApplicationStatus.APPROVED);
        rioSurf.setAiComplianceReport("All ATO compliance requirements met. Investment strategy on file. No issues detected.");
        rioSurf.setAiRiskFlags("[]");

        Trustee elenaPetrov = new Trustee();
        elenaPetrov.setApplication(rioSurf);
        elenaPetrov.setTrusteeType(TrusteeType.INDIVIDUAL);
        elenaPetrov.setFullName("Elena Petrov");
        elenaPetrov.setDateOfBirth(LocalDate.of(1975, 11, 3));
        elenaPetrov.setTaxFileNumber("987 654 321");
        elenaPetrov.setEmail("elena.petrov@example.com");
        elenaPetrov.setPhone("+61 408 111 222");
        elenaPetrov.setAddress("18 Beachfront Ave, Bondi Beach NSW 2026");
        rioSurf.getTrustees().add(elenaPetrov);

        Beneficiary elenaBen = new Beneficiary();
        elenaBen.setApplication(rioSurf);
        elenaBen.setFullName("Elena Petrov");
        elenaBen.setRelationship("Member");
        elenaBen.setEntitlementPercentage(new BigDecimal("100.00"));
        elenaBen.setIsPrimary(true);
        rioSurf.getBeneficiaries().add(elenaBen);

        SuperTrustDetails superDetails = new SuperTrustDetails();
        superDetails.setApplication(rioSurf);
        superDetails.setFundAbn("11 223 344 556");
        superDetails.setTrusteeType(TrusteeType.INDIVIDUAL);
        superDetails.setMemberCount(1);
        superDetails.setFundRegistrationDate(LocalDate.of(2015, 7, 1));
        superDetails.setInvestmentStrategy("Balanced growth — 60% equities, 30% fixed income, 10% cash");
        rioSurf.setSuperDetails(superDetails);

        repo.save(rioSurf);

        // ── 4. Individual/Family Trust (Rejected) ─────────────────────────────
        TrustApplication okaforTrust = new TrustApplication();
        okaforTrust.setApplicationRef("APP-2026-004");
        okaforTrust.setTrustType(TrustType.INDIVIDUAL_FAMILY);
        okaforTrust.setTrustName("Okafor Discretionary Trust");
        okaforTrust.setTrustAbn("55 667 788 990");
        okaforTrust.setEstablishmentDate(LocalDate.of(2022, 1, 10));
        okaforTrust.setStatus(ApplicationStatus.REJECTED);
        okaforTrust.setAiComplianceReport("Critical risk flags: trustee matches OFAC SDN list. Application rejected per compliance policy.");
        okaforTrust.setAiRiskFlags("[{\"flag\":\"sanctions_hit\",\"severity\":\"critical\",\"confidence\":94},{\"flag\":\"pep_flag\",\"severity\":\"high\",\"confidence\":88}]");

        Trustee michaelOkafor = new Trustee();
        michaelOkafor.setApplication(okaforTrust);
        michaelOkafor.setTrusteeType(TrusteeType.INDIVIDUAL);
        michaelOkafor.setFullName("Michael Okafor");
        michaelOkafor.setDateOfBirth(LocalDate.of(1965, 2, 14));
        michaelOkafor.setEmail("m.okafor@example.com");
        michaelOkafor.setPhone("+234 80 1234 5678");
        michaelOkafor.setAddress("12 Adeola Odeku St, Victoria Island, Lagos, Nigeria");
        okaforTrust.getTrustees().add(michaelOkafor);

        repo.save(okaforTrust);

        // ── 5. Individual/Family Trust (Submitted) ────────────────────────────
        TrustApplication sharmaFam = new TrustApplication();
        sharmaFam.setApplicationRef("APP-2026-005");
        sharmaFam.setTrustType(TrustType.INDIVIDUAL_FAMILY);
        sharmaFam.setTrustName("Sharma Family Trust");
        sharmaFam.setTrustAbn("33 445 566 778");
        sharmaFam.setEstablishmentDate(LocalDate.of(2024, 9, 5));
        sharmaFam.setStatus(ApplicationStatus.SUBMITTED);
        sharmaFam.setAiComplianceReport("High-risk jurisdiction and adverse media flags detected. Awaiting senior compliance review.");
        sharmaFam.setAiRiskFlags("[{\"flag\":\"high_risk_jurisdiction\",\"severity\":\"high\",\"confidence\":85},{\"flag\":\"adverse_media\",\"severity\":\"medium\",\"confidence\":62}]");

        Trustee priyaSharma = new Trustee();
        priyaSharma.setApplication(sharmaFam);
        priyaSharma.setTrusteeType(TrusteeType.INDIVIDUAL);
        priyaSharma.setFullName("Priya Sharma");
        priyaSharma.setDateOfBirth(LocalDate.of(1990, 9, 20));
        priyaSharma.setTaxFileNumber("456 789 012");
        priyaSharma.setEmail("priya.sharma@example.com");
        priyaSharma.setPhone("+61 404 567 890");
        priyaSharma.setAddress("7 Collins St, Melbourne VIC 3000");
        sharmaFam.getTrustees().add(priyaSharma);

        repo.save(sharmaFam);

        // ── 6. Individual/Family Trust (Under Review) ─────────────────────────
        TrustApplication kimTrust = new TrustApplication();
        kimTrust.setApplicationRef("APP-2026-006");
        kimTrust.setTrustType(TrustType.INDIVIDUAL_FAMILY);
        kimTrust.setTrustName("Kim Living Trust");
        kimTrust.setTrustAbn("77 889 900 112");
        kimTrust.setEstablishmentDate(LocalDate.of(2026, 4, 15));
        kimTrust.setStatus(ApplicationStatus.UNDER_REVIEW);
        kimTrust.setAiComplianceReport("Proof of address document missing from submission. All other checks passed.");
        kimTrust.setAiRiskFlags("[{\"flag\":\"missing_documents\",\"severity\":\"high\",\"confidence\":100}]");

        Trustee davidKim = new Trustee();
        davidKim.setApplication(kimTrust);
        davidKim.setTrusteeType(TrusteeType.INDIVIDUAL);
        davidKim.setFullName("David Kim");
        davidKim.setDateOfBirth(LocalDate.of(1985, 3, 1));
        davidKim.setEmail("david.kim@example.com");
        davidKim.setPhone("+61 411 234 567");
        davidKim.setAddress("123 Queen St, Brisbane QLD 4000");
        kimTrust.getTrustees().add(davidKim);

        repo.save(kimTrust);

        log.info("Seeded {} sample trust applications.", repo.count());
    }
}
