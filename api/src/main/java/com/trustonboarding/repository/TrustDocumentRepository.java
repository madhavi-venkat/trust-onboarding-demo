package com.trustonboarding.repository;

import com.trustonboarding.entity.TrustDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrustDocumentRepository extends JpaRepository<TrustDocument, Integer> {
    List<TrustDocument> findByApplicationIdOrderByUploadedAtDesc(Integer applicationId);
}
