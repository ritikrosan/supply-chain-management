package com.example.scm.service;

import com.example.scm.entity.*;
import com.example.scm.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class PurchaseOrderService {

    private final PurchaseOrderRepository poRepository;
    private final PurchaseOrderItemRepository poiRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final InventoryService inventoryService;

    public PurchaseOrderService(PurchaseOrderRepository poRepository,
                                PurchaseOrderItemRepository poiRepository,
                                ProductRepository productRepository,
                                SupplierRepository supplierRepository,
                                InventoryService inventoryService) {
        this.poRepository = poRepository;
        this.poiRepository = poiRepository;
        this.productRepository = productRepository;
        this.supplierRepository = supplierRepository;
        this.inventoryService = inventoryService;
    }

    public List<PurchaseOrder> findAll() { return poRepository.findAll(); }

    public PurchaseOrder findById(Long id) { return poRepository.findById(id).orElseThrow(); }

    public List<PurchaseOrder> findBySupplier(Long supplierId) {
        return poRepository.findBySupplier_Id(supplierId);
    }

    @Transactional
    public PurchaseOrder createDraft(String orderNumber, Long supplierId, LocalDate expectedDate) {
        Supplier supplier = supplierRepository.findById(supplierId).orElseThrow();
        PurchaseOrder po = new PurchaseOrder();
        po.setOrderNumber(orderNumber);
        po.setSupplier(supplier);
        po.setExpectedDate(expectedDate);
        po.setStatus(PurchaseOrderStatus.DRAFT);
        return poRepository.save(po);
    }

    @Transactional
    public PurchaseOrder addItem(Long poId, Long productId, int quantity, Double unitPrice) {
        if (poId == null) throw new IllegalArgumentException("Purchase order id is required");
        if (productId == null) throw new IllegalArgumentException("Product id is required");
        if (quantity <= 0) throw new IllegalArgumentException("Quantity must be greater than 0");

        PurchaseOrder po = poRepository.findById(poId)
                .orElseThrow(() -> new IllegalArgumentException("Purchase order not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        PurchaseOrderItem item = new PurchaseOrderItem();
        item.setPurchaseOrder(po);
        item.setProduct(product);
        item.setQuantity(quantity);
        item.setUnitPrice(unitPrice != null ? unitPrice : product.getUnitPrice());
        poiRepository.save(item);
        po.getItems().add(item);
        return po;
    }

    @Transactional
    public PurchaseOrder submit(Long poId) {
        PurchaseOrder po = poRepository.findById(poId).orElseThrow();
        po.setStatus(PurchaseOrderStatus.SUBMITTED);
        return poRepository.save(po);
    }

    @Transactional
    public PurchaseOrder receive(Long poId) {
        PurchaseOrder po = poRepository.findById(poId).orElseThrow();
        int fullyReceived = 0;
        for (PurchaseOrderItem item : po.getItems()) {
            int toReceive = item.getQuantity() - item.getReceivedQuantity();
            if (toReceive > 0) {
                item.setReceivedQuantity(item.getQuantity());
                poiRepository.save(item);
                inventoryService.increment(item.getProduct(), toReceive);
            }
            if (item.getReceivedQuantity() >= item.getQuantity()) {
                fullyReceived++;
            }
        }
        po.setReceivedDate(LocalDate.now());
        po.setStatus(fullyReceived == po.getItems().size() ? PurchaseOrderStatus.RECEIVED : PurchaseOrderStatus.PARTIALLY_RECEIVED);
        return poRepository.save(po);
    }
}
