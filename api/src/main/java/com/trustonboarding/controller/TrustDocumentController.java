package com.trustonboarding.controller;

import com.trustonboarding.entity.TrustDocument;
import com.trustonboarding.entity.TrustDocument.DocumentType;
import com.trustonboarding.service.TrustDocumentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
public class TrustDocumentController {

    private static final Logger log = LoggerFactory.getLogger(TrustDocumentController.class);

    private final TrustDocumentService documentService;

    public TrustDocumentController(TrustDocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping("/api/applications/{applicationId}/documents")
    public List<TrustDocument> list(@PathVariable Integer applicationId) {
        log.debug("GET /api/applications/{}/documents", applicationId);
        return documentService.getDocuments(applicationId);
    }

    @PostMapping(value = "/api/applications/{applicationId}/documents",
                 consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public TrustDocument upload(
            @PathVariable Integer applicationId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") DocumentType documentType) throws IOException {
        log.info("POST /api/applications/{}/documents file='{}' type={}", applicationId, file.getOriginalFilename(), documentType);
        return documentService.upload(applicationId, file, documentType);
    }

    @GetMapping("/api/documents/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Integer id) {
        log.info("GET /api/documents/{}/download", id);
        return documentService.download(id);
    }

    @GetMapping("/api/documents/{id}/view")
    public ResponseEntity<Resource> view(@PathVariable Integer id) {
        log.info("GET /api/documents/{}/view", id);
        return documentService.view(id);
    }

    @DeleteMapping("/api/documents/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) throws IOException {
        log.info("DELETE /api/documents/{}", id);
        documentService.delete(id);
    }
}
