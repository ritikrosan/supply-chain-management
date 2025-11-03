package com.example.scm.service;

import com.example.scm.entity.Inventory;
import com.example.scm.entity.Product;
import com.example.scm.repository.InventoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    public InventoryService(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    public List<Inventory> findAll() {
        return inventoryRepository.findAll();
    }

    @Transactional
    public Inventory increment(Product product, int qty) {
        Inventory inv = inventoryRepository.findByProduct(product)
                .orElseGet(() -> {
                    Inventory i = new Inventory();
                    i.setProduct(product);
                    i.setQuantity(0);
                    return i;
                });
        inv.setQuantity(inv.getQuantity() + qty);
        return inventoryRepository.save(inv);
    }
}
