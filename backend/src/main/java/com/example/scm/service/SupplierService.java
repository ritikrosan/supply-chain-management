package com.example.scm.service;

import com.example.scm.entity.Supplier;
import com.example.scm.repository.SupplierRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public SupplierService(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    public List<Supplier> findAll() { return supplierRepository.findAll(); }

    public Supplier create(Supplier s) { return supplierRepository.save(s); }

    public Supplier update(Long id, Supplier s) {
        s.setId(id);
        return supplierRepository.save(s);
    }

    public void delete(Long id) { supplierRepository.deleteById(id); }

    public Optional<Supplier> authenticate(String email, String phone) {
        if (email == null || phone == null) return Optional.empty();
        return supplierRepository.findByEmailAndPhone(email, phone);
    }
}
