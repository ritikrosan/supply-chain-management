package com.example.scm.controller;

import com.example.scm.entity.Supplier;
import com.example.scm.service.SupplierService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Optional;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    private final SupplierService supplierService;
    private static final Logger log = LoggerFactory.getLogger(SupplierController.class);

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @GetMapping
    public ResponseEntity<List<Supplier>> list() {
        return ResponseEntity.ok(supplierService.findAll());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        String name = body != null && body.get("name") != null ? String.valueOf(body.get("name")) : null;
        String email = body != null && body.get("email") != null ? String.valueOf(body.get("email")) : null;
        String phone = body != null && body.get("phone") != null ? String.valueOf(body.get("phone")) : null;
        log.info("POST /api/suppliers payload(map) -> name='{}', email='{}', phone='{}'", name, email, phone);

        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Supplier name is required"));
        }
        Supplier s = new Supplier();
        s.setName(name);
        s.setEmail(email);
        s.setPhone(phone);
        return ResponseEntity.ok(supplierService.create(s));
    }

    @PostMapping("/auth")
    public ResponseEntity<?> authenticate(@RequestBody Map<String, Object> body) {
        String email = body != null && body.get("email") != null ? String.valueOf(body.get("email")) : null;
        String phone = body != null && body.get("phone") != null ? String.valueOf(body.get("phone")) : null;
        log.info("POST /api/suppliers/auth -> email='{}', phone='{}'", email, phone);
        Optional<Supplier> supplier = supplierService.authenticate(email, phone);
        return supplier.<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(401).body(Map.of("message", "Invalid supplier credentials")));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Supplier> update(@PathVariable Long id, @RequestBody Supplier supplier) {
        return ResponseEntity.ok(supplierService.update(id, supplier));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        supplierService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
