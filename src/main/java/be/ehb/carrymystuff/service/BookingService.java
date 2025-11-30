package be.ehb.carrymystuff.service;

import be.ehb.carrymystuff.Repository.BookingRepository;
import be.ehb.carrymystuff.Repository.UserRepository;
import be.ehb.carrymystuff.Repository.VehicleRepository;
import be.ehb.carrymystuff.models.Booking;
import be.ehb.carrymystuff.models.User;
import be.ehb.carrymystuff.models.Vehicle;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;

    public Booking createBooking(String customerEmail,
                                 Long vehicleId,
                                 String fromAddress,
                                 String toAddress,
                                 LocalDateTime moveDate) {

        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        User helper = vehicle.getHelper();

        Booking booking = Booking.builder()
                .customer(customer)
                .helper(helper)
                .vehicle(vehicle)
                .fromAddress(fromAddress)
                .toAddress(toAddress)
                .moveDate(moveDate)
                .status("PENDING")
                .build();

        return bookingRepository.save(booking);
    }

    public List<Booking> getBookingsForCustomer(String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        return bookingRepository.findByCustomerId(customer.getId());
    }

    public List<Booking> getBookingsForHelper(String helperEmail) {
        User helper = userRepository.findByEmail(helperEmail)
                .orElseThrow(() -> new RuntimeException("Helper not found"));
        return bookingRepository.findByHelperId(helper.getId());
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking updateStatus(Long bookingId, String status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(status);
        return bookingRepository.save(booking);
    }
    public Booking createBookingByAdmin(Long customerId, Long vehicleId,
                                        String fromAddress, String toAddress,
                                        LocalDateTime moveDate) {

        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setVehicle(vehicle);
        booking.setHelper(vehicle.getHelper());
        booking.setFromAddress(fromAddress);
        booking.setToAddress(toAddress);
        booking.setMoveDate(moveDate);
        booking.setStatus("PENDING");

        return bookingRepository.save(booking);
    }



}
