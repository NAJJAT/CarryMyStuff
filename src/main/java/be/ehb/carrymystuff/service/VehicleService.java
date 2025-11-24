package be.ehb.carrymystuff.service;

import be.ehb.carrymystuff.Repository.UserRepository;
import be.ehb.carrymystuff.Repository.VehicleRepository;
import be.ehb.carrymystuff.models.User;
import be.ehb.carrymystuff.models.Vehicle;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    public Vehicle addVehicleForHelper(String helperEmail, Vehicle vehicleData) {
        User helper = userRepository.findByEmail(helperEmail)
                .orElseThrow(() -> new RuntimeException("Helper not found"));

        vehicleData.setHelper(helper);
        vehicleData.setActive(false);  // helper must activate or admin
        return vehicleRepository.save(vehicleData);
    }

    public List<Vehicle> getVehiclesForHelper(String helperEmail) {
        User helper = userRepository.findByEmail(helperEmail)
                .orElseThrow(() -> new RuntimeException("Helper not found"));
        return vehicleRepository.findByHelperId(helper.getId());
    }
    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }
    public Vehicle activateVehicle(Long id, boolean active) {
        Vehicle v = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        v.setActive(active);
        return vehicleRepository.save(v);
    }

    // 🔍 Search by city (only active, case-insensitive)
    public List<Vehicle> searchByCity(String city) {
        return vehicleRepository.findByCityIgnoreCaseAndActiveTrue(city);
    }

    // 🔍 Search by city + type (only active, case-insensitive)
    public List<Vehicle> searchByCityAndType(String city, String type) {
        return vehicleRepository.findByCityIgnoreCaseAndTypeIgnoreCaseAndActiveTrue(city, type);
    }

    // 🔍 Get ALL active vehicles
    public List<Vehicle> getAllActive() {
        return vehicleRepository.findByActiveTrue();
    }
}
