package be.ehb.carrymystuff.controller;

import be.ehb.carrymystuff.Repository.UserRepository;
import be.ehb.carrymystuff.Repository.VehicleRepository;
import be.ehb.carrymystuff.models.Booking;
import be.ehb.carrymystuff.models.User;
import be.ehb.carrymystuff.models.Vehicle;
import be.ehb.carrymystuff.service.BookingService;
import be.ehb.carrymystuff.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final BookingService bookingService;
    private final VehicleService vehicleService;

    // Users
    @GetMapping("/users")
    public List<User> allUsers() {
        return userRepository.findAll();
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
    }

    // Vehicles
    @GetMapping("/vehicles")
    public List<Vehicle> allVehicles() {
        return vehicleRepository.findAll();
    }

    @DeleteMapping("/vehicles/{id}")
    public void deleteVehicle(@PathVariable Long id) {
        vehicleRepository.deleteById(id);
    }

    @PostMapping("/vehicles/{id}/active")
    public Vehicle setVehicleActive(@PathVariable Long id,
                                    @RequestParam("active") boolean active) {
        return vehicleService.activateVehicle(id, active);
    }

    // Bookings
    @GetMapping("/bookings")
    public List<Booking> allBookings() {
        return bookingService.getAllBookings();
    }

    @PostMapping("/bookings/{id}/status")
    public Booking updateBookingStatus(@PathVariable Long id,
                                       @RequestParam("status") String status) {
        return bookingService.updateStatus(id, status);
    }
}
