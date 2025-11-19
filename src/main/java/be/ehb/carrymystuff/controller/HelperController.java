package be.ehb.carrymystuff.controller;

import be.ehb.carrymystuff.models.Booking;
import be.ehb.carrymystuff.models.Vehicle;
import be.ehb.carrymystuff.service.BookingService;
import be.ehb.carrymystuff.service.VehicleService;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/helper")
@RequiredArgsConstructor
@CrossOrigin
@PreAuthorize("hasRole('HELPER')")
public class HelperController {

    private final VehicleService vehicleService;
    private final BookingService bookingService;

    @Data
    public static class AddVehicleRequest {
        @NotBlank private String type;
        @NotBlank private String description;
        private Integer capacityKg;
        @NotBlank private String city;
        @NotBlank private String licensePlate;
    }

    @PostMapping("/vehicles")
    public Vehicle addVehicle(@AuthenticationPrincipal UserDetails principal,
                              @RequestBody AddVehicleRequest req) {
        Vehicle v = Vehicle.builder()
                .type(req.getType())
                .description(req.getDescription())
                .capacityKg(req.getCapacityKg())
                .city(req.getCity())
                .licensePlate(req.getLicensePlate())
                .build();

        return vehicleService.addVehicleForHelper(principal.getUsername(), v);
    }

    @GetMapping("/vehicles")
    public List<Vehicle> myVehicles(@AuthenticationPrincipal UserDetails principal) {
        return vehicleService.getVehiclesForHelper(principal.getUsername());
    }

    @GetMapping("/bookings")
    public List<Booking> myBookings(@AuthenticationPrincipal UserDetails principal) {
        return bookingService.getBookingsForHelper(principal.getUsername());
    }
}
