package com.peerlearn.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificationService.class);

    public boolean isSmtpConfigured() {
        return false;
    }

    public void sendPlainEmail(String toEmail, String subject, String body, String logLabel) {
        log.info("[Local Dev] Email disabled. {} not dispatched | To: {} | Subject: {}", logLabel, toEmail, subject);
    }
}
