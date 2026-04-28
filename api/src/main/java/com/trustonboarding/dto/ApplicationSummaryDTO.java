package com.trustonboarding.dto;

import com.trustonboarding.entity.TrustApplication.ApplicationStatus;
import com.trustonboarding.entity.TrustApplication.TrustType;

import java.time.LocalDateTime;

public record ApplicationSummaryDTO(
        Integer id,
        String applicationRef,
        String trustName,
        TrustType trustType,
        ApplicationStatus status,
        int trusteeCount,
        int beneficiaryCount,
        String aiRiskFlags,
        LocalDateTime createdAt
) {}
