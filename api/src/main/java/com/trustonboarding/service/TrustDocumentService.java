package com.trustonboarding.service;

import com.trustonboarding.entity.TrustApplication;
import com.trustonboarding.entity.TrustDocument;
import com.trustonboarding.entity.TrustDocument.DocumentType;
import com.trustonboarding.repository.TrustApplicationRepository;
import com.trustonboarding.repository.TrustDocumentRepository;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;

@Service
public class TrustDocumentService {

    private static final Logger log = LoggerFactory.getLogger(TrustDocumentService.class);

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    private final TrustDocumentRepository documentRepo;
    private final TrustApplicationRepository applicationRepo;

    public TrustDocumentService(TrustDocumentRepository documentRepo,
                                TrustApplicationRepository applicationRepo) {
        this.documentRepo = documentRepo;
        this.applicationRepo = applicationRepo;
    }

    public List<TrustDocument> getDocuments(Integer applicationId) {
        log.debug("Fetching documents for application id={}", applicationId);
        List<TrustDocument> docs = documentRepo.findByApplicationIdOrderByUploadedAtDesc(applicationId);
        log.debug("Found {} document(s) for application id={}", docs.size(), applicationId);
        return docs;
    }

    @Transactional
    public TrustDocument upload(Integer applicationId, MultipartFile file,
                                DocumentType documentType) throws IOException {
        log.info("Uploading document type={} file='{}' size={} for application id={}",
                documentType, file.getOriginalFilename(), file.getSize(), applicationId);

        TrustApplication application = applicationRepo.findById(applicationId)
                .orElseThrow(() -> {
                    log.warn("Upload failed — application not found: id={}", applicationId);
                    return new EntityNotFoundException("Application not found: " + applicationId);
                });

        Path dir = Paths.get(uploadDir, applicationId.toString());
        Files.createDirectories(dir);
        log.debug("Upload directory: {}", dir.toAbsolutePath());

        String originalName = file.getOriginalFilename();
        String storedName   = System.currentTimeMillis() + "_" + originalName;
        Path   filePath     = dir.resolve(storedName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        log.debug("File saved to: {}", filePath.toAbsolutePath());

        TrustDocument doc = new TrustDocument();
        doc.setApplication(application);
        doc.setDocumentType(documentType);
        doc.setFileName(originalName);
        doc.setFilePath(filePath.toAbsolutePath().toString());

        TrustDocument saved = documentRepo.save(doc);
        log.info("Document saved id={} file='{}' application id={}", saved.getId(), originalName, applicationId);
        return saved;
    }

    public ResponseEntity<Resource> download(Integer id) {
        return serveFile(id, "attachment");
    }

    public ResponseEntity<Resource> view(Integer id) {
        return serveFile(id, "inline");
    }

    private ResponseEntity<Resource> serveFile(Integer id, String disposition) {
        log.debug("Serving file id={} disposition={}", id, disposition);
        TrustDocument doc = documentRepo.findById(id)
                .orElseThrow(() -> {
                    log.warn("Document not found: id={}", id);
                    return new EntityNotFoundException("Document not found: " + id);
                });

        Resource resource = new FileSystemResource(doc.getFilePath());
        if (!resource.exists()) {
            log.error("File missing on disk: id={} path='{}' name='{}'", id, doc.getFilePath(), doc.getFileName());
            throw new EntityNotFoundException("File not found on disk: " + doc.getFileName());
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        disposition + "; filename=\"" + doc.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(detectContentType(doc.getFileName())))
                .body(resource);
    }

    private String detectContentType(String fileName) {
        if (fileName == null) return "application/octet-stream";
        String f = fileName.toLowerCase();
        if (f.endsWith(".pdf"))               return "application/pdf";
        if (f.endsWith(".png"))               return "image/png";
        if (f.endsWith(".jpg") || f.endsWith(".jpeg")) return "image/jpeg";
        if (f.endsWith(".gif"))               return "image/gif";
        if (f.endsWith(".webp"))              return "image/webp";
        if (f.endsWith(".txt"))               return "text/plain";
        if (f.endsWith(".doc"))               return "application/msword";
        if (f.endsWith(".docx"))              return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        return "application/octet-stream";
    }

    @Transactional
    public void delete(Integer id) throws IOException {
        log.info("Deleting document id={}", id);
        TrustDocument doc = documentRepo.findById(id)
                .orElseThrow(() -> {
                    log.warn("Delete failed — document not found: id={}", id);
                    return new EntityNotFoundException("Document not found: " + id);
                });

        boolean deleted = Files.deleteIfExists(Paths.get(doc.getFilePath()));
        if (!deleted) log.warn("File was not on disk during delete: path='{}'", doc.getFilePath());
        documentRepo.delete(doc);
        log.info("Document deleted id={} file='{}'", id, doc.getFileName());
    }
}
