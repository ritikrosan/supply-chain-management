package com.example.scm.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class RootController {

    @GetMapping(path = "/api", produces = MediaType.TEXT_PLAIN_VALUE)
    public String apiRoot() {
        return "SCM API running. Try /api/products or /api/suppliers";
    }

    @GetMapping(path = "/api/health", produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, String> health() {
        return Map.of("status", "UP");
    }
}
