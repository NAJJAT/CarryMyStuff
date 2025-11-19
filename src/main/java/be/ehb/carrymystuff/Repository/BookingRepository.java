package be.ehb.carrymystuff.Repository;

import be.ehb.carrymystuff.models.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomerId(Long customerId);
    List<Booking> findByHelperId(Long helperId);
}
