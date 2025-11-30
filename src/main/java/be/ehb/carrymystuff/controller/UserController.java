package be.ehb.carrymystuff.controller;

import be.ehb.carrymystuff.models.Booking;
import be.ehb.carrymystuff.models.Vehicle;
import be.ehb.carrymystuff.service.BookingService;
import be.ehb.carrymystuff.service.VehicleService;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@CrossOrigin
@PreAuthorize("hasRole('USER')")
public class UserController {

    private final VehicleService vehicleService;
    private final BookingService bookingService;

    // 🔍 Search vehicles by city (required) and optional type
    @GetMapping("/vehicles")
    public List<Vehicle> searchVehicles(
            @RequestParam("city") String city,
            @RequestParam(required = false) String type
    ) {
        if (type != null) {
            return vehicleService.searchByCityAndType(city, type);
        }
        return vehicleService.searchByCity(city);
    }

    // 🔍 Get ALL active vehicles (no filters)
    @GetMapping("/vehicles/all")
    public List<Vehicle> getAllActiveVehicles() {
        return vehicleService.getAllActive();
    }

    @Data
    public static class CreateBookingRequest {
        private Long vehicleId;
        @NotBlank private String fromAddress;
        @NotBlank private String toAddress;

        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        private LocalDateTime moveDate;
    }

    // Create a booking
    @PostMapping("/bookings")
    public Booking createBooking(@AuthenticationPrincipal UserDetails principal,
                                 @RequestBody CreateBookingRequest req) {
        return bookingService.createBooking(
                principal.getUsername(),
                req.getVehicleId(),
                req.getFromAddress(),
                req.getToAddress(),
                req.getMoveDate()
        );
    }

    // View own bookings
    @GetMapping("/bookings")
    public List<Booking> myBookings(@AuthenticationPrincipal UserDetails principal) {
        return bookingService.getBookingsForCustomer(principal.getUsername());
    }


}
