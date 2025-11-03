package com.example.scm.service;

import com.example.scm.entity.Product;
import com.example.scm.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> findAll() { return productRepository.findAll(); }

    public Product create(Product p) { return productRepository.save(p); }

    public Product update(Long id, Product p) {
        p.setId(id);
        return productRepository.save(p);
    }

    public void delete(Long id) { productRepository.deleteById(id); }
}
