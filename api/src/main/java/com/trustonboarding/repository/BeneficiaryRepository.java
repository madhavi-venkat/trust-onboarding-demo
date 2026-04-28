package com.trustonboarding.repository;

import com.trustonboarding.entity.Beneficiary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BeneficiaryRepository extends JpaRepository<Beneficiary, Integer> {
    List<Beneficiary> findByApplicationId(Integer applicationId);
}
