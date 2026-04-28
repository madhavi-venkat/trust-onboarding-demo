package com.trustonboarding.repository;

import com.trustonboarding.entity.Trustee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrusteeRepository extends JpaRepository<Trustee, Integer> {
    List<Trustee> findByApplicationId(Integer applicationId);
}
