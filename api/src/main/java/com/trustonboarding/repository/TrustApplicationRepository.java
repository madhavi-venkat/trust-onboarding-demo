package com.trustonboarding.repository;

import com.trustonboarding.entity.TrustApplication;
import com.trustonboarding.entity.TrustApplication.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrustApplicationRepository extends JpaRepository<TrustApplication, Integer> {

    List<TrustApplication> findByStatus(ApplicationStatus status);
}
