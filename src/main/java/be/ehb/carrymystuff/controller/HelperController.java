package be.ehb.carrymystuff.controller;

import be.ehb.carrymystuff.DTO.AddVehicleRequest;
import be.ehb.carrymystuff.DTO.UpdateVehicleRequest;
import be.ehb.carrymystuff.Repository.UserRepository;
import be.ehb.carrymystuff.Repository.VehicleRepository;
import be.ehb.carrymystuff.models.Booking;
import be.ehb.carrymystuff.models.User;
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
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;






    // 2) Helper adds a new vehicle
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



    // -------------------------
    // 3) Helper sees their vehicles
    // -------------------------
        @GetMapping("/vehicles")
        public List<Vehicle> myVehicles(@AuthenticationPrincipal UserDetails principal) {
            return vehicleService.getVehiclesForHelper(principal.getUsername());
    }
    // helper update één van zijn voertuigen
    @PatchMapping("/vehicles/{id}")
    public Vehicle updateMyVehicle(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody UpdateVehicleRequest req) {

        return vehicleService.updateHelperVehicle(
                principal.getUsername(),
                id,
                req
        );
    }

    // -------------------------
    // 4) Helper updates OWN vehicle
    // -------------------------




    @GetMapping("/bookings")
    public List<Booking> myBookings(@AuthenticationPrincipal UserDetails principal) {
        return bookingService.getBookingsForHelper(principal.getUsername());
    }

}
