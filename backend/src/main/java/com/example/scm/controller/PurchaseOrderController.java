package com.example.scm.controller;

import com.example.scm.entity.PurchaseOrder;
import com.example.scm.service.PurchaseOrderService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/purchase-orders")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;
    private static final Logger log = LoggerFactory.getLogger(PurchaseOrderController.class);

    public PurchaseOrderController(PurchaseOrderService purchaseOrderService) {
        this.purchaseOrderService = purchaseOrderService;
    }

    @GetMapping
    public ResponseEntity<List<PurchaseOrder>> list() {
        return ResponseEntity.ok(purchaseOrderService.findAll());
    }

    @GetMapping("/by-supplier")
    public ResponseEntity<List<PurchaseOrder>> listBySupplier(@RequestParam("supplierId") Long supplierId) {
        return ResponseEntity.ok(purchaseOrderService.findBySupplier(supplierId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrder> get(@PathVariable("id") Long id) {
        return ResponseEntity.ok(purchaseOrderService.findById(id));
    }

    @PostMapping("/draft")
    public ResponseEntity<?> createDraft(@RequestBody Map<String, Object> body) {
        String orderNumber = body != null ? (String) body.get("orderNumber") : null;
        Number supplierIdNum = body != null ? (Number) body.get("supplierId") : null;
        Long supplierId = supplierIdNum != null ? supplierIdNum.longValue() : null;
        String expectedDateStr = body != null ? (String) body.get("expectedDate") : null;

        LocalDate expectedDate = null;
        if (expectedDateStr != null && !expectedDateStr.isBlank()) {
            // Accept both ISO (yyyy-MM-dd) and common UI (dd-MM-yyyy)
            DateTimeFormatter[] fmts = new DateTimeFormatter[] {
                    DateTimeFormatter.ISO_LOCAL_DATE,
                    DateTimeFormatter.ofPattern("dd-MM-yyyy")
            };
            for (DateTimeFormatter f : fmts) {
                try { expectedDate = LocalDate.parse(expectedDateStr, f); break; }
                catch (DateTimeParseException ignore) {}
            }
            if (expectedDate == null) {
                log.warn("Invalid expectedDate format: '{}'", expectedDateStr);
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid expectedDate. Use yyyy-MM-dd or dd-MM-yyyy"));
            }
        }

        if (orderNumber == null || orderNumber.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Order number is required"));
        }
        if (supplierId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Supplier is required"));
        }
        log.info("Create draft -> orderNumber='{}', supplierId={}, expectedDate={} ", orderNumber, supplierId, expectedDate);
        return ResponseEntity.ok(purchaseOrderService.createDraft(orderNumber, supplierId, expectedDate));
    }

    @PostMapping("/{poId}/items")
    public ResponseEntity<PurchaseOrder> addItem(@PathVariable("poId") Long poId, @RequestBody Map<String, Object> body) {
        Number productIdNum = (Number) body.get("productId");
        Long productId = productIdNum != null ? productIdNum.longValue() : null;
        Number qtyNum = (Number) body.get("quantity");
        int quantity = qtyNum != null ? qtyNum.intValue() : 0;
        Number priceNum = (Number) body.get("unitPrice");
        Double unitPrice = priceNum != null ? priceNum.doubleValue() : null;
        log.info("Add item -> poId={}, productId={}, qty={}, unitPrice={} ", poId, productId, quantity, unitPrice);
        return ResponseEntity.ok(purchaseOrderService.addItem(poId, productId, quantity, unitPrice));
    }

    @PostMapping("/{poId}/submit")
    public ResponseEntity<PurchaseOrder> submit(@PathVariable("poId") Long poId) {
        return ResponseEntity.ok(purchaseOrderService.submit(poId));
    }

    @PostMapping("/{poId}/receive")
    public ResponseEntity<PurchaseOrder> receive(@PathVariable("poId") Long poId) {
        return ResponseEntity.ok(purchaseOrderService.receive(poId));
    }
}
