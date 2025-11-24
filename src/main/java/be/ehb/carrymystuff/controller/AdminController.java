package be.ehb.carrymystuff.controller;

import be.ehb.carrymystuff.DTO.AdminBookingRequest;
import be.ehb.carrymystuff.Repository.UserRepository;
import be.ehb.carrymystuff.Repository.VehicleRepository;
import be.ehb.carrymystuff.models.Booking;
import be.ehb.carrymystuff.models.Role;
import be.ehb.carrymystuff.models.User;
import be.ehb.carrymystuff.models.Vehicle;
import be.ehb.carrymystuff.service.AdminUserService;
import be.ehb.carrymystuff.service.BookingService;
import be.ehb.carrymystuff.service.VehicleService;
import lombok.Data;
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
    private final AdminUserService adminUserService;

    // --- USERS ---

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return adminUserService.getAllUsers();
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
    }

    @PostMapping("/add-users")
    public Map<String, String> createUser(@RequestBody User user) {
        userRepository.save(user);
        return Map.of("message", "User created");
    }

    @Data
    public static class UpdateUserRoleRequest {
        private Role role; // USER, HELPER, ADMIN
    }

    @PatchMapping("/users/{id}/role")
    public User updateUserRole(@PathVariable Long id,
                               @RequestBody UpdateUserRoleRequest req) {
        return adminUserService.updateUserRole(id, req.getRole());
    }

    // --- VEHICLES ---

    // ✅ only ONE GET /vehicles now
    @GetMapping("/vehicles")
    public List<Vehicle> getAllVehicles() {
        return vehicleService.getAllVehicles();
    }

    @DeleteMapping("/vehicles/{id}")
    public void deleteVehicle(@PathVariable Long id) {
        vehicleRepository.deleteById(id);
    }

    @Data
    public static class UpdateVehicleActiveRequest {
        private boolean active;
    }

    @PatchMapping("/vehicles/{id}/active")
    public Vehicle updateVehicleActive(@PathVariable Long id,
                                       @RequestBody UpdateVehicleActiveRequest req) {
        // use Lombok getter (isActive())
        return vehicleService.activateVehicle(id, req.isActive());
    }

    // --- BOOKINGS ---

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
                customer.getEmail(),    // service expects email
                request.getVehicleId(),
                request.getFromAddress(),
                request.getToAddress(),
                request.getMoveDate()
        );

        return Map.of("message", "Booking created");
    }

    // you’re using POST here, that’s fine with your frontend
    @PostMapping("/bookings/{id}/status")
    public Booking updateBookingStatus(@PathVariable Long id,
                                       @RequestParam("status") String status) {
        return bookingService.updateStatus(id, status);
    }
}
