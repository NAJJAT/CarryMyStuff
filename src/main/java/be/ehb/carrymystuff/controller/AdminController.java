package be.ehb.carrymystuff.controller;

import be.ehb.carrymystuff.DTO.AdminBookingRequest;
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
import java.util.Map;

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
/*
    @PostMapping("/vehicles/{id}/active")
    public Vehicle setVehicleActive(@PathVariable Long id,
                                    @RequestParam("active") boolean active) {
        return vehicleService.activateVehicle(id, active);
    }
*/

    @PostMapping("/vehicles/{id}/active")
    public Map<String, String> setVehicleActive(@PathVariable Long id,
                                                @RequestParam("active") boolean active) {

        vehicleService.activateVehicle(id, active);

        String statusMessage = active ? "Vehicle activated" : "Vehicle deactivated";

        return Map.of("message", statusMessage);
    }

    // Bookings
    @GetMapping("/bookings")
    public List<Booking> allBookings() {
        return bookingService.getAllBookings();
    }


    @PostMapping("/add-bookings")
    public Map<String, String> createBooking(@RequestBody AdminBookingRequest request) {

        // Convert customerId → customerEmail
        User customer = userRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        bookingService.createBooking(
                customer.getEmail(),            // ✔ send email (service expects email)
                request.getVehicleId(),
                request.getFromAddress(),
                request.getToAddress(),
                request.getMoveDate()
        );

        return Map.of("message", "Booking created");
    }


    @PostMapping("/bookings/{id}/status")
    public Booking updateBookingStatus(@PathVariable Long id,
                                       @RequestParam("status") String status) {
        return bookingService.updateStatus(id, status);
    }

    @PostMapping("/add-users")
    public Map<String, String> createUser(@RequestBody User user) {
        userRepository.save(user);
        return Map.of("message", "User created");
    }




}
