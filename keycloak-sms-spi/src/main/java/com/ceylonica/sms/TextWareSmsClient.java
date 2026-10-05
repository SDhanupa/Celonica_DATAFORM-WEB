package com.ceylonica.sms;

import org.jboss.logging.Logger;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

public class TextWareSmsClient {
    private static final Logger logger = Logger.getLogger(TextWareSmsClient.class);
    private static final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    public static boolean sendSms(String username, String password, String senderId, String mobileNumber, String message) {
        try {
            // Clean mobile number - format required by TextWare
            // E.g. +94771234567 should be 94771234567, 0771234567 should be 94771234567
            String formattedMobile = mobileNumber.replaceAll("[^0-9]", "");
            if (formattedMobile.startsWith("0")) {
                formattedMobile = "94" + formattedMobile.substring(1);
            }

            String url = String.format("https://msg.text-ware.com/send_sms.php?username=%s&password=%s&src=%s&dst=%s&msg=%s&dr=1",
                    URLEncoder.encode(username, StandardCharsets.UTF_8),
                    URLEncoder.encode(password, StandardCharsets.UTF_8),
                    URLEncoder.encode(senderId, StandardCharsets.UTF_8),
                    URLEncoder.encode(formattedMobile, StandardCharsets.UTF_8),
                    URLEncoder.encode(message, StandardCharsets.UTF_8));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(5))
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            String responseBody = response.body() != null ? response.body().trim() : "";

            if (response.statusCode() == 200) {
                // TextWare returns 200 even for errors like credit_over, invalid_sender, etc.
                // We must check the response body too.
                if (responseBody.startsWith("credit_over")) {
                    logger.errorf("SMS failed - account has no credit (credit_over). Please top up TextWare account for user %s", username);
                    return false;
                } else if (responseBody.startsWith("invalid_sender")) {
                    logger.errorf("SMS failed - invalid sender ID: %s", senderId);
                    return false;
                } else if (responseBody.startsWith("invalid_") || responseBody.contains("error")) {
                    logger.errorf("SMS failed with response: %s", responseBody);
                    return false;
                }
                logger.infof("Successfully dispatched SMS to %s, Response: %s", formattedMobile, responseBody);
                return true;
            } else {
                logger.errorf("Failed to send SMS to %s, Status Code: %d, Response: %s", formattedMobile, response.statusCode(), responseBody);
                return false;
            }

        } catch (Exception e) {
            logger.error("Exception occurred while sending SMS", e);
            return false;
        }
    }
}
