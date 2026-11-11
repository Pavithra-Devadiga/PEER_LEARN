package com.peerlearn;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class PeerLearnApplication {
    public static void main(String[] args) {
        SpringApplication.run(PeerLearnApplication.class, args);
    }
}
