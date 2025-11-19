package be.ehb.carrymystuff.Repository;

import be.ehb.carrymystuff.models.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByCityAndActiveTrue(String city);
    List<Vehicle> findByHelperId(Long helperId);
}