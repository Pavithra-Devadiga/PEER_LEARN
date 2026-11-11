package com.peerlearn.service;

import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
public class EmailNotificationService {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificationService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${app.mail.from:noreply@peerlearn.local}")
    private String mailFrom;

    @Value("${app.mail.from-name:PeerLearn}")
    private String mailFromName;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public boolean isSmtpConfigured() {
        return mailSender != null
            && mailHost != null && !mailHost.isBlank()
            && mailUsername != null && !mailUsername.isBlank()
            && !"yourgmail@gmail.com".equalsIgnoreCase(mailUsername.trim())
            && mailPassword != null && !mailPassword.isBlank()
            && !"REPLACE_WITH_16_CHAR_APP_PASSWORD".equals(mailPassword.trim());
    }

    @Async
    public void sendWelcomeEmail(String toEmail, String fullName, String authProvider) {
        String providerLabel = (authProvider != null && !"LOCAL".equalsIgnoreCase(authProvider))
            ? "via " + authProvider
            : "with your email";

        String subject = "Welcome to PeerLearn — Learn One Skill, Teach Another";
        String body = "Hi " + (fullName != null ? fullName : "there") + ",\n\n"
            + "Welcome to PeerLearn! Your account has been successfully registered " + providerLabel + ".\n\n"
            + "Here is what you can explore next:\n"
            + "• Browse affordable peer-led sessions across Coding, Design, Languages & Music\n"
            + "• Switch between Student and Tutor modes anytime from the top bar\n"
            + "• Practice topic quizzes after each completed class and explore community guides\n\n"
            + "Open PeerLearn: " + frontendUrl + "\n\n"
            + "Happy learning,\nThe PeerLearn Team";

        sendPlainEmail(toEmail, subject, body, "Welcome email");
    }

    public void sendPlainEmail(String toEmail, String subject, String body, String logLabel) {
        if (toEmail == null || toEmail.isBlank()) return;

        String senderAddress = resolveSenderAddress();
        if (isSmtpConfigured() && !senderAddress.isBlank()) {
            try {
                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false, StandardCharsets.UTF_8.name());
                String displayName = (mailFromName != null && !mailFromName.isBlank()) ? mailFromName.trim() : "PeerLearn";
                helper.setFrom(new InternetAddress(senderAddress, displayName, StandardCharsets.UTF_8.name()));
                helper.setTo(toEmail);
                helper.setSubject(subject);
                helper.setText(body, false);
                mailSender.send(mimeMessage);
                log.info("{} sent via SMTP to {} (from {} <{}>)", logLabel, toEmail, displayName, senderAddress);
            } catch (Exception ex) {
                log.warn("Could not send {} to {} via {}: {}", logLabel, toEmail, mailHost, ex.getMessage());
            }
        } else {
            log.info(
                "[Dev Mail Log] {} NOT sent to real inbox because MAIL_HOST / spring.mail.host is empty | To: {} | Subject: {}",
                logLabel,
                toEmail,
                subject
            );
        }
    }

    private String resolveSenderAddress() {
        if (mailFrom != null && !mailFrom.isBlank() && !mailFrom.trim().endsWith(".local")) {
            return mailFrom.trim();
        }
        return mailUsername != null ? mailUsername.trim() : "";
    }
}
