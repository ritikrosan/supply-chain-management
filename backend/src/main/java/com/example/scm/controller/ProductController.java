package com.example.scm.controller;

import com.example.scm.entity.Product;
import com.example.scm.entity.Supplier;
import com.example.scm.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    private static final Logger log = LoggerFactory.getLogger(ProductController.class);

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<Product>> list() {
        return ResponseEntity.ok(productService.findAll());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        String sku = body != null && body.get("sku") != null ? String.valueOf(body.get("sku")) : null;
        String name = body != null && body.get("name") != null ? String.valueOf(body.get("name")) : null;
        String description = body != null && body.get("description") != null ? String.valueOf(body.get("description")) : null;
        Double unitPrice = null;
        try {
            if (body != null && body.get("unitPrice") != null) {
                unitPrice = Double.valueOf(String.valueOf(body.get("unitPrice")));
            }
        } catch (NumberFormatException ignore) {}

        Long supplierId = null;
        Object supplierObj = body != null ? body.get("supplier") : null;
        if (supplierObj instanceof Map<?,?> m) {
            Object sid = m.get("id");
            if (sid != null) {
                try { supplierId = Long.valueOf(String.valueOf(sid)); } catch (NumberFormatException ignore) {}
            }
        }

        log.info("POST /api/products -> sku='{}', name='{}', unitPrice={}, supplierId={}", sku, name, unitPrice, supplierId);

        if (sku == null || sku.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "SKU is required"));
        }
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Product name is required"));
        }

        Product p = new Product();
        p.setSku(sku);
        p.setName(name);
        p.setDescription(description);
        p.setUnitPrice(unitPrice);
        if (supplierId != null) {
            Supplier s = new Supplier();
            s.setId(supplierId);
            p.setSupplier(s);
        }
        return ResponseEntity.ok(productService.create(p));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> update(@PathVariable Long id, @RequestBody Product product) {
        return ResponseEntity.ok(productService.update(id, product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
